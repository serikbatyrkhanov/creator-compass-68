import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload, Trash2, Youtube, Music } from "lucide-react";
import { Instagram } from "lucide-react";
import { normalizeExternalUrl } from "@/lib/socialMediaUtils";

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // User data
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Social media
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  
  // SMS settings
  const [smsConsent, setSmsConsent] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setPhone(profile.phone || "");
        setTimezone(profile.timezone || "America/New_York");
        setAvatarUrl(profile.avatar_url);
        setYoutubeUrl(profile.youtube_url || "");
        setInstagramUrl(profile.instagram_url || "");
        setTiktokUrl(profile.tiktok_url || "");
        setSmsConsent(profile.sms_consent || false);
        setSmsEnabled(profile.sms_notifications_enabled || false);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (2MB)
      if (file.size > 2097152) {
        toast.error("File size must be less than 2MB");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed");
        return;
      }

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${userId}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Avatar updated successfully");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      if (!avatarUrl) return;

      const fileName = avatarUrl.split("/").pop();
      if (!fileName) return;

      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([`${userId}/${fileName}`]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      toast.success("Avatar removed successfully");
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove avatar");
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success("Email update initiated. Please check your new email for confirmation.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateProfile = async (field: string, value: any) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSmsConsentChange = async (checked: boolean) => {
    setSmsConsent(checked);
    if (!checked) {
      setSmsEnabled(false);
      await handleUpdateProfile("sms_notifications_enabled", false);
    }
    await handleUpdateProfile("sms_consent", checked);
  };

  const handleSmsEnabledChange = async (checked: boolean) => {
    if (!smsConsent) {
      toast.error("Please agree to receive SMS notifications first");
      return;
    }
    if (!phone) {
      toast.error("Please add a phone number first");
      return;
    }
    setSmsEnabled(checked);
    await handleUpdateProfile("sms_notifications_enabled", checked);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {firstName?.[0]}{lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
              <div>
                <CardTitle className="text-2xl">
                  {firstName} {lastName}
                </CardTitle>
                <CardDescription>{email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Avatar Management */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Click your avatar above to upload (max 2MB, JPG/PNG/WebP)</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            {avatarUrl && (
              <Button variant="outline" onClick={handleRemoveAvatar}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Avatar
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleUpdateEmail}>Update</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                />
                <Button onClick={() => handleUpdateProfile("phone", phone)}>
                  Update
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={(value) => {
                setTimezone(value);
                handleUpdateProfile("timezone", value);
              }}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Connections</CardTitle>
            <CardDescription>
              Connect your social media profiles to track performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube">
                <Youtube className="inline mr-2 h-4 w-4" />
                YouTube Channel URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="youtube"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onBlur={(e) => {
                    const normalized = normalizeExternalUrl(e.target.value, 'youtube');
                    if (normalized && normalized !== e.target.value) {
                      setYoutubeUrl(normalized);
                    }
                  }}
                  placeholder="https://youtube.com/@channel or @handle"
                />
                <Button onClick={() => handleUpdateProfile("youtube_url", normalizeExternalUrl(youtubeUrl, 'youtube'))}>
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: You can paste @handle or full URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">
                <Instagram className="inline mr-2 h-4 w-4" />
                Instagram Profile URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="instagram"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  onBlur={(e) => {
                    const normalized = normalizeExternalUrl(e.target.value, 'instagram');
                    if (normalized && normalized !== e.target.value) {
                      setInstagramUrl(normalized);
                    }
                  }}
                  placeholder="https://instagram.com/username or @username"
                />
                <Button onClick={() => handleUpdateProfile("instagram_url", normalizeExternalUrl(instagramUrl, 'instagram'))}>
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: You can paste @username or full URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">
                <Music className="inline mr-2 h-4 w-4" />
                TikTok Profile URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tiktok"
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  onBlur={(e) => {
                    const normalized = normalizeExternalUrl(e.target.value, 'tiktok');
                    if (normalized && normalized !== e.target.value) {
                      setTiktokUrl(normalized);
                    }
                  }}
                  placeholder="https://tiktok.com/@username or @username"
                />
                <Button onClick={() => handleUpdateProfile("tiktok_url", normalizeExternalUrl(tiktokUrl, 'tiktok'))}>
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: You can paste @username or full URL</p>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Notifications</CardTitle>
            <CardDescription>
              Receive daily reminders about your content tasks at 9:00 AM in your timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-consent"
                checked={smsConsent}
                onCheckedChange={handleSmsConsentChange}
              />
              <Label htmlFor="sms-consent" className="text-sm font-normal">
                I agree to receive SMS notifications from Climbley about my content tasks and reminders
              </Label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {!smsConsent && "Please agree to receive SMS first"}
                  {smsConsent && !phone && "Please add a phone number first"}
                </p>
              </div>
              <Switch
                checked={smsEnabled}
                onCheckedChange={handleSmsEnabledChange}
                disabled={!smsConsent || !phone}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
