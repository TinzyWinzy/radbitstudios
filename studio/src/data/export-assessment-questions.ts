export interface ExportQuestion {
  question: string;
  options: string[];
  category: 'Trade Compliance' | 'Logistics & Standards' | 'Market Readiness';
}

export const exportQuestions: ExportQuestion[] = [
  // Trade Compliance (3 questions)
  {
    question: "How familiar are you with SADC Rules of Origin requirements for your product?",
    options: [
      "I've never heard of Rules of Origin",
      "I know they exist but haven't looked into them",
      "I've reviewed the rules but am not fully compliant",
      "I understand and can document origin for my products",
    ],
    category: "Trade Compliance",
  },
  {
    question: "How do you handle customs documentation for cross-border shipments?",
    options: [
      "I don't export, so I've never dealt with customs",
      "I rely on the buyer to handle all customs paperwork",
      "I use a clearing agent for documentation",
      "I have in-house capability to prepare customs docs",
    ],
    category: "Trade Compliance",
  },
  {
    question: "Do you have the necessary export licenses and permits to trade outside Zimbabwe?",
    options: [
      "No, I haven't applied for any",
      "I've started the application process",
      "I have some licenses but not all required ones",
      "Yes, I hold all current export permits and licenses",
    ],
    category: "Trade Compliance",
  },
  // Logistics & Standards (3 questions)
  {
    question: "How do you manage cold chain requirements for temperature-sensitive products?",
    options: [
      "My products don't need temperature control / I'm not sure",
      "I use basic coolers or ice packs when needed",
      "I have access to refrigerated transport on demand",
      "I have a full cold chain logistics partner in place",
    ],
    category: "Logistics & Standards",
  },
  {
    question: "Are your product packaging and labeling compliant with SADC standards?",
    options: [
      "I'm not aware of SADC packaging standards",
      "I use standard packaging without specific labeling",
      "My packaging meets some SADC requirements",
      "My labeling and packaging fully comply with SADC standards",
    ],
    category: "Logistics & Standards",
  },
  {
    question: "How do you handle cross-border logistics and transportation?",
    options: [
      "I haven't arranged cross-border transport before",
      "I use informal cross-border transporters",
      "I have contracts with regional courier companies",
      "I partner with established freight and logistics firms",
    ],
    category: "Logistics & Standards",
  },
  // Market Readiness (2 questions)
  {
    question: "Have you researched target markets in the SADC region for your product?",
    options: [
      "No, I don't know which markets to target",
      "I've done basic internet research on neighboring countries",
      "I've identified potential markets and studied demand",
      "I have a detailed market entry strategy for specific SADC countries",
    ],
    category: "Market Readiness",
  },
  {
    question: "How do you approach pricing your products for export across different currencies?",
    options: [
      "I would use the same price as my domestic price",
      "I'd convert my ZWL price at the official rate",
      "I price in USD with some consideration of market rates",
      "I have a documented pricing strategy accounting for currency risk and market positioning",
    ],
    category: "Market Readiness",
  },
];
