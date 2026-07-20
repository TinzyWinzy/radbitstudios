export type CommercialPage = {
  slug: string; name: string; title: string; metaDescription: string; searchIntent: string;
  intro: string; problem: string; outcomes: string[]; capabilities: string[]; exclusions: string[];
  process: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
  tool?: { label: string; href: string };
};

const process = [
  { title: "Diagnose", description: "Map the current workflow, actors, delays, data and failure points before choosing technology." },
  { title: "Design", description: "Define the smallest reliable system, its integrations, ownership boundaries and measurable acceptance criteria." },
  { title: "Build and validate", description: "Deliver in reviewable stages, test with real users and document the operating procedure before handover." },
];

export const SERVICE_PAGES: CommercialPage[] = [
  {
    slug: "custom-software-development", name: "Custom Software Development", title: "Custom Software Development in Zimbabwe",
    metaDescription: "Custom software for Zimbabwean businesses that have outgrown spreadsheets, disconnected tools and manual administration.", searchIntent: "Commercial investigation",
    intro: "For operations whose rules, approvals and customer journey do not fit an off-the-shelf product.", problem: "Work is often duplicated across WhatsApp, spreadsheets and paper. Managers cannot see current status, customers wait for answers, and staff become the integration layer between tools.",
    outcomes: ["One reliable operational record", "Faster quotations and approvals", "Clear user roles and audit trails", "Less repeated data entry"],
    capabilities: ["Workflow and database design", "Customer and staff portals", "Role-based access", "Payments and third-party integrations", "Reporting and operational dashboards"],
    exclusions: ["A fixed price before requirements are diagnosed", "Claims that software alone will repair a broken operating process", "Production claims for prototypes that have not been deployed"], process,
    faq: [
      { question: "When is custom software justified?", answer: "When a recurring, valuable workflow cannot be handled safely or efficiently by configurable software and the cost of the current process is understood." },
      { question: "Who owns the system?", answer: "Ownership, source-code access, infrastructure credentials and third-party licences are defined explicitly in the written scope." },
      { question: "Can Radbit replace a spreadsheet gradually?", answer: "Yes. A staged migration is often safer than replacing every process at once." },
    ], related: [{ label: "Business process automation", href: "/services/business-process-automation" }, { label: "SME systems", href: "/solutions/small-medium-businesses" }, { label: "Sentinel Zero security research", href: "/research/sentinel-zero" }], tool: { label: "Estimate a software project", href: "/resources/tools/zimbabwe-website-cost-calculator" },
  },
  {
    slug: "web-application-development", name: "Web Application Development", title: "Web Application Development for Operational Workflows",
    metaDescription: "Secure web applications, portals and dashboards built around real business workflows in Zimbabwe and Southern Africa.", searchIntent: "Commercial investigation",
    intro: "Browser-based systems for teams and customers who need shared access without desktop installations.", problem: "A marketing website can collect an enquiry, but it cannot manage the approvals, records, roles and transactions that follow.",
    outcomes: ["Access across modern devices", "Shared workflow visibility", "Controlled permissions", "A maintainable platform for future modules"], capabilities: ["Responsive application interfaces", "Authentication and permissions", "API and payment integrations", "Admin consoles", "Testing and deployment documentation"],
    exclusions: ["A web application being presented as automatically secure", "Native-device capability where browsers cannot meet the requirement", "Unlimited scope hidden inside a fixed package"], process,
    faq: [{ question: "How is a web app different from a website?", answer: "A website primarily presents information. A web application stores state and enables users to complete operational tasks." }, { question: "Will it work on mobile?", answer: "Mobile use is designed and tested explicitly; responsive design alone does not guarantee a usable field workflow." }, { question: "Can it integrate with existing systems?", answer: "Yes where stable APIs, data access and permission from the system owner are available." }],
    related: [{ label: "Progressive Web Apps", href: "/services/progressive-web-app-development" }, { label: "Customer portals", href: "/insights/custom-business-systems" }],
  },
  {
    slug: "ai-workflow-automation", name: "AI and Workflow Automation", title: "Practical AI and Workflow Automation for African Businesses",
    metaDescription: "AI automation for enquiries, documents and internal workflows—with human review, evidence boundaries and measurable operating goals.", searchIntent: "Commercial investigation",
    intro: "Applied AI for bounded tasks where inputs, risks and review responsibilities can be defined.", problem: "Teams lose time classifying enquiries, searching documents and repeating standard responses, but indiscriminate automation can create confident errors at scale.",
    outcomes: ["Faster information retrieval", "Consistent first-pass classification", "Human attention directed to exceptions", "Traceable review and escalation"], capabilities: ["Document retrieval and RAG", "Enquiry triage", "Structured extraction", "Human-in-the-loop approvals", "Evaluation and monitoring"],
    exclusions: ["Guaranteed factual accuracy", "Autonomous decisions in high-risk contexts", "Invented training data, results or citations"], process,
    faq: [{ question: "What should a business automate first?", answer: "A high-volume, repeatable and low-risk task with examples of correct outputs and a clear human escalation path." }, { question: "Does AI replace staff?", answer: "The sensible design usually removes repetitive handling and makes staff responsible for exceptions and judgment." }, { question: "How are hallucinations controlled?", answer: "Through constrained sources, retrieval, validation rules, citations, evaluation sets and mandatory review where consequences are material." }],
    related: [{ label: "AI research cluster", href: "/insights/ai-for-african-businesses" }, { label: "Recruitment systems", href: "/solutions/recruitment-domestic-staffing" }], tool: { label: "Assess automation readiness", href: "/resources/tools/business-automation-readiness" },
  },
  {
    slug: "progressive-web-app-development", name: "Progressive Web App Development", title: "Progressive Web App Development for iOS and Android",
    metaDescription: "Installable, mobile-first Progressive Web Apps with offline workflows, dependable syncing and push-notification planning.", searchIntent: "Solution comparison",
    intro: "Installable web applications for workflows that benefit from broad device reach and selective offline capability.", problem: "Field teams and customers may have inconsistent connectivity, limited storage or no appetite for separate app-store installations.",
    outcomes: ["One application across major mobile platforms", "Installable experience", "Defined offline behaviour", "Lower distribution friction"], capabilities: ["Web app manifest and install flow", "Service-worker caching", "Offline write queue design", "iOS and Android testing", "Push-notification architecture"],
    exclusions: ["Identical browser support on every OS version", "Unlimited offline access to uncached data", "A PWA recommendation when native hardware access is essential"], process,
    faq: [{ question: "Do PWAs work on iPhone?", answer: "Yes, but installation, background execution and notification behaviour differ by iOS version and must be tested on supported devices." }, { question: "Can a PWA work offline?", answer: "Selected screens and writes can work offline when caching, conflict handling and sync rules are designed deliberately." }, { question: "When is native better?", answer: "Native may be better for deep hardware integration, sustained background processing or app-store-specific distribution requirements." }],
    related: [{ label: "Web application development", href: "/services/web-application-development" }, { label: "PWA assessment", href: "/resources/tools/pwa-suitability-assessment" }], tool: { label: "Check PWA suitability", href: "/resources/tools/pwa-suitability-assessment" },
  },
  {
    slug: "business-process-automation", name: "Business Process Automation", title: "Business Process Automation Without Hiding Operational Problems",
    metaDescription: "Map and automate quotations, approvals, customer follow-up and recurring administration with clear controls and ownership.", searchIntent: "Commercial investigation",
    intro: "Workflow improvement for businesses whose delays come from hand-offs, repeated entry and unclear responsibility.", problem: "Automating an undefined process makes its defects move faster. The operating rule and exception path must be understood first.",
    outcomes: ["Shorter processing cycles", "Visible ownership", "Fewer missed follow-ups", "Consistent records and escalation"], capabilities: ["Process mapping", "Rules and approval design", "Notifications and reminders", "Integration with operational systems", "Audit trails and exception queues"],
    exclusions: ["Automation before process ownership is agreed", "Removing human judgment from material decisions", "Benefits stated without a measurable baseline"], process,
    faq: [{ question: "Which processes are good candidates?", answer: "Frequent, rule-based processes with stable inputs, measurable delay and clear exceptions." }, { question: "Can WhatsApp remain part of the workflow?", answer: "Yes, but critical decisions and records should be captured in the system of record." }, { question: "How is return measured?", answer: "Compare cycle time, handling effort, leakage and error rates before and after deployment." }],
    related: [{ label: "Custom software", href: "/services/custom-software-development" }, { label: "Automation assessment", href: "/resources/tools/business-automation-readiness" }], tool: { label: "Assess automation readiness", href: "/resources/tools/business-automation-readiness" },
  },
  {
    slug: "google-business-profile-setup", name: "Google Business Profile Setup", title: "Google Business Profile Setup for Zimbabwean Businesses",
    metaDescription: "Set up and improve a Google Business Profile with correct categories, service information, verification planning and review workflows.", searchIntent: "Transactional local SEO",
    intro: "Local search setup for businesses that need customers to find, verify and contact the correct operation.", problem: "Incomplete categories, inconsistent contact details and unmanaged profiles reduce trust and can route customers to the wrong information.",
    outcomes: ["Accurate local business information", "A structured verification plan", "Clear services and contact routes", "A repeatable review-response process"], capabilities: ["Profile and ownership audit", "Category and service configuration", "Contact and location consistency", "Photo and update guidance", "Review workflow documentation"],
    exclusions: ["Guaranteed rankings or verification approval", "Fabricated reviews", "Keyword stuffing business names or violating platform rules"], process,
    faq: [{ question: "Can Radbit guarantee verification?", answer: "No. Google controls verification methods and approval. Radbit prepares accurate evidence and guides the process." }, { question: "Does a profile replace a website?", answer: "No. The profile supports discovery; a website provides controlled, detailed and indexable information." }, { question: "Should service-area businesses show an address?", answer: "Only where the business is eligible and the location complies with Google’s current guidelines." }],
    related: [{ label: "SEO and digital visibility", href: "/services/seo-digital-visibility" }, { label: "GBP checklist", href: "/resources/tools/google-business-profile-checklist" }], tool: { label: "Run the GBP checklist", href: "/resources/tools/google-business-profile-checklist" },
  },
  {
    slug: "seo-digital-visibility", name: "SEO and Digital Visibility", title: "SEO and Digital Visibility for Operationally Credible Businesses",
    metaDescription: "Technical SEO, commercial pages and evidence-led content for Zimbabwean businesses seeking qualified organic enquiries.", searchIntent: "Commercial investigation",
    intro: "Search visibility built from useful pages, technical accessibility and credible answers—not volume publishing.", problem: "A business may have a polished site but no page that precisely answers what buyers search, no crawlable structure and no evidence supporting its claims.",
    outcomes: ["Crawlable commercial architecture", "Clear search-intent coverage", "Measurable enquiry paths", "A maintainable editorial system"], capabilities: ["Technical SEO review", "Service and industry architecture", "Content clusters", "Structured data and internal links", "Search Console measurement"],
    exclusions: ["Guaranteed rankings", "Invented authority or client outcomes", "Thin pages produced only to target keyword variations"], process,
    faq: [{ question: "How long does SEO take?", answer: "Timing varies by competition, site condition, authority and publishing consistency. Early technical changes can be measured before durable ranking gains." }, { question: "Is a blog enough?", answer: "No. Commercial pages, useful tools, internal linking, technical health and credible evidence work together." }, { question: "What should be measured?", answer: "Qualified queries, relevant landing-page impressions, clicks, conversions and assisted enquiries—not traffic alone." }],
    related: [{ label: "Radbit Insights", href: "/insights" }, { label: "Google Business Profile", href: "/services/google-business-profile-setup" }],
  },
];

