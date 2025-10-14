import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/ContactUs";
import ResetPassword from "./pages/ResetPassword";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ContentCalendar from "./pages/ContentCalendar";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import LearnMore from "./pages/LearnMore";
import NotFound from "./pages/NotFound";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminImages from "./pages/admin/AdminImages";
import AdminSmsTest from "./pages/admin/AdminSmsTest";
import AdminContent from "./pages/admin/AdminContent";
import AdminReferrals from "./pages/admin/AdminReferrals";
// import ScriptEditor from "./pages/ScriptEditor";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubscriptionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-results/:id" element={<QuizResults />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/content-calendar" element={<ContentCalendar />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/learn-more" element={<LearnMore />} />
            {/* <Route path="/script-editor/:taskId" element={<ScriptEditor />} /> */}
            
            {/* Blog Routes */}
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="blog/new" element={<AdminBlogEditor />} />
              <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="referrals" element={<AdminReferrals />} />
              <Route path="images" element={<AdminImages />} />
              <Route path="sms-test" element={<AdminSmsTest />} />
              <Route path="content" element={<AdminContent />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
