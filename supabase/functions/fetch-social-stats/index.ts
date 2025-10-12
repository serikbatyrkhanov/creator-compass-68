import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialStats {
  youtube?: {
    subscribers: number;
    videos: number;
    views: number;
  };
  instagram?: {
    followers: number;
    posts: number;
  };
  tiktok?: {
    followers: number;
    likes: number;
    videos: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's profile with social media URLs
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('youtube_url, instagram_url, tiktok_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    const stats: SocialStats = {};

    // Fetch YouTube stats
    if (profile.youtube_url) {
      const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
      if (youtubeApiKey) {
        try {
          const channelId = extractYouTubeChannelId(profile.youtube_url);
          if (channelId) {
            const youtubeResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${youtubeApiKey}`
            );
            const youtubeData = await youtubeResponse.json();
            
            if (youtubeData.items && youtubeData.items.length > 0) {
              const ytStats = youtubeData.items[0].statistics;
              stats.youtube = {
                subscribers: parseInt(ytStats.subscriberCount || '0'),
                videos: parseInt(ytStats.videoCount || '0'),
                views: parseInt(ytStats.viewCount || '0'),
              };
            }
          }
        } catch (error) {
          console.error('YouTube API error:', error);
        }
      }
    }

    // Fetch Instagram stats
    if (profile.instagram_url) {
      const instagramAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
      if (instagramAccessToken) {
        try {
          const username = extractInstagramUsername(profile.instagram_url);
          if (username) {
            // Instagram Graph API requires business account
            const igResponse = await fetch(
              `https://graph.instagram.com/v18.0/me?fields=followers_count,media_count&access_token=${instagramAccessToken}`
            );
            const igData = await igResponse.json();
            
            if (igData.followers_count !== undefined) {
              stats.instagram = {
                followers: igData.followers_count,
                posts: igData.media_count || 0,
              };
            }
          }
        } catch (error) {
          console.error('Instagram API error:', error);
        }
      }
    }

    // Fetch TikTok stats
    if (profile.tiktok_url) {
      const tiktokAccessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
      if (tiktokAccessToken) {
        try {
          const username = extractTikTokUsername(profile.tiktok_url);
          if (username) {
            // TikTok API v2
            const tiktokResponse = await fetch(
              `https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count`,
              {
                headers: {
                  'Authorization': `Bearer ${tiktokAccessToken}`,
                },
              }
            );
            const tiktokData = await tiktokResponse.json();
            
            if (tiktokData.data) {
              stats.tiktok = {
                followers: tiktokData.data.follower_count || 0,
                likes: tiktokData.data.likes_count || 0,
                videos: tiktokData.data.video_count || 0,
              };
            }
          }
        } catch (error) {
          console.error('TikTok API error:', error);
        }
      }
    }

    return new Response(
      JSON.stringify({ stats }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching social stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function extractYouTubeChannelId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different YouTube URL formats
    if (urlObj.pathname.includes('/channel/')) {
      return urlObj.pathname.split('/channel/')[1].split('/')[0];
    }
    
    // For custom URLs, we'd need to use YouTube API to resolve
    // For now, return null and handle in the frontend
    return null;
  } catch {
    return null;
  }
}

function extractInstagramUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(p => p);
    return parts[0] || null;
  } catch {
    return null;
  }
}

function extractTikTokUsername(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(p => p);
    // TikTok URLs are like tiktok.com/@username
    const username = parts[0]?.replace('@', '');
    return username || null;
  } catch {
    return null;
  }
}