function industry(slug: string, name: string, title: string, metaDescription: string, problem: string, capabilities: string[], tool?: CommercialPage["tool"]): CommercialPage {
  return { slug, name, title, metaDescription, searchIntent: "Industry solution investigation", intro: `Operational systems designed around the real hand-offs, records and customer expectations in ${name.toLowerCase()}.`, problem,
    outcomes: ["A shared operational record", "Faster customer response", "Visible work status", "Less dependence on individual memory"], capabilities,
    exclusions: ["Claims that an industry template fits every operator", "Automation of undocumented or unsafe practice", "Deployment claims before real users have validated the workflow"], process,
    faq: [
      { question: `Does Radbit provide an off-the-shelf ${name.toLowerCase()} platform?`, answer: "Radbit begins with reusable system patterns, then confirms the actual workflow and scope. A demonstration is not represented as a deployed client system." },
      { question: "Can the system work with WhatsApp?", answer: "Yes. WhatsApp can remain a contact channel while the application records enquiries, status, ownership and follow-up." },
      { question: "How does an engagement start?", answer: "With a short workflow assessment that identifies the bottleneck, current tools, users, risk and a measurable first release." },
    ], related: [{ label: "Custom software development", href: "/services/custom-software-development" }, { label: "Industry systems research", href: "/insights/industry-systems" }], tool };
}

