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

export type TopicArticle = {
  slug: string;
  title: string;
  content: string;
};

export type ContentCluster = {
  slug: string;
  name: string;
  pillarTitle: string;
  description: string;
  topics: TopicArticle[];
};

export const CONTENT_CLUSTERS: readonly ContentCluster[] = [
  {
    slug: "custom-business-systems",
    name: "Custom Business Systems",
    pillarTitle: "Custom Business Systems for Zimbabwean Companies",
    description:
      "How purpose-built systems replace fragmented spreadsheets, slow quotations and manual customer administration.",
    topics: [
      {
        slug: "when-does-a-business-need-a-custom-web-application",
        title: "When Does a Business Need a Custom Web Application?",
        content:
          "A common question I hear is whether a business needs a website or a web application. The answer usually becomes clear once you watch how work actually flows. If the process involves taking an enquiry, qualifying it, saving it, assigning it, updating its status, and handing it to someone else, then the business needs a system — not a brochure.\n" +
          "\n" +
          "I have noticed that most owners describe their problem as needing a website. When I ask what happens after a customer sends a message, the answer reveals the real bottleneck. Sometimes it is that nobody owns the reply. Sometimes the information needed to reply is split across WhatsApp, a notebook, a spreadsheet, and the owner’s memory. A web application solves that by giving everyone one place to work from.\n" +
          "\n" +
          "The simpler test is this: if removing the person who knows everything would break the process, the business has outgrown informal tools. A custom web application does not automatically fix a broken process. It makes the process visible, repeatable, and easier to improve.\n" +
          "\n" +
          "If you are unsure, spend one week mapping every step from first contact to payment. The gaps will tell you whether you need a website, a web application, or simply a cleaner manual process.",
      },
      {
        slug: "website-versus-web-application",
        title: "Website versus Web Application",
        content:
          "People use these terms interchangeably, but they describe different things. A website presents information. A web application stores information and lets people complete tasks.\n" +
          "\n" +
          "A business that needs a website wants customers to find contact details, read about services, and maybe send a message. A business that needs a web application wants staff to log in, update records, approve requests, and see current status without asking the owner.\n" +
          "\n" +
          "I have seen owners pay for a custom application when a simple website was enough, and I have seen owners pay for a template website when their team needed a shared dashboard. Neither outcome is bad if the choice was conscious.\n" +
          "\n" +
          "The useful distinction is whether your team or your customers need to do things inside the system, not just read from it. If nothing is being recorded, approved, or updated, you probably need a website. If work is moving through stages, ownership, and decisions, you probably need a web application.",
      },
      {
        slug: "how-business-process-automation-works",
        title: "How Business Process Automation Works",
        content:
          "Automation gets a bad reputation because it is often applied to processes that do not exist yet. The sequence matters: understand the process, then automate the stable parts.\n" +
          "\n" +
          "I usually start by asking the owner to walk through one workflow from start to finish. Not the ideal version — the actual version, including the WhatsApp messages, the phone calls, the spreadsheet tabs, and the exceptions. That conversation usually takes twenty minutes and reveals why things slow down.\n" +
          "\n" +
          "Once the workflow is clear, automation becomes straightforward. You define the decision points, assign ownership, set the reminders, and design the record that gets created at each stage. The technology is the easy part. The hard part is getting the team to use the same process consistently.\n" +
          "\n" +
          "A useful rule: automate the rule-based work and make the exceptions visible. Do not automate judgment calls. Keep a human review step for anything that could damage a customer relationship or create compliance risk.",
      },
      {
        slug: "how-customer-portals-reduce-administrative-work",
        title: "How Customer Portals Reduce Administrative Work",
        content:
          "Customer portals sound like big systems, but at their simplest they are just a place where a customer can see what is happening with their order, request, or account without calling or messaging.\n" +
          "\n" +
          "The administrative work accumulates because customers ask the same questions repeatedly: Has my quotation been approved? When will delivery happen? Has my payment been received? Each answer requires a staff member to stop what they are doing, look up the record, and reply. Multiply that by twenty customers a day and the time loss becomes real.\n" +
          "\n" +
          "A portal does not have to be fancy. It can show status, documents, messages, and payment records for each job or enquiry. The important thing is that the customer sees the current state instead of asking for it.\n" +
          "\n" +
          "If you run a service business where customers check in repeatedly, list the five questions they ask most often. Those are your portal priorities. Everything else can come later.",
      },
      {
        slug: "how-quotation-systems-improve-response-speed",
        title: "How Quotation Systems Improve Response Speed",
        content:
          "Quotation speed often determines whether a lead becomes a customer or a competitor. The delay comes from searching for prices, checking stock, confirming terms, and getting approval — usually in that order.\n" +
          "\n" +
          "A quotation system removes the search step. Prices, standard packages, discount rules, and approval limits are stored in one place. The person preparing the quotation selects the items, confirms the terms, and sends it. The review step becomes a brief approval or escalation, not a reconstruction of the numbers.\n" +
          "\n" +
          "What I have noticed is that the businesses winning on speed are not always the cheapest. They are the ones that respond while the customer is still thinking about the problem. A quotation system does not guarantee the sale. It simply removes the operational excuse for delay.\n" +
          "\n" +
          "If your team still prepares quotations in a shared spreadsheet, you have probably seen the version conflicts, missing formulas, and late-night revisions. A simple web quotation system changes that rhythm.",
      },
      {
        slug: "signs-your-business-has-outgrown-spreadsheets",
        title: "Signs Your Business Has Outgrown Spreadsheets",
        content:
          "Spreadsheets are honest tools. They work well until they do not. The transition is gradual: a duplicated row, a deleted formula, two people updating different copies, and then an accountant calling to ask why the numbers do not match.\n" +
          "\n" +
          "I have seen businesses use spreadsheets for stock, quotations, payroll, customer records, and project tracking simultaneously. Each sheet has its own logic, its own errors, and its own保养 schedule. The owner becomes the human integration layer, copying numbers from one tab to another and answering questions from staff who cannot find the current version.\n" +
          "\n" +
          "The clearest sign that a business has outgrown spreadsheets is time. If you spend more time maintaining the records than making decisions from them, the tool is no longer serving the business.\n" +
          "\n" +
          "Moving to a proper system does not mean losing flexibility. It means gaining a single source of truth that multiple people can use safely. Start with the spreadsheet that causes the most confusion, clean the data, and migrate that workflow first.",
      },
    ],
  },
  {
    slug: "ai-for-african-businesses",
    name: "AI for African Businesses",
    pillarTitle: "Practical AI Automation for African Businesses",
    description:
      "A grounded guide to where AI improves enquiry handling and document workflows—and where it does not.",
    topics: [
      {
        slug: "how-ai-can-automate-customer-enquiries",
        title: "How AI Can Automate Customer Enquiries",
        content:
          "Most customer enquiries are variations of the same questions. Delivery times. Payment methods. Product availability. Status of an order. Repeating these answers is not valuable work. It is maintenance work.\n" +
          "\n" +
          "What I have noticed is that the businesses handling enquiries fast are not the ones with the smartest system. They are the ones with a simple rule for who answers and a fast way to share standard responses. AI fits here as a classifier and a formatter, not as a replacement for the relationship.\n" +
          "\n" +
          "A practical setup looks like this: an incoming message is read, matched against known categories, and either answered from a standard response or passed to a person with the right context. The human handles the exceptions and unusual requests. The system handles the rest.\n" +
          "\n" +
          "The mistake is building a voice chatbot because it sounds impressive. Start with the text channels your customers already use. Make the first automation invisible — it should feel like a fast, accurate response, not a machine.",
      },
      {
        slug: "what-rag-means-for-business-document-systems",
        title: "What RAG Means for Business Document Systems",
        content:
          "Retrieval Augmented Generation is easier to understand than the name suggests. It means letting an AI answer a question by reading your actual documents first, then summarising what it found — instead of relying only on what it learned during training.\n" +
          "\n" +
          "In practice, this changes the quality of legal, compliance, and customer-history answers. Without retrieval, the AI may sound confident while being wrong. With it, the answer is grounded in files that already exist in your business, and it can point you to the source.\n" +
          "\n" +
          "For a Zimbabwean SME, RAG is most useful where documents are repetitive and time-sensitive: tender requirements, tax notices, contract clauses, past proposals, and client records. The more a business relies on searching folders to answer questions, the more RAG can help.\n" +
          "\n" +
          "The trade-off is setup. The documents must be readable, reasonably organised, and stable enough to trust. If your documents are constantly changing or scattered across personal devices, clean them first. A retrieval system makes a messy dataset messy faster.",
      },
      {
        slug: "ai-lead-qualification-for-small-businesses",
        title: "AI Lead Qualification for Small Businesses",
        content:
          "Lead qualification is the process of deciding whether an enquiry is worth pursuing now, later, or not at all. For a small team, spending two hours on a lead that will never buy is expensive.\n" +
          "\n" +
          "AI can help by applying consistent rules to the first message or call record. Budget signal, timeline, project type, and location are the usual filters. A simple scoring model based on those signals removes the emotional guesswork from the first pass.\n" +
          "\n" +
          "What I have noticed is that most SMEs already know what a good lead looks like. The problem is that the qualifying questions are asked inconsistently or the answers are not recorded. AI does not replace that judgment. It makes the judgment traceable and repeatable.\n" +
          "\n" +
          "If you want to start, write down the last ten enquiries that became customers. List what they said or did that made you confident they were serious. That pattern is your qualification rule.",
      },
      {
        slug: "limitations-of-ai-automation",
        title: "Limitations of AI Automation",
        content:
          "It is useful to be clear about what AI cannot do. It does not reliably handle novel situations that have no precedent in your data. It does not make good judgment calls in high-risk or emotionally sensitive conversations. And it does not fix a process that is already broken.\n" +
          "\n" +
          "I have seen businesses automate customer support replies before they had a consistent answer for common questions. The result was fast, confident, and wrong — which is worse than slow and correct.\n" +
          "\n" +
          "The realistic boundary is this: automate the rule-based, repetitive, low-risk work. Keep human review for anything involving money, complaints, compliance claims, or first impressions. The technology is useful precisely because it is limited. Design within those limits and it performs well.",
      },
      {
        slug: "how-much-ai-automation-costs",
        title: "How Much AI Automation Costs",
        content:
          "The API bill is usually the smallest part. The real cost is in process mapping, data preparation, integration, and staff adoption.\n" +
          "\n" +
          "For a small business starting with enquiry classification or document search, the infrastructure cost can be low. The work cost comes from identifying the actual inputs, cleaning the documents or records, testing answers against real cases, and training the team to use the tool consistently.\n" +
          "\n" +
          "I have noticed that businesses underestimate the adoption step. The system works technically, but staff revert to WhatsApp because the new workflow is slightly more effort in the first week. Budget for change management as seriously as you budget for development.\n" +
          "\n" +
          "A useful planning approach: price a one-task pilot first. Automate enquiry triage or document retrieval for one workflow. Measure the time saved and the error rate before expanding. That gives you real numbers instead of assumptions.",
      },
      {
        slug: "when-a-business-should-not-use-ai",
        title: "When a Business Should Not Use AI",
        content:
          "Not every problem is an AI problem. Some problems are simply missing data, unclear ownership, or staff who need better tools.\n" +
          "\n" +
          "I think the main signal to pause is when nobody can describe the desired outcome in plain language. If you cannot explain what should happen when the system works, adding AI will not create clarity. It will create confident noise.\n" +
          "\n" +
          "Another signal is when the process changes every few weeks. Automating a moving target wastes money and frustrates the team. Stabilise the workflow first, then automate.\n" +
          "\n" +
          "The honest answer for most Zimbabwean SMEs is that a well-defined manual process with clean records is more valuable than a partially automated process with messy data. Build the foundation before you introduce the intelligence layer.",
      },
    ],
  },
  {
    slug: "web-development-zimbabwe",
    name: "Web Development in Zimbabwe",
    pillarTitle: "Website and Web Application Development in Zimbabwe",
    description:
      "Commercial guidance for choosing, costing and operating websites and web applications in Zimbabwe.",
    topics: [
      {
        slug: "how-much-does-a-website-cost-in-zimbabwe",
        title: "How Much Does a Website Cost in Zimbabwe?",
        content:
          "Website costs in Zimbabwe are lower than many people expect, but the range is wider than most quotes reveal. The difference comes from what the website is expected to do, how much content is unique, and who maintains it after launch.\n" +
          "\n" +
          "A basic brochure site with a few pages and a contact form can be built for between USD 50 and USD 150. Hosting costs around USD 10 per month. A domain costs about USD 15 per year. That is realistic for a small business that needs presence, not an application.\n" +
          "\n" +
          "The hidden cost is maintenance. If nobody updates the site, it becomes an abandoned signpost. If the team updates it regularly, the investment pays back through enquiries and credibility.\n" +
          "\n" +
          "I have noticed that the businesses with the simplest websites often get the most value from them. They keep the copy short, the contact details obvious, and the purpose clear. Complexity is not the goal. Clarity is.",
      },
      {
        slug: "how-much-does-a-web-application-cost",
        title: "How Much Does a Web Application Cost?",
        content:
          "A web application costs more than a website because it stores information, manages logins, and connects to other systems. Quoting a web application without understanding the workflow is like quoting a building without knowing how many rooms it needs.\n" +
          "\n" +
          "The useful starting point is a written description of the workflow. Who enters data? Who approves it? Who sees the result? What needs to happen next when a record changes status? Those answers define the scope more accurately than any feature list.\n" +
          "\n" +
          "In Zimbabwean market conditions, a focused web application for a single workflow — quotations, bookings, or field service — can start from a few hundred dollars and grow with usage. The mistake is building everything at once. Build the one part that removes the most delay, then expand.\n" +
          "\n" +
          "The cost is not just development. It includes hosting, support, and someone inside the business who owns the process. Without that owner, the system drifts.",
      },
      {
        slug: "why-a-business-does-not-appear-on-google",
        title: "Why a Business Does Not Appear on Google",
        content:
          "Most of the time, a business does not appear on Google because it has not given Google enough verified, consistent information to work with.\n" +
          "\n" +
          "The typical scenario is a business with no website, no verified Google Business Profile, and inconsistent contact details across whatever mentions exist online. Google’s local results depend on a verified location, accurate category, and signals that confirm the business is real and active.\n" +
          "\n" +
          "I have seen businesses with good service and steady customers fail to appear simply because they never completed the verification step or their name, address, and phone number were listed differently on different platforms.\n" +
          "\n" +
          "The fix is not a complex SEO project. It is a clean, verifiable web presence: a domain, a simple site with your business name, address, phone number, and services, and a verified Google Business Profile linked to it. From there, search visibility improves gradually with genuine customer activity and content.",
      },
      {
        slug: "google-business-profile-versus-facebook-page",
        title: "Google Business Profile versus Facebook Page",
        content:
          "Google Business Profile and Facebook Page serve different purposes, but most Zimbabwean SMEs treat them as interchangeable. They are not.\n" +
          "\n" +
          "Google is where people go when they are actively searching for a service. Facebook is where people go when they are already aware of you or bored. A business that relies only on Facebook for discovery is limited to its existing audience and paid reach.\n" +
          "\n" +
          "What I have noticed is that a well-maintained Google Business Profile with accurate hours, contact details, real photos, and genuine reviews often becomes the primary channel for new enquiries. Facebook then becomes a retention and update channel — useful, but secondary.\n" +
          "\n" +
          "The practical approach is to treat Google as your credibility record and Facebook as your communication channel. Keep both current, but do not allow Facebook to substitute for a verified web presence.",
      },
      {
        slug: "progressive-web-app-versus-native-mobile-app",
        title: "Progressive Web App versus Native Mobile App",
        content:
          "Most Zimbabwean SMEs do not need an app store listing. The installation friction alone is enough to prevent regular use.\n" +
          "\n" +
          "A Progressive Web App behaves like a mobile app — it can be added to the home screen, work offline, and receive notifications — without going through Apple or Google approval. For businesses whose customers are on mobile data and unlikely to download a dedicated app, a PWA is often the more realistic distribution choice.\n" +
          "\n" +
          "I have seen companies spend weeks or months building a native app for a workflow that needed nothing more than a fast, mobile-friendly web application with offline caching. The native app looked better in a portfolio but delivered less value to the user.\n" +
          "\n" +
          "The right question is not whether a PWA is technically inferior. It is whether your users will install an app, whether you can afford iOS and Android maintenance, and whether offline behaviour matters more than app store presence. For most service businesses in this market, the answer points to a PWA.",
      },
      {
        slug: "how-to-choose-a-web-developer-in-zimbabwe",
        title: "How to Choose a Web Developer in Zimbabwe",
        content:
          "Price is usually the first filter, and it is the worst predictor of outcome.\n" +
          "\n" +
          "What I have noticed in conversations with business owners is that the developers who win on price are often the ones who under-estimate maintenance, support, and the actual workflow behind the requirement. The cheap site goes live, looks fine for a month, and then becomes expensive when something breaks or content needs updating.\n" +
          "\n" +
          "A better filter is evidence. Ask for one or two live projects and contact the owner. Ask what changed after launch. Ask who owns the code, the domain, and the database. Ask how updates are handled and what happens if the developer is unavailable.\n" +
          "\n" +
          "The right developer will ask about your process before quoting. They will talk about hosting, updates, and ownership. They will not promise search rankings or guaranteed leads. Those claims are red flags.\n" +
          "\n" +
          "Choose someone whose communication style matches yours. If you need things explained plainly, choose a developer who explains plainly. If you need speed over perfection, choose someone who can deliver a stable first version rather than a polished prototype.",
      },
    ],
  },
  {
    slug: "industry-systems",
    name: "Industry Systems",
    pillarTitle: "Industry-Specific Business Systems",
    description:
      "Operational patterns for hospitality, recruitment, agriculture, solar, construction and service companies.",
    topics: [
      {
        slug: "booking-systems-for-guest-houses",
        title: "Booking Systems for Guest Houses",
        content:
          "A guest house loses money in two ways: double-booking and slow replies. Both are symptoms of the same cause — no single place where availability, enquiries, and confirmations are visible.\n" +
          "\n" +
          "I have stayed at small lodges where the owner checks availability by looking at a WhatsApp thread, a notebook, and a mental list, all at once. That can work at low occupancy. Once the calendar fills, the collision risk grows.\n" +
          "\n" +
          "A simple booking system shows availability by date, records the enquiry source, stores guest details, and confirms the booking without a second conversation. The owner can see what is booked, what is pending, and what needs follow-up in one view.\n" +
          "\n" +
          "If your current process requires more than two steps to answer 'is this room free on Saturday,' the gap is obvious. Start there.",
      },
      {
        slug: "recruitment-systems-for-maid-agencies",
        title: "Recruitment Systems for Maid Agencies",
        content:
          "The value in a domestic staffing agency is not the list of candidates. It is the evidence that each candidate was screened, trained, and matched properly.\n" +
          "\n" +
          "Most agencies start with a spreadsheet or phone contacts and gradually realise they cannot remember which candidate was presented to which client, what feedback was given, or why a placement worked or did not.\n" +
          "\n" +
          "A recruitment system captures the screening steps, document status, client requirements, interview notes, placement history, and follow-up records in one file. That record is what protects the agency if a client raises a concern or a candidate requests a reference.\n" +
          "\n" +
          "The useful first feature is not a fancy dashboard. It is a record that grows automatically. When a staff member updates a candidate status, the client view updates, the placement record is created, and the follow-up reminder is set without manual coordination.",
      },
      {
        slug: "sales-systems-for-solar-companies",
        title: "Sales Systems for Solar Companies",
        content:
          "Solar sales are technical sales. Customers are buying a system that must match their load, their roof, and their budget. The quotation that arrives fast, explains the assumptions, and records the customer’s choice builds more trust than a lower quote that disappears for days.\n" +
          "\n" +
          "I have noticed that the best solar operations treat the quotation as a workflow, not a document. The site survey feeds into system sizing, which feeds into pricing logic, which feeds into payment terms, which feeds into installation scheduling. When these steps are linked, the customer sees consistency and the business avoids quote errors.\n" +
          "\n" +
          "Warranty and service records matter too. A solar system may be installed today but serviced in three years. If the installation details, equipment serials, and customer history are not stored clearly, the follow-up service becomes guesswork.\n" +
          "\n" +
          "If your team still prepares quotations by email with attachments, the main risk is not the tool. It is that version control, pricing changes, and site notes live in different threads.",
      },
      {
        slug: "farm-management-systems",
        title: "Farm Management Systems",
        content:
          "Farm problems are usually planning problems that look like weather problems.\n" +
          "\n" +
          "When planting dates, input quantities, field records, and sales are kept in one place, patterns become visible. You can see whether a crop consistently underperforms in a specific field, whether input costs are rising faster than yields, and whether sales are happening at the right time.\n" +
          "\n" +
          "I have spoken to farmers who keep excellent records in notebooks and others who rely on memory. The notebook farmers sometimes outperform the memory farmers because they can look back and compare seasons. The limitation is sharing that information with a manager, an investor, or a buyer.\n" +
          "\n" +
          "A farm management system does not need to be sophisticated. It needs to record field activity, input use, harvest quantities, sales, and costs in a way that is reviewable by season. Start with one season’s data and let the system grow.\n" +
          "\n" +
          "If you are not recording anything yet, the first step is not software. It is a consistent template for one field or one crop, filled in weekly.",
      },
      {
        slug: "construction-project-intake-systems",
        title: "Construction Project Intake Systems",
        content:
          "Most construction delays and disputes start at intake. The client describes what they want. The contractor interprets it differently. Materials are ordered before measurements are finalised. Change orders arrive without version control.\n" +
          "\n" +
          "A construction intake system forces the project requirements, site evidence, measurements, quotation assumptions, and approved changes into one record. Every stakeholder sees the same version.\n" +
          "\n" +
          "What I have noticed is that the resistance to intake systems comes from the belief that they slow down the start. In practice, they speed up the build because surprises are caught early, not during execution.\n" +
          "\n" +
          "The minimum useful version is a project record with: client requirements, site evidence, quotation breakdown, milestone schedule, and a change-order log. Add the features after the team trusts the record.",
      },
      {
        slug: "customer-portals-for-service-businesses",
        title: "Customer Portals for Service Businesses",
        content:
          "Service businesses live on trust and availability. A customer who can see the status of their job, download an invoice, and send a message without calling the office feels more confident than one who has to chase updates.\n" +
          "\n" +
          "I have seen accountants, maintenance firms, and logistics providers cut their inbound call volume simply by showing the current status online. The portal does not need to be complex. It needs to answer the five questions customers ask most often.\n" +
          "\n" +
          "The practical first step is not building a portal. It is listing those five questions and deciding what data must be visible to answer each one. That list becomes your portal specification.\n" +
          "\n" +
          "If you are worried about adoption, start with a read-only view — invoices, status, delivery dates. Add request and messaging features later. The habit of checking the portal forms before the feature set is complete.",
      },
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
