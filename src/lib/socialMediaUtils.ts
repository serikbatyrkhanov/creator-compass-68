/**
 * Normalizes social media URLs to ensure they have proper https:// prefix
 * and converts handles to full URLs
 */
export function normalizeExternalUrl(url: string | null, platform: 'youtube' | 'instagram' | 'tiktok'): string {
  if (!url) return '';
  
  const trimmed = url.trim().replace(/\/+$/, ''); // Remove trailing slashes
  
  // Handle @username format
  if (trimmed.startsWith('@')) {
    const handle = trimmed.substring(1);
    switch (platform) {
      case 'youtube':
        return `https://www.youtube.com/@${handle}`;
      case 'instagram':
        return `https://www.instagram.com/${handle}`;
      case 'tiktok':
        return `https://www.tiktok.com/@${handle}`;
    }
  }
  
  // If it starts with the platform domain without protocol, add https://
  const domainPrefixes = {
    youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
    instagram: ['instagram.com', 'www.instagram.com'],
    tiktok: ['tiktok.com', 'www.tiktok.com']
  };
  
  const platformDomains = domainPrefixes[platform];
  for (const domain of platformDomains) {
    if (trimmed.toLowerCase().startsWith(domain)) {
      return `https://${trimmed}`;
    }
  }
  
  // If no protocol at all, assume https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
}

/**
 * Safely parses a URL that might not have a scheme
 */
export function safeParseUrl(url: string): URL | null {
  try {
    // If no scheme, add https://
    const urlWithScheme = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    return new URL(urlWithScheme);
  } catch (e) {
    return null;
  }
}

/**
 * Extracts username/handle from a social media URL
 */
export function extractUsername(url: string | null, platform: 'youtube' | 'instagram' | 'tiktok'): string {
  if (!url) return 'View Profile';
  
  const urlObj = safeParseUrl(url);
  if (!urlObj) return 'View Profile';
  
  const pathname = urlObj.pathname;
  
  try {
    if (platform === 'youtube') {
      // Handle @username or /channel/ID or /c/customname
      if (pathname.includes('/@')) {
        return pathname.split('/@')[1].split('/')[0];
      } else if (pathname.includes('/channel/')) {
        return pathname.split('/channel/')[1].split('/')[0];
      } else if (pathname.includes('/c/')) {
        return pathname.split('/c/')[1].split('/')[0];
      }
    } else if (platform === 'instagram') {
      // Handle instagram.com/username
      const parts = pathname.split('/').filter(Boolean);
      return parts[0] || 'View Profile';
    } else if (platform === 'tiktok') {
      // Handle tiktok.com/@username
      if (pathname.includes('/@')) {
        return pathname.split('/@')[1].split('/')[0];
      }
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
  }
  
  return 'View Profile';
}
