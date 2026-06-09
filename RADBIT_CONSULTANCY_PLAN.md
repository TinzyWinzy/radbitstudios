# Radbit Consultancy — Unified Platform Plan

---

## Current State Assessment

### Problems Identified

1. **Pricing + Consultancy are disconnected** — `/pricing` (server component, `mailto:` links) and `/consultancy` (client component with lead form) overlap heavily. No unified pathway.

2. **No differentiation between individuals vs businesses** — A freelancer wanting a $150 site sees ERP pricing, enterprise tiers, cybersecurity audits — overwhelming noise.

3. **No project/progress tracking** — Once a lead submits a form, there is zero feedback loop. No client portal, no status updates, no visibility.

4. **Admin has minimal insight into clients** — `/dashboard/admin` shows only total users/assessments/threads. No client pipeline, no project states, no onboarding completion rates.

5. **Onboarding is generic** — `OnboardingWizard` only checks profile completeness + assessment. It doesn't adapt to what the user actually wants (website? ERP? consulting?).

6. **Notifications exist but aren't tied to projects** — `notifications-service.ts` has the infrastructure but no project-level use.

---

## Proposed Architecture

```
                    ┌─────────────────────────────────┐
                    │        Marketing Site            │
                    │  /solutions (merged pricing +    │
                    │   consultancy)                   │
                    │  /solutions/web                  │
                    │  /solutions/consulting           │
                    │  /solutions/ai-platform          │
                    └──────────┬──────────────────────┘
                               │
                    ┌──────────▼──────────────────────┐
                    │     AI Onboarding Engine         │
                    │  - Determines user persona        │
                    │  - Generates dynamic checklist    │
                    │  - Routes to right path           │
                    └──────────┬──────────────────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                  │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌───────▼────────┐
    │ Individual     │ │ SME Owner    │ │ Enterprise     │
    │ Path           │ │ Path         │ │ Path           │
    │ (website,      │ │ (assessment, │ │ (consultation, │
    │  brand, fast)  │ │  toolkit,    │ │  custom quote) │
    │                │ │  tenders)    │ │                │
    └─────────┬──────┘ └──────┬───────┘ └───────┬────────┘
              │               │                 │
              └───────────────┼─────────────────┘
                              │
                    ┌─────────▼────────────────────────┐
                    │      Client Dashboard             │
                    │  - Onboarding checklist (AI-gen)  │
                    │  - Project status tracker         │
                    │  - Notifications (real-time)      │
                    │  - Document uploads               │
                    │  - Task timeline                  │
                    └─────────┬────────────────────────┘
                              │
                    ┌─────────▼────────────────────────┐
                    │      Admin Dashboard              │
                    │  - Client pipeline (kanban)       │
                    │  - Project progress per client    │
                    │  - Onboarding completion metrics  │
                    │  - Lead source analytics          │
                    └───────────────────────────────────┘
```

---

## User Personas & Stories

### Persona 1: Tariro (Individual / Freelancer)
- Wants a simple 1-page website for her catering business
- Budget: $150–$400
- Tech comfort: Low
- Pain point: "I don't know what I need"

**User Stories:**
- As Tariro, I want to answer a few simple questions so the system can tell me what service fits my needs.
- As Tariro, I want a clear checklist of what I need to provide (content, photos, domain) so I know what's expected.
- As Tariro, I want to see my project status (Design → Review → Launch) so I know when my site will go live.
- As Tariro, I want to receive WhatsApp notifications when my designer needs feedback from me.

### Persona 2: Farai (SME Owner)
- Runs a manufacturing business with 15 employees
- Needs a website + ERP system + tender applications
- Budget: $2,000–$10,000
- Tech comfort: Medium

**User Stories:**
- As Farai, I want a single dashboard where I can see all my ongoing projects (web, ERP, tenders) so I'm not chasing emails.
- As Farai, I want an AI-generated readiness assessment to identify my biggest business gaps.
- As Farai, I want the system to recommend the right package based on my assessment results.
- As Farai, I want to approve milestones and see what's blocking progress.

### Persona 3: Chenai (Admin / Consultant)
- Manages client projects at Radbit
- Needs visibility into all active engagements

**User Stories:**
- As Chenai, I want a kanban view of all client projects (Lead → Onboarding → Design → Development → Review → Live) so I can manage capacity.
- As Chenai, I want to see each client's onboarding checklist completion status so I know who needs a nudge.
- As Chenai, I want to assign tasks and set deadlines visible to the client.
- As Chenai, I want to see lead source analytics (which marketing channels drive the best clients).

### Persona 4: Tafadzwa (Enterprise Client)
- Needs a custom web application + ongoing maintenance
- Budget: $10,000+
- Needs formal proposals and SLAs

**User Stories:**
- As Tafadzwa, I want to submit a detailed RFP through the platform so my requirements are captured precisely.
- As Tafadzwa, I want a dedicated project timeline with milestones and deliverables.
- As Tafadzwa, I want to communicate with the project team through a central hub, not scattered emails.

---

## Data Model Additions

### `projects` collection (Firestore)
```
{
  id: string
  clientId: string (references users.uid)
  type: 'web' | 'erp' | 'consulting' | 'ai-platform' | 'custom'
  status: 'lead' | 'onboarding' | 'design' | 'development' | 'review' | 'live' | 'completed'
  packageName: string
  budget: number
  currency: 'USD' | 'ZiG'
  startedAt: timestamp
  deadline: timestamp | null
  completedAt: timestamp | null
  assignedTo: string (admin uid)
}
```

