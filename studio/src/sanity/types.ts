export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  body?: any;
  publishedAt: string;
  mainImage?: any;
  author?: {
    name: string;
    image?: any;
    bio?: string;
  };
  categories?: { title: string }[];
  seoDescription?: string;
  tags?: string[];
}
