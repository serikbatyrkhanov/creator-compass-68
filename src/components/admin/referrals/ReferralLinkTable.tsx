import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PRODUCTION_DOMAIN } from "@/lib/constants";

interface ReferralLink {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
}

interface ReferralLinkTableProps {
  links: ReferralLink[];
  onUpdate: () => void;
}

export function ReferralLinkTable({ links, onUpdate }: ReferralLinkTableProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    const url = `${PRODUCTION_DOMAIN}?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this referral link?")) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('referral_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral link deleted"
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('update-referral-link', {
        body: {
          id,
          isActive: !currentStatus
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Referral link ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatus = (link: ReferralLink) => {
    if (!link.is_active) return { label: "Inactive", variant: "secondary" as const };
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (link.max_uses && link.current_uses >= link.max_uses) {
      return { label: "Max Reached", variant: "secondary" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Signups</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => {
          const status = getStatus(link);
          return (
            <TableRow key={link.id}>
              <TableCell className="font-mono">{link.code}</TableCell>
              <TableCell className="max-w-xs truncate">{link.description}</TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>{link.current_uses}</TableCell>
              <TableCell>{format(new Date(link.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                {link.expires_at ? format(new Date(link.expires_at), "MMM d, yyyy") : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(link.code)}
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/admin/referrals/${link.id}`)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleActive(link.id, link.is_active)}
                    title={link.is_active ? "Deactivate" : "Activate"}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(link.id)}
                    disabled={deletingId === link.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}