### `project_tasks` collection
```
{
  id: string
  projectId: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'review' | 'done'
  assignedTo: 'client' | 'admin'
  order: number
  createdAt: timestamp
  dueDate: timestamp | null
  completedAt: timestamp | null
}
```

### `onboarding_checklists` collection (AI-generated per user)
```
{
  id: string
  userId: string
  persona: 'individual' | 'sme' | 'enterprise'
  items: [
    {
      id: string
      task: string
      description: string
      type: 'info' | 'upload' | 'action' | 'decision'
      status: 'pending' | 'completed'
      link: string | null
    }
  ]
  generatedAt: timestamp
  completedAt: timestamp | null
}
```

### `client_notes` collection (admin-only)
```
{
  id: string
  clientId: string
  authorId: string
  content: string
  createdAt: timestamp
}
```

---

## Page Restructuring Plan

### Marketing Pages (Public)

| New Route | Merges | Purpose |
|---|---|---|
| `/solutions` | PRICING + CONSULTANCY | Unified entry point: persona selector (Individual / SME / Enterprise) → shows relevant packages + services |
| `/solutions/web` | From pricing "Web" tab | Website packages, simplified for individuals |
| `/solutions/consulting` | From consultancy page | Professional services with lead form |
| `/solutions/ai-platform` | From pricing "AI Platform" tab | SaaS subscription plans |
| `/solutions/erp` | From pricing "ERP" tab | ERP tiers + demo request |
| `/solutions/custom` | New | Custom project inquiry (for enterprise) |

### Authenticated App Routes

| New Route | Purpose |
|---|---|
| `/dashboard` | Client dashboard: project progress, checklist, notifications |
| `/dashboard/admin` | Admin dashboard: client pipeline, analytics, task management |
| `/dashboard/admin/clients/[id]` | Single client view: their projects, checklist, notes |
| `/dashboard/admin/clients/[id]/tasks` | Task assignment for a client project |
| `/dashboard/projects/[id]` | Single project detail (client view) |
| `/dashboard/onboarding` | Dedicated onboarding page with AI checklist |
| `/dashboard/checklist` | View/manage onboarding checklist items |

---

## AI Onboarding Engine

The AI onboarding engine replaces the generic 2-step wizard with a dynamic, persona-aware flow:

### Flow:

1. **Persona Detection** (3 questions):
   - "Are you looking for services for yourself/your business?" (Individual / Business)
   - "What best describes your need?" (Website / Online Store / Business Software / Consulting / Not Sure)
   - "What's your approximate budget?" (<$500 / $500-$2000 / $2000-$10000 / $10000+)

2. **AI Checklist Generation** (using existing Genkit flow architecture):
   - Input: persona, need, budget, industry, business name
   - Output: personalized checklist with tasks, links to relevant pages, estimated timeline
   - Example for Tariro (individual, website, $150):
     ```
     ☐ Choose your domain name
     ☐ Prepare 3-5 photos of your work
     ☐ Write your business description (AI can help)
     ☐ Choose your color scheme
     ☐ Review and approve design mockup
     ☐ Provide content for each page
     ☐ Final review before launch
     ```

3. **Checklist → Project**:
   - When user submits inquiry from solutions page → auto-creates a `project` (status: `lead`)
   - Admin sees it in their pipeline
   - User sees it in their dashboard with their checklist

4. **Progress Tracking**:
   - Each checklist item can be marked complete by client or admin
   - Admin can add tasks visible to client
   - Notifications triggered on status changes

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Create Firestore data models (`projects`, `project_tasks`, `onboarding_checklists`, `client_notes`)
2. Build `/solutions` page (merge pricing + consultancy content with persona selector)
3. Build AI onboarding engine (detect persona → generate checklist)
4. Wire lead form submission → auto-create project + checklist

### Phase 2: Client Dashboard (Week 2)
1. Build `/dashboard/projects/[id]` — single project view with status, tasks, timeline
2. Build `/dashboard/checklist` — AI-generated onboarding checklist with check-off
3. Add project progress indicator to main dashboard
4. Wire notifications for project/task updates

### Phase 3: Admin Workspace (Week 3)
1. Build client pipeline kanban on `/dashboard/admin`
2. Build `/dashboard/admin/clients/[id]` — single client view
3. Add task assignment and status management
4. Add client notes system
5. Add basic analytics (leads by source, conversion funnel, avg project duration)

### Phase 4: Polish & Integration (Week 4)
1. WhatsApp notifications for project milestones
2. Document upload for client deliverables
3. Email notifications for task assignments
4. Responsive design pass for all new pages

---

## Key Design Principles

1. **One entry point, many paths** — All roads lead through `/solutions` which intelligently routes users based on their needs.

2. **Progressive disclosure** — Don't show ERP pricing to someone who just wants a business card website. Show them the $150 option and a simple "what happens next" flow.

3. **Client visibility** — Every client should be able to log in and see exactly where their project stands without asking the consultant.

4. **Admin leverage** — AI handles the repetitive "what do you need?" discovery. Admin focuses on delivery.

5. **Notifications are first-class** — Status changes, task assignments, and feedback requests all trigger notifications (in-app + WhatsApp + email).

---

## Quick Wins (Can Start Today)

1. **Merge `/pricing` → `/solutions`** — Create a new page that presents pricing AND consultancy as a unified experience with persona-based filtering.

2. **Add persona selector to lead form** — One extra field on the consultancy form that tags leads as `individual` / `sme` / `enterprise`.

3. **Create Firestore `projects` collection** — Simple schema, start saving leads as projects so admin has visibility.

4. **Surface projects on admin dashboard** — Replace the current static stats with a list of recent projects and their statuses.
