import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const platforms = [
  { code: 'youtube_video', nameKey: 'platform.selector.youtube_video', icon: '🎥' },
  { code: 'youtube_shorts', nameKey: 'platform.selector.youtube_shorts', icon: '📱' },
  { code: 'instagram_post', nameKey: 'platform.selector.instagram_post', icon: '📸' },
  { code: 'instagram_reels', nameKey: 'platform.selector.instagram_reels', icon: '🎬' },
  { code: 'tiktok', nameKey: 'platform.selector.tiktok', icon: '🎵' },
];

export const PlatformSelector = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [platform, setPlatform] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformPreference = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_platform')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (!error && data?.preferred_platform) {
            setPlatform(data.preferred_platform);
          }
        }
      } catch (error) {
        console.error('Error fetching platform preference:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformPreference();
  }, []);

  const handlePlatformChange = async (value: string) => {
    setPlatform(value);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_platform: value })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast({
          title: t('common.saved'),
          description: `${t('platform.selector.label')}: ${t(platforms.find(p => p.code === value)?.nameKey || '')}`,
        });
      } catch (error) {
        console.error('Error updating platform preference:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to save platform preference',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return null;
  }

  const selectedPlatform = platforms.find((p) => p.code === platform);

  return (
    <Select value={platform} onValueChange={handlePlatformChange}>
      <SelectTrigger className="w-[200px] bg-background/50 backdrop-blur-sm border-primary/20">
        <Video className="w-4 h-4 mr-2" />
        <SelectValue placeholder={t('platform.selector.label')}>
          {selectedPlatform && (
            <>
              <span className="mr-2">{selectedPlatform.icon}</span>
              {t(selectedPlatform.nameKey)}
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {platforms.map((p) => (
          <SelectItem key={p.code} value={p.code}>
            <span className="mr-2">{p.icon}</span>
            {t(p.nameKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