export const INDUSTRY_PAGES: CommercialPage[] = [
  industry("hospitality-guest-houses", "Hospitality and guest houses", "Booking and Guest Operations Systems for Zimbabwean Hospitality", "Booking, enquiry and guest-management systems for guest houses, lodges and hospitality operators in Zimbabwe.", "Enquiries arrive across calls, WhatsApp and booking channels. Availability is checked manually, follow-up is inconsistent and double-booking risk grows.", ["Enquiry and booking pipeline", "Availability and rate controls", "Guest communication records", "Payment-status tracking", "Operational handover views"], { label: "Check booking readiness", href: "/resources/tools/booking-system-readiness" }),
  industry("recruitment-domestic-staffing", "Recruitment and domestic staffing", "Recruitment Systems for Domestic Staffing and Placement Agencies", "Applicant, client, screening and placement workflows for recruitment and domestic staffing agencies.", "Candidate records, screening evidence and client requirements become scattered across messages and files, making matching slow and auditability weak.", ["Candidate intake and profiles", "Screening and document status", "Client vacancy requirements", "Matching and shortlist workflow", "Placement follow-up records"]),
  industry("agriculture-agribusiness", "Agriculture and agribusiness", "Farm and Agribusiness Management Systems", "Operational software for farm records, field activity, inputs, sales and agribusiness coordination.", "Field activity, input use and sales records often reach managers late, limiting cost visibility and timely operational decisions.", ["Field and activity records", "Input and stock tracking", "Harvest and sales records", "Role-specific mobile workflows", "Offline-first data capture"]),
  industry("solar-energy", "Solar and energy", "Sales and Installation Systems for Solar Companies", "Lead, site survey, quotation, installation and after-sales systems for solar and energy businesses.", "Solar enquiries require technical qualification, site information and product choices. Slow hand-offs lead to delayed quotations and lost buyer confidence.", ["Lead qualification", "Site-survey capture", "Quotation workflow", "Installation scheduling", "Warranty and service records"]),
  industry("construction-property-services", "Construction and property services", "Construction Intake and Property Service Systems", "Project intake, quotation, scheduling and customer-status systems for construction and property service teams.", "Project details change across site visits, calls and messages. Scope ambiguity then affects estimates, scheduling and customer expectations.", ["Project intake and requirements", "Site evidence and document capture", "Estimate and variation tracking", "Work scheduling", "Customer progress portal"]),
  industry("mining-technical-operations", "Mining and technical operations", "Operational Systems for Mining and Technical Service Teams", "Controlled work orders, inspections, assets and field records for mining and technical operations.", "Technical work generates inspection, asset and safety records that must remain attributable, current and available beyond one employee’s device.", ["Work orders and assignment", "Inspection and field forms", "Asset and maintenance records", "Evidence attachments", "Audit and escalation history"]),
  industry("education-training", "Education and training", "Training Administration and Learner Systems", "Enrolment, scheduling, learner records and communication systems for education and training providers.", "Enrolment, payments, attendance and learner communication are often managed separately, creating avoidable reconciliation and response work.", ["Course and cohort management", "Enrolment and payment status", "Attendance and completion records", "Learner communication", "Certificate workflow"]),
  industry("small-medium-businesses", "Small and medium businesses", "Practical Business Systems for Zimbabwean SMEs", "Quotation, customer, stock and workflow systems for growing Zimbabwean small and medium businesses.", "As an SME grows, its owner becomes the routing layer for quotations, customer questions, stock information and staff decisions.", ["Lead and customer records", "Quotations and approvals", "Stock or service tracking", "Staff task visibility", "Management reporting"], { label: "Assess automation readiness", href: "/resources/tools/business-automation-readiness" }),
];

export function getService(slug: string) { return SERVICE_PAGES.find(page => page.slug === slug); }
export function getIndustry(slug: string) { return INDUSTRY_PAGES.find(page => page.slug === slug); }
