import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const convertYouTubeUrlToEmbed = (url: string): string => {
  try {
    // Normalize protocol
    let normalizedUrl = url;
    if (url.startsWith('//')) {
      normalizedUrl = 'https:' + url;
    } else if (url.startsWith('www.')) {
      normalizedUrl = 'https://' + url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = 'https://' + url;
    }
    
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Already an embed URL
    if (urlObj.pathname.startsWith('/embed/')) {
      return normalizedUrl;
    }
    
    // Handle youtu.be short URLs
    if (hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1).split('/')[0].split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle youtube.com/watch?v= URLs
    if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Return original if not a video URL
    return normalizedUrl;
  } catch (e) {
    return url;
  }
};

export function RichTextEditor({ content, onChange, onImageUpload }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[300px] max-w-none p-4',
      },
    },
  });

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      // Convert YouTube URLs to embed format
      const finalUrl = linkUrl.includes('youtube.com') || linkUrl.includes('youtu.be')
        ? convertYouTubeUrlToEmbed(linkUrl)
        : linkUrl;
      
      editor.chain().focus().setLink({ href: finalUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const insertImageUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt || 'Image' }).run();
      setImageUrl('');
      setImageAlt('');
      setShowImageDialog(false);
    }
  };

  const MenuButton = ({ onClick, active, children }: any) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          <Quote className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
        >
          <Code className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-8 bg-border mx-1" />

        <MenuButton onClick={() => setShowLinkDialog(true)}>
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => setShowImageDialog(true)}>
          <ImageIcon className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-8 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-8 bg-border mx-1" />

        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild>
            <span>
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </span>
          </Button>
        </label>
      </div>

      <EditorContent editor={editor} className="bg-background" />

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL</Label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                placeholder="Describe the image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertImageUrl}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
