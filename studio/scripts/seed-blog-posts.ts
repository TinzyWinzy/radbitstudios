import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    initializeApp({ credential: cert(JSON.parse(key)) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();
const collection = db.collection('blog_posts');

const posts = [
  {
    title: "Registering Your Business in Zimbabwe: The Real Costs and Timelines",
    slug: "registering-business-zimbabwe-costs-timelines",
    excerpt:
      "A practical breakdown of the steps, documents, and likely cost centres involved in formalising a business in Zimbabwe.",
    tags: ["registration", "PRAZ", "ZIMRA", "costs", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `A common question I hear from people starting out is: how much does it actually cost to register a business in Zimbabwe? The short answer is between USD 50 and USD 250 in official fees, depending on the structure and sector. But what I have noticed is that the fees are rarely the problem. It is everything around them — the document preparation, the transport, the printing, the time spent chasing corrections. A private limited company needs name reservation at the Companies Registry, incorporation filing, ZIMRA tax registration, and possibly PRAZ registration if tenders are on your mind. The timeline from name reservation to certificate of incorporation usually runs 5 to 15 working days with a company secretary, or longer if you file directly and something comes back wrong.

The real question is not what you pay. It is what you bring. Most people show up without valid IDs, proof of address, director details, or shareholder records in one place. Then they find out bank account opening takes another 5 to 10 working days after incorporation. Fees and requirements change periodically without much notice, so confirm current charges on each agency portal or with a registered company secretary before you start.

**Choose and reserve a name**
Prepare more than one name in case your first option is taken. Keep a copy of the name search result because you may need it later when opening accounts or working with a company secretary.

**Incorporate the company**
Most founders either use a company secretary or a registration service. The main cost is usually document preparation and filing. Check that names, director details, addresses, and shareholding are correct before submission because small errors can slow the whole process.

**Keep your company documents together**
After incorporation, keep your certificate, director details, shareholder details, resolutions, and address records in one folder. These documents are often requested again for bank accounts, tax clearance, PRAZ registration, tenders, and supplier onboarding.

**Register for tax where required**
ZIMRA registration depends on what the business does, whether it has employees, and whether it meets the current VAT registration requirements. Avoid copying an old VAT threshold from a blog post. Confirm the current threshold and filing obligations directly with ZIMRA or your tax adviser.

**Check licences and sector requirements**
Some businesses need local authority licences, health approvals, sector permits, or professional registrations before trading. A food business, clinic, logistics company, school, and consultancy will not have the same compliance path.

**Prepare for tenders early**
If you plan to bid for public procurement work, start collecting tax clearance, company documents, NSSA records where applicable, PRAZ registration details, and proof of operating address before a tender appears. Scrambling on the closing week is how good bids fail.

**The practical advice**
Budget for official fees, professional help, printing or scanning, transport, and time. More importantly, build a clean document folder from day one. Formalisation is not just about getting a certificate. It is about being able to prove who you are when a bank, buyer, regulator, or tender committee asks.`,
  },
  {
    title: "Running a Business Through Load-Shedding: Practical Habits",
    slug: "load-shedding-business-lessons",
    excerpt:
      "Practical habits for keeping sales, payments, records, and customer communication moving during power cuts.",
    tags: ["load-shedding", "energy", "operations", "retail"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Here is something I have noticed about load-shedding in Zimbabwe. The businesses that survive are not the ones with the biggest generators. They are the ones with simple, repeatable habits that keep things moving when the grid goes down. The question most owners ask is "how do I keep running without power?" But the real question is "what is the cheapest thing I can do today that stops me from losing the next sale?"

A router backup using a small UPS costs USD 50 to 100 and keeps internet running. A fully charged power bank keeps phones and payment devices working. A paper-based transaction log ensures no sale is lost when the till goes dark. I have seen businesses recover the cost of basic backup equipment within two to three months of reduced outage losses. The pattern is predictable — payments delay, customers arrive during blackouts, and stock work waits because laptops are flat. The mistake is waiting for a perfect backup system before doing anything. Start with one fallback per critical task.

**Your Phone Is Your Most Important Business Tool**
For many SMEs, the phone is the fallback office. Payments, supplier messages, customer updates, product photos, banking apps, and order confirmations often keep running from one device.

Use business payment channels where they fit, and keep exportable records. The point is not only receiving money. It is being able to reconcile what happened later.

**Backup Power Does Not Have to Cost a Fortune**
Backup power does not have to start with a large generator. Many service and retail businesses begin with a router backup, charged phone, lights, and a clear manual process for recording transactions.

If you need to run refrigeration, machinery, or a full till setup, size the backup properly and get technical advice before buying equipment.

**Your Customers Understand  -  But Only to a Point**
Customers know about load-shedding. They live through it too. But they still expect you to deliver. If your shop is dark and you cannot process payments, they will go to the next shop that has backup power.

Keep a simple manual fallback: item, amount, customer, payment method, and time. When power returns, enter it into your system so stock and sales still reconcile.

**Plan Your Week Around the Schedule**
When schedules are available, plan stock counts, cleaning, admin catch-up, charging, deliveries, and customer-facing work around them. When schedules are unreliable, plan for the first hour after power returns.

**The Bottom Line**
Load-shedding is not going away anytime soon. The businesses that survive are the ones that adapt. Small changes like getting a basic inverter, setting up mobile payment systems, and planning around the schedule make a big difference.

You do not need a perfect system to improve. You need a fallback process your staff can follow when power goes out.`,
  },
  {
    title: "EcoCash Business vs Bank Account: When to Use What",
    slug: "ecocash-business-vs-bank-account",
    excerpt:
      "A practical comparison of mobile money and bank accounts for Zimbabwean SMEs: records, reconciliation, fees, and customer convenience.",
    tags: ["EcoCash", "banking", "payments", "finance", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `What I have noticed about payment conversations in Zimbabwe is that people treat EcoCash and bank accounts like competitors. They are not. They do different things. The question is not which one to use. It is which transaction goes where.

EcoCash Business handles small, frequent customer payments with instant settlement. It works in areas where bank branches are scarce and customers do not want to travel to deposit money. Bank accounts are better for large supplier payments, corporate client transactions, tax payments, and anything that needs a formal audit trail. I have seen businesses lose time and money by forcing everything through one channel. EcoCash for daily customer payments, bank account for supplier settlements, payroll, tax remittances, and corporate receipts. That pattern works because it matches the transaction to the channel that handles it cleanly. Fee schedules change without notice, so confirm current charges with each provider before building them into pricing.

**EcoCash Business  -  When It Works**
EcoCash Business is brilliant for small, frequent transactions. If you are taking payments from customers who prefer mobile money, it is the most convenient option. Your customers scan your till number, the money hits your account instantly, and you can withdraw it at any EcoCash agent.

Fees and limits change, so confirm them with the provider before building your pricing around them.

**Bank Account  -  When It Works**
For larger transactions, a bank account is often cleaner. Bank statements are easier to reconcile, and many corporate customers prefer transfers for audit trails.

Bank accounts also give you proper statements that make accounting easier. Your bookkeeper will thank you. EcoCash statements exist but they are harder to reconcile, especially if you do high volumes.

**Tax Considerations**
Do not treat mobile money as invisible. If money belongs to the business, record it properly, declare income correctly, and keep receipts.

The right approach is the same for both: keep proper records, declare your income, and pay your taxes. The medium you use to receive money does not change your tax obligations.

**A Useful Rule**
Many businesses use mobile money for small customer payments and bank transfers for larger supplier, corporate, or tax-sensitive transactions. The useful rule is to choose the channel that gives the customer convenience and gives the business a clean record.

**One More Thing**
If you are a formal business registered with ZIMRA, your customers who need receipts for tax purposes prefer bank transfers. EcoCash receipts are not always accepted by corporate clients. Keep that in mind when choosing your payment methods.`,
  },
  {
    title: "First-Time Tender Bidding: What Usually Trips SMEs Up",
    slug: "first-tender-bidding-experience",
    excerpt:
      "A practical guide to the paperwork, proposal work, waiting period, and common mistakes SMEs face when bidding for tenders.",
    tags: ["tenders", "bidding", "government", "PRAZ", "experience"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Here is what I have noticed about first-time tender bids in Zimbabwe. Most of them fail before evaluation even starts. Not because the price is wrong or the business cannot deliver. Because documents are missing. A typical public procurement bid asks for company registration, a valid tax clearance certificate, PRAZ registration details, NSSA compliance records, proof of operating address, financial statements, past work references, and sector-specific certifications. When those documents are scattered across email threads, WhatsApp messages, and old folders, the team spends the bidding window looking for papers instead of writing the proposal.

The second thing that trips people up is the proposal itself. Many SMEs submit a generic company description that does not answer the evaluation criteria. Procurement evaluators score against published criteria. A bid that answers the criteria precisely, even with a modest price, often scores higher than a polished proposal that misses what was asked for. The real question is not "can I write a good proposal." It is "do I have the papers ready before the tender appears."

**Getting the Documents Together**
The first shock is usually the document list. Depending on the tender, you may need company registration documents, tax clearance, PRAZ details, NSSA compliance where applicable, proof of address, past work, financial statements, bank details, and sector-specific certificates.

If those documents are scattered across email, WhatsApp, and old folders, the bid starts late before anyone writes a proposal.

**Writing the Proposal**
Many tenders require both a technical proposal and a financial proposal. The technical proposal should explain how you will deliver, your timeline, quality controls, staffing, risk management, and relevant experience.

Do not only describe your company. Answer the evaluation criteria line by line.

**The Waiting**
After submission, expect a waiting period. Some processes publish clarifications, evaluation updates, or award notices. Others are quiet for longer than a bidder would like. Keep a record of what was submitted, when it was submitted, and any reference numbers.

**The Result**
Many first bids fail for ordinary reasons: missing documents, weak references, unclear delivery timelines, pricing that does not match the scope, or a technical response that does not answer the evaluation criteria.

**What I Learned**
Three things help. Build a compliance folder before tender season. Keep evidence of small completed jobs because references matter. Spend more time answering the evaluation criteria than decorating the proposal.

Even a failed bid can teach you where the business is not yet ready. The key is to treat every tender as a readiness test, not only as a sales opportunity.`,
  },
  {
    title: "Tax Deadlines Every Zimbabwean SME Owner Should Pin to Their Wall",
    slug: "zimra-tax-deadlines-sme",
    excerpt:
      "A practical ZIMRA deadline guide covering QPD dates, monthly PAYE, VAT reminders, annual returns, and why current public notices matter.",
    tags: ["ZIMRA", "tax", "deadlines", "compliance", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `What surprises most SME owners about ZIMRA deadlines is not how many there are. It is how quickly penalties add up when you miss one. The four main deadlines repeat every year — Quarterly Payment Dates on 25 March, June, September, and December, monthly PAYE and VAT by the 10th of each following month, and the annual income tax return by 30 April. Missing any of these triggers penalty charges that compound and can block tax clearance certificates needed for tenders, supplier accounts, and bank facilities.

The most common mistake I see is people relying on outdated figures from blog posts. VAT thresholds, penalty rates, and filing categories change periodically. What worked last year may not work this year. Set up a shared calendar with multiple reminders, assign one person to monitor ZIMRA public notices, and confirm key dates with your tax adviser before each filing period. If you cannot pay on time, engage ZIMRA before the deadline to arrange a payment plan. It is not as complicated as it sounds, but it does require consistent attention.

**Quarterly Payment Dates (QPDs)**
If you are on the Quarterly Payment Date system, the common planning dates are:

- QPD 1: 25 March
- QPD 2: 25 June
- QPD 3: 25 September
- QPD 4: 25 December

You pay your estimated tax in four instalments. The trick is to estimate correctly. If you underpay by more than 10 percent, you get charged interest. If you overpay, ZIMRA refunds you but it takes months.

**VAT Returns**
Do not rely on an old VAT threshold copied from a blog post. Confirm the current VAT registration threshold and filing category with ZIMRA or your accountant.

Local 2026 ZIMRA notice extracts in this repository list VAT returns and payments as due on the 10th of each month. Use that as a planning reminder, then verify against the latest ZIMRA public notice before filing.

**PAYE**
If you have employees, PAYE is commonly planned around the 10th of every month. The return covers the previous month's salaries. Confirm penalty and interest rules against current ZIMRA guidance.

**Annual Returns**
Your annual income tax return is due by 30 April of the following year. So for the 2025 tax year, your return is due by 30 April 2026. Extension requests are possible but you need a good reason and you must apply before the deadline.

**What Happens If You Miss a Deadline**
The penalties can add up quickly. Non-submission can also create bigger problems because the tax authority may estimate liabilities or block clearances until the issue is resolved.

**How to Stay on Top**
Use more than one reminder. Put dates in a shared calendar, assign one person to check current notices, and keep a visible deadline list for the business.

Set up a system that works for you. The planning rhythm is predictable, but notices can change details. Keep the current ZIMRA notice with your tax calendar.

**Final Tip**
If you are struggling to pay, talk to ZIMRA before the deadline. They offer payment plans. The interest keeps accruing but at least you avoid the penalties. Ignoring the problem makes it ten times worse.`,
  },
  {
    title: "Moving from Excel to Accounting Software: What Changes",
    slug: "excel-to-accounting-software-experience",
    excerpt:
      "What changes when an SME moves from spreadsheets to accounting software: records, reconciliation, invoices, reporting, and tax preparation.",
    tags: ["accounting", "software", "finance", "tools", "experience"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `I have noticed something about businesses using Excel for their books. It works fine until it does not. The spreadsheet is flexible and familiar, but it introduces risks that you do not see until something breaks — a formula gets deleted, a row gets duplicated, someone saves a different version, or your accountant spends hours cleaning up the export before they can work with it. The question is not whether Excel can handle your books. It is whether the time you spend fixing spreadsheet problems is more than the cost of proper software.

Most businesses switch when three things happen. Data entry errors start costing money. Accountant fees for cleaning exports exceed the software subscription. Tax filing requirements demand transaction-level records that a spreadsheet cannot easily provide. Accounting software automates bank reconciliation, keeps invoice numbering consistent, generates reports without manual checks, hands clean data to your accountant, and handles tax calculations where local ZIMRA rules are supported. Expect a learning curve of two to four weeks during migration. The transition goes smoothest when your spreadsheet data is already clean.

**Why Businesses Switch**
Three things usually push the change. First, data entry errors become expensive. Second, accountants spend too much time cleaning exports. Third, tax and invoice requirements become harder to manage manually.

**The Cost**
Compare current pricing, local support, ZIMRA-related features, reporting, user permissions, bank import options, and whether your accountant can work with the system.

**The Learning Curve**
Expect a learning curve. The migration is easiest when your spreadsheet data is already clean: consistent customer names, clear invoice numbers, complete dates, and receipts matched to payments.

**The Results**
The biggest gains are usually cleaner reporting, faster reconciliation, better invoice history, fewer missing records, and easier handover to an accountant.

**Was It Worth It?**
It is worth it when the time saved, cleaner records, and lower compliance risk are greater than the subscription and setup effort.

If you are still using Excel, that is normal. It feels fine until something goes wrong or the business outgrows the process. When you are ready to switch, test two or three options and pick the one your team can actually maintain.`,
  },
  {
    title: "PRAZ Compliance Checklist for Tender-Ready SMEs",
    slug: "praz-compliance-two-weeks",
    excerpt:
      "A practical checklist for preparing PRAZ registration documents, renewals, and tender compliance packs.",
    tags: ["PRAZ", "compliance", "registration", "tenders", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Here is what I have noticed about PRAZ compliance. The hardest part is not the portal. It is finding the right documents when you need them. Registration involves creating an account on praz.org.zw and submitting incorporation documents, tax clearance, NSSA compliance records, business operating licences, proof of address, and sector-specific certifications. The process itself is straightforward. What trips people up is that they start looking for papers when a tender is already on the table.

SMEs that keep a current compliance folder with updated certificates can complete PRAZ registration in one to two days. Those that have to find or renew expired documents before starting often take two to three weeks — by which time the tender deadline has passed. I have seen it happen more times than I can count. The online portal requires accurate company classification because the category determines which tenders your business can access. Fees, classifications, and document requirements change, so verify everything on the PRAZ portal before submitting or paying.

**Start with your documents**
The document pack commonly includes:

1. Certificate of Incorporation
2. Director and shareholder records
3. ZIMRA tax clearance where required
4. NSSA compliance where applicable
5. Business operating licence where applicable
6. Proof of business or director address
7. Sector-specific certificates if the tender requires them

Put these in one folder before you start. The hardest part is often not the portal. It is finding the current version of every certificate under pressure.

**Use the online registration carefully**
The PRAZ portal is at praz.org.zw. Create an account, fill in company details carefully, upload each document, and keep proof of any payment or submission reference.

Fees and classifications should be checked directly on the portal because public procurement rules and fee schedules can be updated.

**The Verification**
After submitting, your documents go through verification. Keep copies of payment confirmations, submitted files, reference numbers, and emails. If a document is rejected, update the source document first instead of uploading another unclear scan.

**What to budget for**
Budget for official registration fees, document renewals, scanning, transport, internet time, and professional help if your documents are messy or your category is unclear.

Do not treat old blog numbers as current fees. Verify before advising a client or pricing a bid.

**What changes after registration**
Registration alone does not win tenders. It simply means you are better prepared to submit when an opportunity fits your business. You still need references, pricing, delivery capacity, and a proposal that answers the tender.

**The useful habit**
Review your compliance folder every month. Expired certificates and missing scans are boring problems, but they are exactly the problems that disqualify otherwise capable SMEs.`,
  },
  {
    title: "WhatsApp for Business: Beyond Broadcast Lists",
    slug: "whatsapp-business-beyond-broadcasts",
    excerpt:
      "How Zimbabwean SMEs can use WhatsApp for more than just sending bulk messages  -  order management, customer support, payment collection, and building real relationships.",
    tags: ["WhatsApp", "customer service", "sales", "tools"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Something I have noticed about how Zimbabwean SMEs use WhatsApp is that most of them only scratch the surface. The app has features that save hours every week, but the majority of businesses still rely on broadcast lists and group chats. The catalogue feature lets you display products with photos, descriptions, and prices so customers can browse without asking for fresh price lists every time. Quick replies turn frequently typed answers into shortcuts. Labels organize conversations into a pipeline without needing a separate CRM.

The most underused feature is labels. A simple two-minute setup categorises every conversation by status. You can see exactly where each customer is in the sales process without re-reading message history. The question most business owners do not ask is "what is costing me the most time in customer conversations." For most, it is repeating the same information over and over. Quick replies and a catalogue solve that directly. Avoid the common mistakes — do not add customers to broadcast lists without permission, type important information instead of sending voice notes so customers can refer back, and use the WhatsApp Business app rather than your personal number.

**Catalogues Instead of Price Lists**
The WhatsApp Business app has a catalogue feature. You can add your products with photos, descriptions, and prices. When a customer asks "what do you have," you send them your catalogue instead of typing everything out.

Once the catalogue is set up, customers can browse products without asking for a fresh price list every time.

**Quick Replies for Common Questions**
Most businesses answer the same questions every day. "What time do you deliver?" "Do you deliver to Borrowdale?" "What is your payment method?"

Quick replies turn those answers into shortcuts. For example, "/delivery" can insert your delivery policy and "/payments" can list payment options.

This saves me hours every week. The setup is simple. Open WhatsApp Business settings, go to Business Tools, then Quick Replies. Type your message and assign a shortcut.

**Labels for Organisation**
The WhatsApp Business app lets you label conversations with statuses like "New Order," "Payment Received," "Delivered," "Follow Up," and "Query."

The label is a lightweight pipeline. You can see where each customer is in the process without reading every message again.

**Payment Collection**
When a customer places an order, send the correct payment details or Paynow link directly in the chat. Confirm payment, send a receipt, and arrange delivery from the same thread.

The whole transaction happens in one chat thread. No phone calls, no separate payment apps, no confusion.

**What Not to Do**
Do not add customers to broadcast lists without their permission. People hate that. Do not send voice notes for important information. Type it so they can refer back to it. And do not use your personal WhatsApp number for business if you can avoid it. The WhatsApp Business app gives you professional features that your personal number does not have.

**The Result**
The value is simple: faster replies, clearer orders, and fewer repeated questions. That can lead to more sales, but the first win is operational discipline.

If you have not set up WhatsApp Business yet, start with the catalogue, quick replies, labels, and a simple order-confirmation process.`,
  },
  {
    title: "Exporting from Zimbabwe: One SME's Journey into SADC",
    slug: "exporting-zimbabwe-sme-sadc-journey",
    excerpt:
      "A practical export-readiness guide for Zimbabwean SMEs looking at SADC markets: documents, logistics, payments, and records.",
    tags: ["export", "SADC", "trade", "logistics", "manufacturing"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Exporting from Zimbabwe into SADC markets is one of those things that sounds more complicated than it is, but that does not mean it is simple. What I have noticed from conversations with people who have done it is that the documents are manageable if you know what to expect. You typically need six to eight things before the first shipment leaves: a valid ZIMRA tax clearance, any export licence or sector approval for your product, a certificate of origin from the Zimbabwe National Chamber of Commerce, a commercial invoice and packing list, a bill of lading or air waybill, and a SADC certificate of origin if the shipment qualifies.

The thing most first-time exporters underestimate is not the paperwork. It is the timeline and the working capital. Document preparation takes two to three weeks longer than you expect. And the payment cycle is much longer than domestic sales. A local sale that closes in three days takes three weeks when exporting across borders. The single most important decision you make is choosing a freight forwarder who knows the route and the paperwork. Payment terms — currency, deposit percentage, balance date, bank charges, exchange-rate method, and border delay contingencies — must be agreed in writing before any goods leave.

**The Paperwork**
Exporting from Zimbabwe can require several documents depending on the product, destination country, and trade arrangement. Common records include:

1. A valid ZIMRA tax clearance certificate
2. Any export licence or sector approval required for your product
3. A certificate of origin (issued by the Zimbabwe National Chamber of Commerce)
4. A commercial invoice and packing list
5. A bill of lading or air waybill
6. SADC certificate of origin where the shipment qualifies under the relevant trade rules

Confirm requirements before quoting because regulated goods, agricultural products, and manufactured goods may follow different paths.

**The Logistics**
Use a freight forwarder who understands the route and the paperwork. Ask what they handle, what you must supply, how border delays are communicated, and what proof of delivery you receive.

**The Payment**
Payment terms matter as much as shipping. Agree the currency, deposit, balance date, bank charges, exchange-rate method, and what happens if goods are delayed at the border. Put those terms in writing before dispatch.

**The Costs**
Typical cost lines include licences or approvals, certificates, freight forwarding, customs handling, insurance, packaging, bank charges, and possible storage if clearance is delayed. Add these before you promise a landed price.

**What I Learned**
Get a good freight forwarder. They are worth every dollar. The documentation is not as complicated as people make it sound. Go to ZIMRA, go to the Ministry, ask questions. The officials are helpful if you are polite.

Start small enough to learn without risking the whole business.

And be patient. Exporting takes longer than domestic sales. A sale that takes three days locally takes three weeks when exporting. Build that into your pricing and your promises to customers.

Keep every document from the first shipment. Your next buyer, bank, or logistics partner will ask for the same proof again.`,
  },
  {
    title: "Why Your Business Needs a Website (Even If You Are on WhatsApp)",
    slug: "why-business-needs-website-not-just-whatsapp",
    excerpt:
      "An honest look at when a website matters for a Zimbabwean SME, when it does not, and the cheapest way to get online without wasting money.",
    tags: ["website", "online presence", "marketing", "digital"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `A question I get asked a lot is "do I really need a website if I am on WhatsApp." My answer is usually that they do different things. WhatsApp is where conversations happen with people who already know you. A website is where new customers, procurement officers, and supplier verification teams go to confirm your business is real. When someone hears about your business and searches online, what they find — or do not find — shapes their first impression before you even know they exist.

The question is not whether WhatsApp is enough. The question is what happens when someone who does not know you looks for you online. If they find nothing, they question whether you are legitimate. If they find an abandoned Facebook page from three years ago, they question whether you are still active. If they find a clean website with your name, contact details, and what you do, they trust you. For about USD 200 in the first year, your business can have that stable presence. A basic one-page website costs USD 50 to 150 to build, hosting runs about USD 10 per month, and a domain costs around USD 15 per year. Start with the basics and expand later.

**When WhatsApp Is Enough**
If you run a small tuckshop in your neighbourhood, a website is a waste of money. Your customers walk past your door. They know you. WhatsApp works fine for taking orders and answering questions.

If you are a hairdresser or a plumber who gets all their work through referrals, same thing. A website will not bring you more business than a good reputation.

**When You Need a Website**
Here is where a website matters. When a potential customer hears about your business and searches for you online. If they find nothing, they question whether you are real. If they find a Facebook page from 2019 with three posts, they question whether you are active. If they find a clean website that explains what you do and how to reach you, they trust you.

A missing web presence can create doubt during procurement or supplier checks. If a buyer cannot verify your company online, they may move to a business that is easier to check.

**How Much It Actually Costs**
You do not need to spend thousands. A simple one-page website costs between $50 and $150 to build using platforms like Wix, Squarespace, or WordPress. Hosting costs about $10 per month. A domain name costs about $15 per year.

If you want something more custom, expect to pay $300 to $500. That is still less than what most people think websites cost.

**What to Put on It**
Your website needs five things. Your business name and what you do. Your contact details including phone, email, and physical address. Your products or services with prices if possible. Testimonials from happy customers. And a way for people to contact you or place an order.

That is it. You do not need a blog, a newsletter, or a live chat. You can add those later if you want. Start with the basics.

**The Bottom Line**
Do both where it makes sense. WhatsApp is where conversations happen. A website is where credibility, contact details, services, and proof can live in one stable place.

If you are serious about growing your business beyond your current customer base, you need some kind of web presence. It does not have to be fancy. It just has to exist.`,
  },
];

async function seed() {
  console.log("Seeding blog posts...");

  let created = 0; let updated = 0;
  for (const post of posts) {
    const existing = await collection.where("slug", "==", post.slug).get();
    if (!existing.empty) {
      const docRef = existing.docs[0].ref;
      await docRef.update({
        ...post,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`  Updated "${post.title}"  -  ${docRef.id}`);
      updated++;
      continue;
    }

    const docRef = await collection.add({
      ...post,
      published: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`  Created "${post.title}"  -  ${docRef.id}`);
    created++;
  }

  console.log(`\nDone. Created ${created}, Updated ${updated}. Total in collection: ${(await collection.get()).size}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
