import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Newspaper, MessageSquare, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stats {
  users: number;
  contentPlans: number;
  blogPosts: number;
  chatMessages: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    users: 0,
    contentPlans: 0,
    blogPosts: 0,
    chatMessages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, plansRes, postsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('content_plans').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        users: usersRes.count || 0,
        contentPlans: plansRes.count || 0,
        blogPosts: postsRes.count || 0,
        chatMessages: messagesRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.users, icon: Users, color: "text-blue-500" },
    { title: "Content Plans", value: stats.contentPlans, icon: FileText, color: "text-green-500" },
    { title: "Blog Posts", value: stats.blogPosts, icon: Newspaper, color: "text-purple-500" },
    { title: "Chat Messages", value: stats.chatMessages, icon: MessageSquare, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate("/admin/blog/new")} className="w-full justify-start">
              <Newspaper className="mr-2 h-4 w-4" />
              Create New Blog Post
            </Button>
            <Button onClick={() => navigate("/admin/sms-test")} variant="outline" className="w-full justify-start">
              <Send className="mr-2 h-4 w-4" />
              Send Test SMS
            </Button>
            <Button onClick={() => navigate("/admin/users")} variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm text-green-500 font-medium">● Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <span className="text-sm text-green-500 font-medium">● Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Edge Functions</span>
              <span className="text-sm text-green-500 font-medium">● Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
