import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { articleSchema } from "@/lib/seo";

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
    if (post.published !== true) return { title: "Post Not Found", robots: { index: false, follow: false } };
    const title = (post.metaTitle as string) || post.title as string;
    const description = (post.metaDescription as string) || (post.editorial?.metaDescription as string) || (post.excerpt as string) || `Read ${title} on Radbit Studios.`;
    const imageUrl = (post.imageUrl as string) || undefined;
    const authorName = (post.authorName as string) || "Tinotenda Brandon Duma";
    const publishedAt = post.publishedAt?.toDate?.()?.toISOString?.() || post.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString();
    const modifiedAt = post.updatedAt?.toDate?.()?.toISOString?.() || publishedAt;
    const url = `${SITE_URL}/blog/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: (post.canonicalUrl as string) || `/blog/${slug}` },
      openGraph: {
        title: `${title} | Radbit`,
        description,
        url,
        type: "article",
        publishedTime: publishedAt,
        modifiedTime: modifiedAt,
        authors: [authorName],
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Radbit`,
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

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  let articleLd = null;

  try {
    const snap = await adminDb
      .collection("blog_posts")
      .where("slug", "==", params.slug)
      .limit(1)
      .get();

      if (!snap.empty && snap.docs[0].data().published === true) {
      const post = snap.docs[0].data();
      articleLd = articleSchema({
        title: post.title as string,
        description: (post.metaDescription as string) || (post.excerpt as string) || '',
        url: `${SITE_URL}/blog/${params.slug}`,
        image: (post.imageUrl as string) || undefined,
        authorName: (post.authorName as string) || "Tinotenda Brandon Duma",
        publishedTime: post.publishedAt?.toDate?.()?.toISOString?.() || post.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        modifiedTime: post.updatedAt?.toDate?.()?.toISOString?.(),
        section: post.category as string | undefined,
        keywords: [post.editorial?.primaryKeyword, ...(post.editorial?.secondaryKeywords || []), ...(post.tags || [])].filter(Boolean) as string[],
      });
    }
  } catch {
    // Silently fail — JSON-LD is optional
  }

  return (
    <>
      {articleLd && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      )}
      {children}
    </>
  );
}
