import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Link2, Users, TrendingUp, Activity } from "lucide-react";
import { CreateReferralDialog } from "@/components/admin/referrals/CreateReferralDialog";
import { ReferralLinkTable } from "@/components/admin/referrals/ReferralLinkTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminReferrals() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [links, setLinks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLinks: 0,
    activeLinks: 0,
    totalSignups: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch referral links with signup counts
      const { data: linksData, error: linksError } = await supabase
        .from('referral_links')
        .select(`
          *,
          referral_signups(count)
        `)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // Process the data to flatten the count
      const processedLinks = linksData?.map(link => ({
        ...link,
        signup_count: link.referral_signups?.[0]?.count || 0
      }));

      setLinks(processedLinks || []);

      // Calculate stats
      const totalLinks = processedLinks?.length || 0;
      const activeLinks = processedLinks?.filter(l => l.is_active).length || 0;
      const totalSignups = processedLinks?.reduce((sum, l) => sum + (l.signup_count || 0), 0) || 0;

      // Fetch conversion stats
      const { data: statsData, error: statsError } = await supabase.functions.invoke('get-referral-stats');

      if (!statsError && statsData) {
        setStats({
          totalLinks,
          activeLinks,
          totalSignups,
          conversionRate: statsData.conversionRate || 0
        });
      } else {
        setStats({
          totalLinks,
          activeLinks,
          totalSignups,
          conversionRate: 0
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Referral Link Management</h1>
          <p className="text-muted-foreground">
            Create and track promotional referral links
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Referral Link
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLinks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSignups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral Links</CardTitle>
          <CardDescription>
            Manage all your referral links and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No referral links yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first referral link to start tracking promotional campaigns
              </p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Referral Link
              </Button>
            </div>
          ) : (
            <ReferralLinkTable links={links} onUpdate={fetchData} />
          )}
        </CardContent>
      </Card>

      <CreateReferralDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchData}
      />
    </div>
  );
}