export const ARTICLE_CATEGORIES = [
  "Business Systems",
  "AI for Business",
  "Web Development in Zimbabwe",
  "Industry Solutions",
  "Operational Automation",
  "Digital Visibility",
  "Case Studies",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const CONTENT_CLUSTERS = [
  {
    slug: "custom-business-systems",
    name: "Custom Business Systems",
    pillarTitle: "Custom Business Systems for Zimbabwean Companies",
    description: "How purpose-built systems replace fragmented spreadsheets, slow quotations and manual customer administration.",
    topics: [
      "When does a business need a custom web application?",
      "Website versus web application",
      "How business process automation works",
      "How customer portals reduce administrative work",
      "How quotation systems improve response speed",
      "Signs your business has outgrown spreadsheets",
    ],
  },
  {
    slug: "ai-for-african-businesses",
    name: "AI for African Businesses",
    pillarTitle: "Practical AI Automation for African Businesses",
    description: "A grounded guide to where AI improves enquiry handling and document workflows—and where it does not.",
    topics: [
      "How AI can automate customer enquiries",
      "What RAG means for business document systems",
      "AI lead qualification for small businesses",
      "Limitations of AI automation",
      "How much AI automation costs",
      "When a business should not use AI",
    ],
  },
  {
    slug: "web-development-zimbabwe",
    name: "Web Development in Zimbabwe",
    pillarTitle: "Website and Web Application Development in Zimbabwe",
    description: "Commercial guidance for choosing, costing and operating websites and web applications in Zimbabwe.",
    topics: [
      "How much does a website cost in Zimbabwe?",
      "How much does a web application cost?",
      "Why a business does not appear on Google",
      "Google Business Profile versus Facebook Page",
      "Progressive Web App versus native mobile app",
      "How to choose a web developer in Zimbabwe",
    ],
  },
  {
    slug: "industry-systems",
    name: "Industry Systems",
    pillarTitle: "Industry-Specific Business Systems",
    description: "Operational patterns for hospitality, recruitment, agriculture, solar, construction and service companies.",
    topics: [
      "Booking systems for guest houses",
      "Recruitment systems for maid agencies",
      "Sales systems for solar companies",
      "Farm management systems",
      "Construction project intake systems",
      "Customer portals for service businesses",
    ],
  },
] as const;

export type ContentClusterSlug = (typeof CONTENT_CLUSTERS)[number]["slug"];

export const SERVICES = [
  "Custom Software Development", "Web Application Development", "AI and Workflow Automation",
  "Progressive Web App Development", "Business Process Automation", "Google Business Profile Setup",
  "SEO and Digital Visibility",
] as const;

export const INDUSTRIES = [
  "Hospitality and Guest Houses", "Recruitment and Domestic Staffing", "Agriculture and Agribusiness",
  "Solar and Energy", "Construction and Property Services", "Mining and Technical Operations",
  "Education and Training", "Small and Medium Businesses",
] as const;
