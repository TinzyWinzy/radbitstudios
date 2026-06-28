"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { blogService, type BlogPost } from "@/services/blog.service";
import BlogEditor from "../../editor";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthContext } from "@/contexts/auth-context";

export default function EditBlogPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    blogService.getById(postId).then(p => {
      setPost(p);
      setLoading(false);
    });
  }, [postId, role, router]);

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
