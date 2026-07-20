export type ProofState = "Built" | "Demonstrated" | "Deployed" | "Validated" | "Contributed" | "Researched";

export const FOUNDER_EXPERIENCE = [
  { period: "2026–present", role: "Founder and full-stack product engineer", organisation: "Nexus Agronomics / Radbit Studios", evidence: "Requirements discovery, product definition, architecture, implementation, deployment and post-launch iteration across Radbit’s product and client work." },
  { period: "2024–2026", role: "Software developer and AI systems engineer", organisation: "Kumby Consulting", evidence: "Commercial platform delivery spanning Squarespace, Shopify and WordPress, alongside custom React, Next.js, Python, cloud and document-workflow assignments." },
  { period: "2022–2024", role: "Technical support engineer", organisation: "Tampa Medical College", evidence: "Administration and support across Sycamore, Nearpod, RunExam and Orbund for course, assessment and stakeholder workflows." },
  { period: "2021", role: "Penetration-testing intern", organisation: "Securetia", evidence: "Web application testing, OSINT, vulnerability assessment and remediation reporting." },
  { period: "2020", role: "Front-end developer intern", organisation: "Datalabs", evidence: "Responsive web interfaces and contribution to an internal user-activity dashboard." },
] as const;

export const PROJECT_EVIDENCE = [
  { name: "Radbit Studios", href: "https://radbitstudios.co.zw", sector: "Business systems", state: "Deployed" as ProofState, contribution: "Founder-led product, software, editorial and operational platform development.", evidence: "Public production domain and maintained application repository." },
  { name: "Cultural Coder", href: "https://culturalcoder.co.zw", sector: "Education technology", state: "Deployed" as ProofState, contribution: "Mobile-first technology product and public web presence grounded in Zimbabwean cultural context.", evidence: "Public production domain; product implementation recorded in the founder’s project archive." },
  { name: "Traamand", href: "https://traamand.co.zw", sector: "Corporate services", state: "Deployed" as ProofState, contribution: "Service-led company website, responsive delivery and launch support.", evidence: "Public production domain." },
  { name: "Wobic", href: "https://wobic.co.zw", sector: "Business services", state: "Deployed" as ProofState, contribution: "Responsive business website with clear service and contact structure.", evidence: "Public production domain." },
  { name: "Unik Villa", href: "https://unikvilla.co.zw", sector: "Hospitality", state: "Deployed" as ProofState, contribution: "Hospitality presentation and booking-enquiry pathway.", evidence: "Public production domain." },
  { name: "City View Guest House", href: "https://cityviewguesthouse.co.zw", sector: "Hospitality", state: "Deployed" as ProofState, contribution: "Mobile-first property information and guest enquiry flow.", evidence: "Public production domain." },
  { name: "Nexus Agronomics", href: "https://nexusagronomics.co.zw", sector: "Agriculture", state: "Deployed" as ProofState, contribution: "Sector-focused venture and agronomy platform presence.", evidence: "Public production domain and founder venture record." },
  { name: "Sentinel Zero", href: "/research/sentinel-zero", sector: "Security research", state: "Researched" as ProofState, contribution: "Invariant-led vulnerability research workflow, validation tooling, proof-of-concept tests and remediation reporting.", evidence: "Private local research repository and dated audit artifacts. No claim of third-party acceptance, bounty payment or production exploitation." },
] as const;

export const PLATFORM_CONTRIBUTIONS = [
  { name: "Kumby Consulting", platform: "Squarespace", state: "Contributed" as ProofState },
  { name: "Jewels by Alice", platform: "Squarespace", state: "Contributed" as ProofState },
  { name: "Indigenous Ingredients", platform: "Shopify", state: "Contributed" as ProofState },
  { name: "AfricaLog", platform: "WordPress", state: "Contributed" as ProofState },
] as const;
