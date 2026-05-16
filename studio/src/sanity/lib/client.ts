import { createClient } from "next-sanity";
import type { Post } from "@/sanity/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const isConfigured = !!projectId;

export const client = isConfigured
  ? createClient({ projectId, dataset, apiVersion: "2024-01-01", useCdn: true, perspective: "published" })
  : null;

export async function fetchPosts(): Promise<Post[]> {
  if (!client) return [];
  return client.fetch(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, mainImage,
    author->{name, image},
    categories[]->{title}
  }`);
}

export async function fetchPost(slug: string): Promise<Post | null> {
  if (!client) return null;
  return client.fetch(`*[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, body, publishedAt, mainImage,
    author->{name, image, bio},
    categories[]->{title}, seoDescription, tags
  }`, { slug });
}

export async function fetchPostSlugs(): Promise<{ slug: string }[]> {
  if (!client) return [];
  return client.fetch(`*[_type == "post" && defined(slug.current)] { "slug": slug.current }`);
}
