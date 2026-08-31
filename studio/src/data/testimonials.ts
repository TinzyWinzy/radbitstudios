/* ── Testimonials & Reviews for Structured Data ──────────────────────── */

export interface Testimonial {
  name: string;
  company: string;
  role: string;
  text: string;
  rating: number;
  industry: string;
}

// Publish only testimonials backed by written customer approval and retained
// substantiation. No approved testimonials are currently configured.
export const testimonials: Testimonial[] = [];

export function getAverageRating(): number {
  if (testimonials.length === 0) return 0;
  const total = testimonials.reduce((sum, t) => sum + t.rating, 0);
  return Math.round((total / testimonials.length) * 10) / 10;
}

export function getIndustryTestimonials(industry: string): Testimonial[] {
  return testimonials.filter((t) => t.industry === industry);
}

export function aggregateRatingSchema() {
  if (testimonials.length === 0) return null;
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
