import { faqPageSchema } from '@/lib/seo';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ questions }: { questions: FAQItem[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqPageSchema(questions)),
      }}
    />
  );
}
