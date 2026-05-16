import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
}

function getSlug(fileName: string): string {
  return fileName.replace(/\.md$/, "");
}

function parseFrontmatter(slug: string, fileContents: string): BlogPostMeta {
  const { data } = matter(fileContents);
  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    excerpt: data.excerpt || "",
    tags: data.tags || [],
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter(f => f.endsWith(".md")).map(getSlug);
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const slugs = getAllPostSlugs();
  const posts = slugs.map(slug => {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    return parseFrontmatter(slug, fileContents);
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const result = await remark().use(gfm).use(html, { sanitize: false }).process(content);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    contentHtml: result.toString(),
  };
}
