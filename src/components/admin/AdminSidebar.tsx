import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Image, MessageSquare, Newspaper, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Blog Posts", icon: Newspaper, path: "/admin/blog" },
  { title: "Referrals", icon: Link2, path: "/admin/referrals" },
  { title: "Slider Images", icon: Image, path: "/admin/images" },
  { title: "Content", icon: FileText, path: "/admin/content" },
  { title: "SMS Test", icon: MessageSquare, path: "/admin/sms-test" },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-card min-h-screen">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Climbley Management</p>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
