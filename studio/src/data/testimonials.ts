/* ── Testimonials & Reviews for Structured Data ──────────────────────── */

export interface Testimonial {
  name: string;
  company: string;
  role: string;
  text: string;
  rating: number;
  industry: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Tendai Moyo",
    company: "Moyo Construction",
    role: "Managing Director",
    text: "Radbit's tender alerts saved us 10 hours a week. We went from missing 60% of government tenders to winning 3 contracts in our first quarter.",
    rating: 5,
    industry: "construction",
  },
  {
    name: "Chipo Nyathi",
    company: "Nyathi Pharmacy",
    role: "Owner",
    text: "The pharmacy inventory module alone pays for itself. We reduced stock-outs by 80% and our expiry tracking is now automated.",
    rating: 5,
    industry: "healthcare",
  },
  {
    name: "Farai Mapfumo",
    company: "Mapfumo & Associates",
    role: "Senior Partner",
    text: "The compliance calendar is a game-changer. We used to miss ZIMRA deadlines every quarter. Now we get reminders 30 days in advance.",
    rating: 5,
    industry: "professional-services",
  },
  {
    name: "Rudo Chakanyuka",
    company: "Harare Fashion Hub",
    role: "Founder",
    text: "I switched from manual stock counts to Radbit's inventory system. What used to take 2 days now takes 20 minutes. And the WhatsApp ordering feature doubled our online sales.",
    rating: 5,
    industry: "retail",
  },
  {
    name: "Blessing Dube",
    company: "Dube Academy",
    role: "Principal",
    text: "Fee collection went from chasing parents door-to-door to automated WhatsApp reminders. Our collection rate improved from 65% to 92% in one term.",
    rating: 5,
    industry: "education",
  },
  {
    name: "Takunda Shumba",
    company: "Shumba Microfinance",
    role: "Operations Manager",
    text: "We moved from Excel spreadsheets to Radbit's loan management system. Now we can track 500+ loans accurately and generate RBZ reports in minutes.",
    rating: 4,
    industry: "financial-services",
  },
];

export function getAverageRating(): number {
  const total = testimonials.reduce((sum, t) => sum + t.rating, 0);
  return Math.round((total / testimonials.length) * 10) / 10;
}

export function getIndustryTestimonials(industry: string): Testimonial[] {
  return testimonials.filter((t) => t.industry === industry);
}

export function aggregateRatingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: getAverageRating().toString(),
    bestRating: '5',
    worstRating: '1',
    ratingCount: testimonials.length.toString(),
    reviewCount: testimonials.length.toString(),
    itemReviewed: {
      '@type': 'Organization',
      name: 'Radbit',
    },
  };
}

export function reviewSchema(testimonial: Testimonial) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: testimonial.rating.toString(),
      bestRating: '5',
    },
    author: {
      '@type': 'Person',
      name: testimonial.name,
    },
    reviewBody: testimonial.text,
    itemReviewed: {
      '@type': 'Organization',
      name: 'Radbit',
    },
  };
}
