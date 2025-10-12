import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/blog/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminBlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [authorId, setAuthorId] = useState("");

  useEffect(() => {
    const getAuthorId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAuthorId(user.id);
    };
    getAuthorId();

    if (id) {
      loadPost();
    }
  }, [id]);

  useEffect(() => {
    if (!id && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, id]);

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error("Failed to load post");
      navigate("/admin/blog");
    } else if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || "");
      setContent(data.content);
      setCoverImage(data.cover_image_url || "");
      setStatus(data.status);
      setIsFeatured(data.is_featured);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleImageUpload(file);
      setCoverImage(url);
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error("Failed to upload cover image");
    }
  };

  const handleSave = async (publishNow: boolean = false) => {
    if (!title || !content || !authorId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const postData = {
      title,
      slug,
      content,
      excerpt,
      cover_image_url: coverImage,
      author_id: authorId,
      status: publishNow ? 'published' : status,
      is_featured: isFeatured,
      published_at: publishNow ? new Date().toISOString() : null,
    };

    try {
      if (id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);

        if (error) throw error;
        toast.success("Post created successfully");
      }

      navigate("/admin/blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/admin/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={loading}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{id ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (160 characters)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description for card preview"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">{excerpt.length}/160</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
            />
            {coverImage && (
              <img src={coverImage} alt="Cover preview" className="mt-2 w-full h-48 object-cover rounded-lg" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Post
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
