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
      "A honest breakdown of what it actually costs and how long it takes to register a business in Zimbabwe — from the Deeds Office to PRAZ to ZIMRA. No sugar-coating.",
    tags: ["registration", "PRAZ", "ZIMRA", "costs", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `If you are starting a business in Zimbabwe, the first thing everyone tells you is "you need to register." But nobody tells you what that actually involves until you are knee-deep in forms and wondering if you should have just stayed informal.

I registered my first company in 2022. It took me six weeks and cost more than I expected. Here is the real breakdown so you know what you are getting into.

**Step 1: Company Name Search — $5**

You go to the Deeds Office or use their online portal. You pick three names in case your first choice is taken. Cost is roughly $5 USD equivalent. This takes one to three days depending on whether the system is working.

**Step 2: Incorporation — $50 to $100**

This is where most of the cost lives. You need a registered secretarial firm to prepare your memorandum and articles of association. Most charge between $50 and $100. The process takes about two weeks if the documents are correct. If there are errors, add another week.

**Step 3: CR14 and CR6**

Once incorporated, you file your list of directors (CR6) and shareholders (CR14). These are separate forms with separate fees. About $20 each. Your secretarial firm usually handles this.

**Step 4: ZIMRA Tax Registration — Free**

This part is actually free. You register for income tax, VAT if your turnover exceeds $40,000, and PAYE if you have employees. The online portal at zimra.co.zw works reasonably well. Takes about a week to get your tax clearance certificate.

**Step 5: PRAZ Registration — $50 to $75**

If you want to bid for government tenders, you need to register with the Procurement Regulatory Authority of Zimbabwe. The fee depends on your business size. Micro enterprises pay $50, small pay $60, medium pay $75. The process requires all the documents from steps 1 through 4. I will write a separate guide on PRAZ because there is a lot to cover.

**Step 6: Local Council License — $20 to $200**

Depending on where you operate, your local council requires a business license. Harare City Council charges around $50 for a basic trading license. Some councils charge more. Some charge less. Check with your local authority before you start operating.

**Total Cost: $150 to $400**

The total cost varies depending on whether you DIY or use a secretarial firm. If you use a firm, budget closer to $400. If you do everything yourself, you can keep it under $200.

**Total Time: 3 to 8 weeks**

The fastest I have seen is three weeks. The slowest was two months. It depends on how busy the Deeds Office is and whether your documents are correct the first time.

**What I Wish I Knew Before Starting**

Get a good secretarial firm. The extra $50 they charge saves you weeks of back-and-forth. Keep copies of everything. You will need them for PRAZ, for bank accounts, and for tenders. And start the process before you actually need to trade — doing it while running a business is stressful.

That is the real picture. It is not as hard as people make it sound, but it is not as quick or cheap as you hope. Go in with your eyes open and you will be fine.`,
  },
  {
    title: "What Load-Shedding Taught Me About Running a Business",
    slug: "load-shedding-business-lessons",
    excerpt:
      "After two years of running a small retail shop through Zimbabwe's load-shedding schedule, here is what I learned about keeping the lights on and the business running.",
    tags: ["load-shedding", "energy", "operations", "retail"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `The first time the power went out during a customer transaction, I panicked. The EcoCash payment went through on my phone but the receipt printer was dead and the customer was staring at me like I had broken something. That was two years ago. Now I plan my entire week around the load-shedding schedule.

If you run a business in Zimbabwe, you already know this story. Here is what I learned.

**Your Phone Is Your Most Important Business Tool**

Before load-shedding got bad, I treated my phone like a nice-to-have. Now it is the backbone of my business. I process payments through EcoCash and bank apps. I communicate with suppliers on WhatsApp. I market on Facebook and Instagram. When the power is off, my phone keeps working because I charge it in the car or at a friend's place.

If you have not set up EcoCash Business yet, do it. The personal accounts have limits that will frustrate you. The business account costs nothing to set up and gives you proper transaction records.

**Backup Power Does Not Have to Cost a Fortune**

Everyone told me to buy a generator. A decent one costs $500 to $800. That is too much for most small businesses. I bought a small inverter and a deep-cycle battery for $200. It runs my lights, my WiFi router, and charges phones for about four hours. That is enough to get through most load-shedding sessions.

If you need to run a till or a fridge, you need a bigger system. But for a basic retail or service business, a $200 inverter setup works.

**Your Customers Understand — But Only to a Point**

Customers know about load-shedding. They live through it too. But they still expect you to deliver. If your shop is dark and you cannot process payments, they will go to the next shop that has backup power.

I started keeping a small notebook and a calculator for manual transactions during outages. I write down what the customer bought, the amount, and their name. When the power comes back, I enter everything into the system. It is old-school but it works.

**Plan Your Week Around the Schedule**

The ZESA load-shedding schedule is posted every Sunday. I plan my stock deliveries, my staff shifts, and my maintenance work around it. I do heavy cleaning and stocktaking during outages because those tasks do not need electricity. I do customer-facing work during power hours.

**The Bottom Line**

Load-shedding is not going away anytime soon. The businesses that survive are the ones that adapt. Small changes like getting a basic inverter, setting up mobile payment systems, and planning around the schedule make a big difference.

I lost about 15 percent of my revenue in the first three months of serious load-shedding. After I put these systems in place, I recovered most of it. It is not ideal, but it is manageable.`,
  },
  {
    title: "EcoCash Business vs Bank Account: When to Use What",
    slug: "ecocash-business-vs-bank-account",
    excerpt:
      "A practical comparison of EcoCash Business and traditional bank accounts for Zimbabwean SMEs — fees, limits, tax implications, and when each makes sense.",
    tags: ["EcoCash", "banking", "payments", "finance", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Every SME owner in Zimbabwe has asked themselves this question: should I put this money through EcoCash or the bank? The answer depends on what you are doing, how much money is involved, and whether you want ZIMRA to see it.

Here is how I think about it after three years of running a business.

**EcoCash Business — When It Works**

EcoCash Business is brilliant for small, frequent transactions. If you are taking payments from customers who prefer mobile money, it is the most convenient option. Your customers scan your till number, the money hits your account instantly, and you can withdraw it at any EcoCash agent.

The fees are reasonable. Sending money costs between 2 and 5 percent depending on the amount. Receiving money is free. Withdrawing cash costs about 2 percent.

The daily transaction limit for EcoCash Business accounts is higher than personal accounts. You can receive up to $5,000 per day and hold a balance of $10,000. That is enough for most small businesses.

**Bank Account — When It Works**

For larger transactions, a bank account is better. If you are paying suppliers more than $500, writing a cheque or doing an EFT is cheaper than moving that much through EcoCash. Bank transfer fees are usually a flat $1 to $3 regardless of the amount.

Bank accounts also give you proper statements that make accounting easier. Your bookkeeper will thank you. EcoCash statements exist but they are harder to reconcile, especially if you do high volumes.

**Tax Considerations**

Here is the honest truth: ZIMRA can see both. EcoCash is not invisible. Cassava Smartech shares data with ZIMRA under the tax compliance framework. If you are using EcoCash to avoid tax, stop. It will catch up with you.

The right approach is the same for both: keep proper records, declare your income, and pay your taxes. The medium you use to receive money does not change your tax obligations.

**My Rule of Thumb**

I use EcoCash Business for transactions under $200. For anything above that, I use my bank account. I keep an EcoCash float of about $500 for daily operations and move everything else to the bank at the end of each week.

This system works because I am not paying high fees on large transactions and I am not inconveniencing customers who want to pay with mobile money. The key is to have both and use them for what they are good at.

**One More Thing**

If you are a formal business registered with ZIMRA, your customers who need receipts for tax purposes prefer bank transfers. EcoCash receipts are not always accepted by corporate clients. Keep that in mind when choosing your payment methods.`,
  },
  {
    title: "I Tried Tender Bidding for the First Time — Here Is What Happened",
    slug: "first-tender-bidding-experience",
    excerpt:
      "A personal story about applying for a government tender as a small business — the paperwork, the waiting, the result, and what I would do differently next time.",
    tags: ["tenders", "bidding", "government", "PRAZ", "experience"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `A friend told me about a tender from the Ministry of Education for school supplies. Fifty rural schools needed exercise books, stationery, and basic science equipment. The tender value was $45,000. I had never bid for anything in my life, but I decided to try.

Here is what happened.

**Getting the Documents Together**

The first shock was the document list. I needed my certificate of incorporation, CR14, CR6, tax clearance, NSSA compliance, proof of residence for directors, and a bunch of other papers. I had some of these but not all. It took me two weeks to gather everything.

The PRAZ registration was the hardest part. I had to upload every document to their portal, wait for verification, then get my registration certificate. Total cost was $60 for the registration plus about $50 in transport and printing costs.

**Writing the Proposal**

The tender required a technical proposal and a financial proposal. I had no idea what a technical proposal looked like. I asked a friend who works in procurement and she showed me an example. Basically, you explain how you will deliver the goods, your timeline, your quality control process, and your experience.

I spent three days writing it. Looking back, it was not great. But it was honest.

**The Waiting**

The closing date was 25 July. I submitted on 24 July. Then I waited. And waited. And waited.

I did not hear anything for six weeks. I called the procurement office twice. The first time they said "evaluation is in progress." The second time they said "results will be published soon."

**The Result**

I did not win. The contract went to a company that had been supplying schools for years. They had references. I did not.

I was disappointed but not surprised. The feedback I got was that my pricing was competitive but my experience section was weak. Fair enough.

**What I Learned**

I would do three things differently next time. First, I would start building relationships with procurement officers before the tender is published. Second, I would get a reference project — even a small one — before bidding on something big. Third, I would invest more time in the proposal.

But I am glad I tried. The process taught me more about my business than any workshop or article could. I now know what PRAZ compliance actually means. I know how to read a tender document. I know what evaluators are looking for.

I will bid again. And I will probably lose again. But eventually, I will win one.`,
  },
  {
    title: "Tax Deadlines Every Zimbabwean SME Owner Should Pin to Their Wall",
    slug: "zimra-tax-deadlines-sme",
    excerpt:
      "The ZIMRA tax calendar broken down month by month — QPD dates, annual returns, VAT deadlines, and what happens if you miss them. Print this and stick it on your wall.",
    tags: ["ZIMRA", "tax", "deadlines", "compliance", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `Missing a ZIMRA deadline is expensive. The penalties add up fast and they do not care that you were busy running your business. Here is the calendar I follow. Print it, pin it, live by it.

**Quarterly Payment Dates (QPDs)**

If you are on the Quarterly Payment Date system — which most small businesses are — your due dates are:

- QPD 1: 25 March
- QPD 2: 25 June
- QPD 3: 25 September
- QPD 4: 25 December

You pay your estimated tax in four instalments. The trick is to estimate correctly. If you underpay by more than 10 percent, you get charged interest. If you overpay, ZIMRA refunds you but it takes months.

**VAT Returns**

If your annual turnover exceeds $40,000, you must register for VAT. VAT returns are due every two months:

- January/February: due 25 March
- March/April: due 25 May
- May/June: due 25 July
- July/August: due 25 September
- September/October: due 25 November
- November/December: due 25 January

**PAYE**

If you have employees, PAYE is due on the 10th of every month. The return covers the previous month's salaries. Late submission attracts a penalty of $200 plus 3 percent interest per month on the unpaid amount.

**Annual Returns**

Your annual income tax return is due by 30 April of the following year. So for the 2025 tax year, your return is due by 30 April 2026. Extension requests are possible but you need a good reason and you must apply before the deadline.

**What Happens If You Miss a Deadline**

The penalties add up quickly. Late payment attracts interest of 3 percent per month. Late submission attracts a penalty of $200 per month for each month the return is overdue. Non-submission can lead to ZIMRA estimating your tax liability and demanding payment based on their estimate.

I speak from experience. I missed a QPD in 2023. The interest and penalties cost me about $400 before I sorted it out. Not worth it.

**How to Stay on Top**

I use three reminders. My phone calendar alerts me a week before each deadline. My accountant sends a reminder three days before. And I have a physical calendar on my office wall with every date highlighted in red.

Set up a system that works for you. The dates do not change. There is no excuse for missing them.

**Final Tip**

If you are struggling to pay, talk to ZIMRA before the deadline. They offer payment plans. The interest keeps accruing but at least you avoid the penalties. Ignoring the problem makes it ten times worse.`,
  },
  {
    title: "Moving from Excel to Accounting Software: My Experience",
    slug: "excel-to-accounting-software-experience",
    excerpt:
      "After three years of running my books on Excel, I switched to accounting software. Here is what it cost, how long it took to learn, and whether it was worth it.",
    tags: ["accounting", "software", "finance", "tools", "experience"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `For three years, my business ran on Excel spreadsheets. I had one for sales, one for expenses, one for stock, and one for tax calculations. Every month I spent about eight hours reconciling everything. Every quarter I spent a full weekend preparing for QPD.

Last year, I switched to proper accounting software. Here is how it went.

**Why I Finally Switched**

Three things pushed me over the edge. First, I made a data entry error in my expense sheet and did not notice for two months. It messed up my QPD calculation and I ended up underpaying. The interest cost me $120.

Second, my accountant told me she was spending too much time fixing my Excel exports. She offered a discount on her monthly fee if I used software that integrated with her system.

Third, ZIMRA introduced the requirement for electronic tax invoices. Excel could not generate those.

**The Cost**

I looked at three options. Pastel costing about $30 per month. QuickBooks costing about $25 per month. And a local option called AutoBooks costing about $15 per month.

I went with AutoBooks because it had ZIMRA-compliant invoicing built in and the support team is based in Harare. The setup fee was $50 and the monthly subscription is $15. Total first year cost was $230.

**The Learning Curve**

It took me about two weeks to get comfortable with the software. The first week was frustrating. I kept looking for features that were in different places than I expected. The second week it started clicking.

The support team helped me migrate my Excel data. That took a day. Some of it did not transfer cleanly so I had to fix a few entries manually. But overall it was smoother than I expected.

**The Results**

After six months, here is what changed. My monthly bookkeeping time went from eight hours to two hours. My accountant reduced her fee by $20 per month because my data was cleaner. My QPD calculations are now automated so I do not make errors anymore. And I can generate ZIMRA-compliant invoices in about 30 seconds.

The best part is the reporting. I can see my profit margins by product category, my cash flow forecast, and my tax liability at any time. Excel could do some of this but not as easily.

**Was It Worth It?**

Yes. The software pays for itself in the time I save alone. The reduced accounting fees cover the subscription. And the peace of mind from knowing my books are correct is worth more than the money.

If you are still using Excel, I get it. It feels fine until something goes wrong. When you are ready to switch, start with a free trial of two or three options. Pick the one that feels natural. The migration is not as painful as you think.`,
  },
  {
    title: "How I Got PRAZ Compliant in 2 Weeks (And What It Cost)",
    slug: "praz-compliance-two-weeks",
    excerpt:
      "A step-by-step account of getting registered with the Procurement Regulatory Authority of Zimbabwe — the documents you need, the process, and the total cost.",
    tags: ["PRAZ", "compliance", "registration", "tenders", "SME"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `If you want to bid for government tenders in Zimbabwe, you need to be PRAZ compliant. I heard this for two years before I actually did it. When I finally went through the process, it was not as bad as I expected. Here is exactly what I did.

**Week 1: Getting My Documents Ready**

The PRAZ portal requires seven documents. Here is what I needed:

1. Certificate of Incorporation — I had this from when I registered my company
2. CR14 (List of Shareholders) — My secretarial firm provided this
3. CR6 (List of Directors) — Same as above
4. ZIMRA Tax Clearance (ITF263) — I applied online at zimra.co.zw. It took three days.
5. NSSA Compliance Certificate — I had to register with NSSA first, which took two days
6. Business Operating License — My Harare City Council license was current
7. Proof of Residence for Directors — I used my utility bill

The documents I already had cost me nothing. The ones I needed to get cost about $40 in total — mostly transport and printing.

**Week 2: The Online Registration**

The PRAZ portal is at praz.org.zw. The registration process was straightforward. I created an account, filled in my company details, uploaded each document, and paid the registration fee.

The fee depends on your business classification. I run a small retail business so I fell into the micro category. The fee was $50. If you are classified as small, it is $60. Medium businesses pay $75.

The classification is based on your annual revenue, number of employees, and asset value. The portal asks you these questions and tells you your category.

**The Verification**

After submitting, my documents went through a verification process. This took four days. On day four, I received an email saying my registration was approved. I logged into the portal and downloaded my PRAZ registration certificate.

**What I Spent**

Here is the total:

- Document gathering: $40
- PRAZ registration fee: $50
- Transport: $15
- Printing and scanning: $10
- Total: $115

I did everything myself. If you use a consultant, expect to pay between $140 and $150 on top of the fees. Consultants charge for document preparation and portal navigation. Honestly, the portal is not that complicated. You can do it yourself.

**What Changed After Registration**

The biggest change is that I can now see tender opportunities on the PRAZ portal. Before registration, the system showed me everything but I could not apply. Now I can submit bids.

I have not won a tender yet. But I am on the list. And I know that when the right opportunity comes up, I will be able to bid without rushing to get documents together.

**My Advice**

Get PRAZ compliant even if you are not planning to bid immediately. The registration is valid for a year. Having it done means you can jump on opportunities without scrambling. And some private sector clients also ask for PRAZ compliance as a credibility indicator. It is worth the $115 and two weeks.`,
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

I run a small agro-processing business and WhatsApp is my main sales channel. Here is how I use it beyond the basics.

**Catalogues Instead of Price Lists**

The WhatsApp Business app has a catalogue feature. You can add your products with photos, descriptions, and prices. When a customer asks "what do you have," you send them your catalogue instead of typing everything out.

Setting up the catalogue took me an afternoon. Now customers browse my products like they are on a website. They pick what they want and send me their order. It has cut my response time in half.

**Quick Replies for Common Questions**

I get the same questions every day. "What time do you deliver?" "Do you deliver to Borrowdale?" "What is your payment method?"

I set up quick replies for these. I type "/delivery" and the app automatically types my delivery policy. I type "/payments" and it lists my payment options.

This saves me hours every week. The setup is simple. Open WhatsApp Business settings, go to Business Tools, then Quick Replies. Type your message and assign a shortcut.

**Labels for Organisation**

The WhatsApp Business app lets you label conversations. I use labels like "New Order," "Payment Received," "Delivered," "Follow Up," and "Query."

When a new customer messages me, I label them "New Order." After they pay, I change it to "Payment Received." After delivery, "Delivered." This way I know exactly where each customer is in the process without reading every message.

**Payment Collection**

This is the game changer. When a customer places an order, I send them my EcoCash till number or Paynow link directly in the chat. They pay without leaving WhatsApp. I confirm payment, send a receipt, and arrange delivery.

The whole transaction happens in one chat thread. No phone calls, no separate payment apps, no confusion.

**What Not to Do**

Do not add customers to broadcast lists without their permission. People hate that. Do not send voice notes for important information — type it so they can refer back to it. And do not use your personal WhatsApp number for business if you can avoid it. The WhatsApp Business app gives you professional features that your personal number does not have.

**The Result**

My sales increased by about 30 percent after I set up the WhatsApp Business system properly. Customers appreciate the speed and professionalism. And I spend less time answering the same questions over and over.

If you have not set up WhatsApp Business yet, do it today. It takes an hour and the return on that hour is massive.`,
  },
  {
    title: "Exporting from Zimbabwe: One SME's Journey into SADC",
    slug: "exporting-zimbabwe-sme-sadc-journey",
    excerpt:
      "The real story of a small Zimbabwean manufacturer who started exporting to Zambia — the paperwork, the logistics, the payments, and the lessons learned along the way.",
    tags: ["export", "SADC", "trade", "logistics", "manufacturing"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `I make packaging materials for food products. For three years, I only sold in Zimbabwe. Then a contact in Lusaka asked if I could supply them. I said yes without knowing what I was getting into. Here is what happened.

**The Paperwork**

Exporting from Zimbabwe requires more documents than I expected. The main ones are:

1. A valid ZIMRA tax clearance certificate
2. An export license from the Ministry of Industry and Commerce
3. A certificate of origin (issued by the Zimbabwe National Chamber of Commerce)
4. A commercial invoice and packing list
5. A bill of lading or air waybill
6. SADC certificate of origin (to qualify for reduced duties under the SADC FTA)

The export license took three weeks to process. The certificate of origin took two days. ZIMRA clearance I already had.

**The Logistics**

Shipping from Harare to Lusaka by road takes about 24 hours. I used a freight forwarder based in Harare. They handled the border clearance, the customs documentation, and the delivery. Their fee was $350 for the shipment.

The border crossing at Chirundu was smoother than I expected. The freight forwarder handled everything. I stayed in Harare and monitored the tracking online.

**The Payment**

Payment was the hardest part. My customer in Zambia wanted to pay in Zambian Kwacha. I wanted USD. We settled on a 50/50 split — half in USD, half in ZKW at the prevailing rate.

The transfer took five days to clear through the banking system. Next time, I will ask for a SWIFT transfer in USD only. It costs more in fees but it is less stressful.

**The Costs**

Here is what my first export shipment cost:

- Export license: $100
- Certificates and documentation: $50
- Freight forwarder: $350
- Bank charges for the international transfer: $35
- Total: $535

My profit margin on that first order was thin because of all the one-time setup costs. But the customer has placed three more orders since then. The costs per shipment have come down because I only pay the freight and bank charges now.

**What I Learned**

Get a good freight forwarder. They are worth every dollar. The documentation is not as complicated as people make it sound. Go to ZIMRA, go to the Ministry, ask questions. The officials are helpful if you are polite.

Start small. My first order was $2,000. That was small enough that a mistake would not have bankrupted me but large enough to test the system.

And be patient. Exporting takes longer than domestic sales. A sale that takes three days locally takes three weeks when exporting. Build that into your pricing and your promises to customers.

I am now looking at Botswana and Mozambique. The system is the same. The paperwork is similar. The lesson from the first trip was simple: the hardest part is the first one. After that, it becomes routine.`,
  },
  {
    title: "Why Your Business Needs a Website (Even If You Are on WhatsApp)",
    slug: "why-business-needs-website-not-just-whatsapp",
    excerpt:
      "An honest look at when a website matters for a Zimbabwean SME, when it does not, and the cheapest way to get online without wasting money.",
    tags: ["website", "online presence", "marketing", "digital"],
    authorName: "Radbit Editorial",
    imageUrl: "/blog/placeholder.svg",
    content: `I hear this all the time: "But I already have WhatsApp. Why do I need a website?"

It is a fair question. WhatsApp reaches your existing customers. But a website reaches people who do not know you exist.

**When WhatsApp Is Enough**

If you run a small tuckshop in your neighbourhood, a website is a waste of money. Your customers walk past your door. They know you. WhatsApp works fine for taking orders and answering questions.

If you are a hairdresser or a plumber who gets all their work through referrals, same thing. A website will not bring you more business than a good reputation.

**When You Need a Website**

Here is where a website matters. When a potential customer hears about your business and searches for you online. If they find nothing, they question whether you are real. If they find a Facebook page from 2019 with three posts, they question whether you are active. If they find a clean website that explains what you do and how to reach you, they trust you.

I lost a contract with a school because they searched for my business online and found nothing. The procurement officer told me directly: "We could not verify your company." I built a website the next week.

**How Much It Actually Costs**

You do not need to spend thousands. A simple one-page website costs between $50 and $150 to build using platforms like Wix, Squarespace, or WordPress. Hosting costs about $10 per month. A domain name costs about $15 per year.

If you want something more custom, expect to pay $300 to $500. That is still less than what most people think websites cost.

**What to Put on It**

Your website needs five things. Your business name and what you do. Your contact details including phone, email, and physical address. Your products or services with prices if possible. Testimonials from happy customers. And a way for people to contact you or place an order.

That is it. You do not need a blog, a newsletter, or a live chat. You can add those later if you want. Start with the basics.

**The Bottom Line**

I am not saying close your WhatsApp and build a website. I am saying do both. WhatsApp is where your conversations happen. Your website is where your credibility lives. They work together.

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
