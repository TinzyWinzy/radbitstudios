"use client";

import { useState, useEffect } from "react";
import { blogService, type BlogPost } from "@/services/blog.service";
import BlogEditor from "../../editor";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditBlogPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getById(postId).then(p => {
      setPost(p);
      setLoading(false);
    });
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-muted-foreground py-16 text-center">Post not found.</p>;
  }

  return <BlogEditor initial={post} />;
}
