import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/firebase-admin";

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  try {
    const snap = await adminDb
      .collection("blog_posts")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snap.empty) {
      return { title: "Post Not Found" };
    }

    const post = snap.docs[0].data();
    const title = post.title as string;
    const description = (post.excerpt as string) || `Read ${title} on Radbit SME Hub.`;
    const imageUrl = (post.imageUrl as string) || undefined;
    const authorName = (post.authorName as string) || "Radbit SME Hub";
    const publishedAt = post.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString();
    const url = `${SITE_URL}/blog/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: `${title} | Radbit SME Hub`,
        description,
        url,
        type: "article",
        publishedTime: publishedAt,
        authors: [authorName],
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Radbit SME Hub`,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      other: {
        'article:published_time': publishedAt,
        'article:author': authorName,
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
