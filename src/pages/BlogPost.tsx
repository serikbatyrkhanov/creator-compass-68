import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import DOMPurify from "dompurify";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  published_at: string;
  view_count: number;
  author_id: string;
}

interface Author {
  first_name: string | null;
  last_name: string | null;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (postError || !postData) {
      navigate('/blog');
      return;
    }

    setPost(postData);

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: postData.view_count + 1 })
      .eq('id', postData.id);

    // Fetch author
    const { data: authorData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', postData.author_id)
      .single();

    if (authorData) {
      setAuthor(authorData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Button>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-2xl shadow-2xl mb-8"
          />
        )}

        <article className="space-y-6">
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {author && (
                <span className="font-medium">
                  By {author.first_name} {author.last_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} views
              </span>
            </div>
          </header>

          <div className="h-px bg-border" />

          <div
            className="prose prose-sm sm:prose lg:prose-lg max-w-none
                     prose-headings:font-bold prose-headings:text-foreground
                     prose-p:text-foreground prose-p:leading-relaxed
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-foreground prose-strong:font-bold
                     prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                     prose-pre:bg-muted prose-pre:text-foreground
                     prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                     prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </article>

        <div className="mt-12 pt-6 border-t">
          <Button onClick={() => navigate("/blog")} variant="outline">
            View More Articles
          </Button>
        </div>
      </div>
    </div>
  );
}
