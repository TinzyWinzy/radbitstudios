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
    content: `If you are starting a business in Zimbabwe, "just register it" sounds simple until the forms, certificates, tax accounts, bank requirements, and local licences start piling up.

This guide is not legal advice and fees can change. Treat it as a practical checklist, then confirm current charges with the Companies Registry, ZIMRA, PRAZ, your local authority, or a company secretary.

**1. Choose and reserve a name**

Prepare more than one name in case your first option is taken. Keep a copy of the name search result because you may need it later when opening accounts or working with a company secretary.

**2. Incorporate the company**

Most founders either use a company secretary or a registration service. The main cost is usually document preparation and filing. Check that names, director details, addresses, and shareholding are correct before submission because small errors can slow the whole process.

**3. Keep your company documents together**

After incorporation, keep your certificate, director details, shareholder details, resolutions, and address records in one folder. These documents are often requested again for bank accounts, tax clearance, PRAZ registration, tenders, and supplier onboarding.

**4. Register for tax where required**

ZIMRA registration depends on what the business does, whether it has employees, and whether it meets the current VAT registration requirements. Avoid copying an old VAT threshold from a blog post. Confirm the current threshold and filing obligations directly with ZIMRA or your tax adviser.

**5. Check licences and sector requirements**

Some businesses need local authority licences, health approvals, sector permits, or professional registrations before trading. A food business, clinic, logistics company, school, and consultancy will not have the same compliance path.

**6. Prepare for tenders early**

If you plan to bid for public procurement work, start collecting tax clearance, company documents, NSSA records where applicable, PRAZ registration details, and proof of operating address before a tender appears. Scrambling on the closing week is how good bids fail.

**The practical advice**

Budget for official fees, professional help, printing/scanning, transport, and time. More importantly, build a clean document folder from day one. Formalisation is not just about getting a certificate. It is about being able to prove who you are when a bank, buyer, regulator, or tender committee asks.`,
  },
  {
    title: "Running a Business Through Load-Shedding: Practical Habits",
    slug: "load-shedding-business-lessons",
    excerpt:
      "Practical habits for keeping sales, payments, records, and customer communication moving during power cuts.",
    tags: ["load-shedding", "energy", "operations", "retail"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Power cuts turn small admin gaps into visible problems. A payment goes through but the receipt is delayed. A customer arrives while the router is off. Stock work waits because the laptop is flat.

If you run a business in Zimbabwe, you already know the pattern. The goal is not a perfect backup system on day one. The goal is to keep the basics moving.

**Your Phone Is Your Most Important Business Tool**

For many SMEs, the phone is the fallback office. Payments, supplier messages, customer updates, product photos, banking apps, and order confirmations often keep running from one device.

Use business payment channels where they fit, and keep exportable records. The point is not only receiving money. It is being able to reconcile what happened later.

**Backup Power Does Not Have to Cost a Fortune**

Backup power does not have to start with a large generator. Many service and retail businesses begin with a router backup, charged phone, lights, and a clear manual process for recording transactions.

If you need to run refrigeration, machinery, or a full till setup, size the backup properly and get technical advice before buying equipment.

**Your Customers Understand — But Only to a Point**

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
    content: `Every SME owner in Zimbabwe has asked some version of this question: should this payment go through mobile money or the bank? The answer depends on the transaction, the customer, fees, records, and reconciliation.

The tax answer is simpler: keep records either way.

**EcoCash Business — When It Works**

EcoCash Business is brilliant for small, frequent transactions. If you are taking payments from customers who prefer mobile money, it is the most convenient option. Your customers scan your till number, the money hits your account instantly, and you can withdraw it at any EcoCash agent.

Fees and limits change, so confirm them with the provider before building your pricing around them.

**Bank Account — When It Works**

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
    content: `A first tender can look simple from the outside: download the document, attach company papers, submit a price. In practice, most small businesses struggle before evaluation even starts.

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
    content: `Missing a ZIMRA deadline is expensive. The penalties add up fast and they do not care that you were busy running your business. Use this as a planning guide, then confirm the latest dates against ZIMRA public notices or your tax adviser.

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
    content: `Spreadsheets are often the first finance system in a small business. They are flexible, cheap, and familiar. The problems usually appear later: duplicate entries, broken formulas, missing receipts, slow reconciliation, and messy tax preparation.

Here is what usually changes when an SME moves to accounting software.

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
    content: `If you want to bid for public procurement work in Zimbabwe, PRAZ compliance is part of the preparation. The exact requirements and fees can change, so confirm the latest details on the PRAZ portal before paying or submitting.

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
      "How Zimbabwean SMEs can use WhatsApp for more than just sending bulk messages — order management, customer support, payment collection, and building real relationships.",
    tags: ["WhatsApp", "customer service", "sales", "tools"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Every business in Zimbabwe uses WhatsApp. But most use it the same way: broadcast lists and group chats. There is so much more you can do with it.

Used properly, WhatsApp can handle product discovery, order intake, customer support, payment links, and delivery follow-up.

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
    content: `Exporting into SADC can look like one big leap. In practice, it is a chain of smaller checks: documents, logistics, payment terms, customs, and proof that you can deliver consistently.

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
    content: `Many SME owners ask the same fair question: "But I already have WhatsApp. Why do I need a website?"

It is a fair question. WhatsApp reaches your existing customers. But a website reaches people who do not know you exist.

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

  let created = 0;
  for (const post of posts) {
    // Check if the slug already exists
    const existing = await collection.where("slug", "==", post.slug).get();
    if (!existing.empty) {
      console.log(`  Skipping "${post.title}" — slug already exists`);
      continue;
    }

    const docRef = await collection.add({
      ...post,
      published: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`  Created "${post.title}" — ${docRef.id}`);
    created++;
  }

  console.log(`\nDone. Created ${created} new posts. Total in collection: ${(await collection.get()).size}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
