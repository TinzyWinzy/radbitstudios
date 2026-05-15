# Radbit SME Hub: Planning & Features

This document outlines the strategic plan, feature set, and development phases for the Radbit SME Hub application.

## 🎯 Core User Goal

To empower Zimbabwean SME owners like Tafadzwa by providing a workforce of specialized AI agents and a supportive digital ecosystem that helps them automate tasks, structure their business, seize opportunities, and achieve sustainable growth.

---

##  Phases of Development

### ✅ Phase 0: Foundation & Core Features (Completed)

- **User Authentication:** Full implementation of Email/Password and Google OAuth sign-in.
- **Database & Security:** Firestore setup with collections for users, assessments, threads, and conversations. Initial `firestore.rules` created.
- **Digital Readiness Assessment:** Fully functional 15-question assessment with results saved to Firestore.
- **Dynamic Dashboard:** Personalized dashboard reflecting the user's latest assessment results.
- **Community & Messaging:** Real-time forum and direct messaging functionality.
- **Settings & History:** Profile management and a view for past assessment history.
- **UI/UX Overhaul:** Comprehensive redesign of the landing page and application layouts for a professional and intuitive user experience.

### ✅ Phase 1: Personalize AI & Save User Data (Completed)

- **Connected User Profile to AI Tools:** AI Toolkit and AI Mentor now use the user's profile for personalized responses.
- **Saved Budget Calculator Data:** Users can save and retrieve their budget data from Firestore.
- **Persisted Bookmarked Tenders:** Bookmarked articles are saved to the user's profile in Firestore.

### ⏳ Phase 2: Automate & Enhance Core Features (Upcoming)

1.  **Enable Template Downloads:**
    -   **Goal:** Make the document templates downloadable.
    -   **Action:** Create placeholder `.docx` and `.xlsx` files and place them in the `public/templates/` directory to enable the download links.

2.  **Implement Real-Time Assessment Benchmarking:**
    -   **Goal:** Provide users with a benchmark of their assessment scores against the platform average.
    -   **Action:** Create a scheduled Cloud Function that periodically aggregates all assessment data into a single `benchmarks` document in Firestore. The assessment results page will then read this document to display the user's score alongside the SME average.

3.  **Improve Tender/News Curation:**
    -   **Goal:** Move from manual URL input to a more automated, valuable feed.
    -   **Action:** Pre-define a set of trusted sources. The backend could periodically scrape these sites, and the AI flow would curate the content for all users, who can then filter it based on their profile's industry.

### 🚀 Phase 3: Polish & Deploy (Future)

1.  **Final UI/UX Review:**
    -   **Goal:** Ensure a polished, cohesive, and bug-free user experience across the entire application.
    -   **Action:** Conduct a full application walkthrough to identify and fix any remaining UI inconsistencies or usability issues.

2.  **Security Rule Deployment:**
    -   **Goal:** Secure the production database.
    -   **Action:** Final check and deployment of `firestore.rules` via the Firebase Console.

### 🤖 Phase 4: The Agent-Based Workforce (Future Vision)

- **Goal:** Transform the toolkit into a deployable team of specialized AI agents that users can manage from their dashboard.

- **Agents to Develop:**
    -   **Engineering Agents:**
        -   *Code Generation:* Create simple scripts or web pages.
        -   *Testing/QA:* Help test user-facing application flows.
        -   *DevOps/Deploy:* Assist with simple deployment tasks.
    -   **Design Agents:**
        -   *UI/UX Creation:* Generate wireframes or mockups for a new feature.
        -   *Brand Assets:* Create logos, color schemes, and social media banners.
    -   **Marketing Agents:**
        -   *Content Creation:* Write blog posts, ad copy, and product descriptions.
        -   *SEO/SEM:* Analyze keywords and suggest strategies for search engine marketing.
        -   *Social Media:* Schedule posts and generate content for social platforms.
    -   **Sales Agents:**
        -   *Lead Qualification:* Analyze inbound leads based on predefined criteria.
        -   *Outreach:* Draft cold-outreach emails or messages.
        -   *Demo Booking:* Integrate with a calendar to book demonstrations.
    -   **Support Agents:**
        -   *Documentation:* Help write product documentation or FAQs.
        -   *Ticket Triage:* Automatically categorize incoming support tickets.
        -   *Chat Support:* Provide initial responses to customer queries.
    -   **Data Analyst Agent:**
        -   *Analytics:* Interpret sales data or user behavior and generate reports.
