import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { checkAdminRole, getCurrentUser } from "@/lib/admin/adminAuth";
import { Loader2 } from "lucide-react";

export function AdminLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const isAdmin = await checkAdminRole(user.id);
        if (!isAdmin) {
          navigate("/dashboard");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Admin verification error:", error);
        navigate("/dashboard");
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
