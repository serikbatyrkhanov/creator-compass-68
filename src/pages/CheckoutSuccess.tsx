import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error" | "needs-info">("processing");
  const [sessionEmail, setSessionEmail] = useState<string>("");
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    phone: "", 
    password: "" 
  });

  useEffect(() => {
    const createAccountAndSignIn = async () => {
      try {
        console.log("Starting account creation after successful payment");
        
        // Try localStorage first (shared across tabs)
        const pendingSignup = localStorage.getItem('pendingSignup');
        
        if (pendingSignup) {
          // Path 1: localStorage available
          const { email, password, firstName, lastName, phone } = JSON.parse(pendingSignup);
          console.log("Retrieved credentials from localStorage for email:", email);

          await completeSignup(email, password, firstName, lastName, phone);
        } else {
          // Path 2: Fallback to session_id from URL
          console.log("No localStorage found, attempting session_id fallback");
          const sessionId = searchParams.get('session_id');
          
          if (!sessionId) {
            console.error("No session_id in URL and no localStorage");
            throw new Error("Unable to complete account setup. Please sign up again.");
          }

          console.log("Retrieving checkout session details", { sessionId });
          const { data: sessionData, error: sessionError } = await supabase.functions.invoke('get-checkout-session', {
            body: { session_id: sessionId },
          });

          if (sessionError) {
            console.error("Error retrieving session:", sessionError);
            throw new Error("Failed to retrieve checkout session. Please contact support.");
          }

          console.log("Session data retrieved:", sessionData);
          
          if (!sessionData.email) {
            throw new Error("No email found in checkout session. Please contact support.");
          }

          // Show form to collect required information
          setSessionEmail(sessionData.email);
          setFormData({ 
            firstName: sessionData.metadata?.firstName || "", 
            lastName: sessionData.metadata?.lastName || "",
            phone: sessionData.metadata?.phone || "",
            password: "" 
          });
          setStatus("needs-info");
        }
      } catch (error: any) {
        console.error("Error creating account:", error);
        setStatus("error");
        
        const errorMessage = error.message || "Failed to create account after payment. Please contact support.";
        
        toast({
          title: "Account Creation Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Redirect back to auth page after delay
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    };

    createAccountAndSignIn();
  }, [navigate, toast, searchParams]);

  const completeSignup = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    console.log("Creating Supabase account with data:", {
      email,
      firstName,
      lastName,
      phone: phone || '(none)',
      hasPassword: !!password
    });

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { 
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          name: `${firstName} ${lastName}`.trim()
        },
      },
    });

    if (signUpError) {
      console.error("Sign up error details:", {
        message: signUpError.message,
        status: signUpError.status,
        name: signUpError.name
      });
      throw signUpError;
    }

    console.log("Account created successfully:", {
      userId: signUpData.user?.id,
      email: signUpData.user?.email
    });

    // Sign in immediately (auto-confirm is enabled)
    console.log("Signing in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw signInError;
    }

    console.log("Signed in successfully");

    // Track referral signup if referral code exists
    const referralCode = localStorage.getItem('referralCode');
    if (referralCode) {
      try {
        console.log("Tracking referral signup with code:", referralCode);
        await supabase.functions.invoke('track-referral-signup', {
          body: {
            referralCode,
            ipAddress: null,
            userAgent: navigator.userAgent
          }
        });
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralTimestamp');
        console.log("Referral tracked successfully");
      } catch (refError) {
        console.error('Failed to track referral:', refError);
        // Don't fail signup if referral tracking fails
      }
    }

    // Clear stored credentials
    localStorage.removeItem('pendingSignup');
    console.log("Cleared localStorage");

    setStatus("success");
    
    toast({
      title: "Welcome to Climbley!",
      description: "Your 7-day free trial has started. No charges for 7 days.",
    });

    // Redirect to dashboard
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setStatus("processing");
    
    try {
      await completeSignup(sessionEmail, formData.password, formData.firstName, formData.lastName, formData.phone);
    } catch (error: any) {
      console.error("Error in form submit:", error);
      setStatus("error");
      
      toast({
        title: "Account Creation Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center space-y-4 max-w-md w-full">
        {status === "processing" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Creating your account...</h2>
            <p className="text-muted-foreground">Payment successful! Setting up your account and trial...</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">Welcome to Climbley!</h2>
            <p className="text-muted-foreground">Your 7-day free trial has started. Redirecting...</p>
          </>
        )}
        
        {status === "needs-info" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">Complete your account setup to get started</p>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={sessionEmail} 
                  disabled 
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Your first name"
                  required
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Your last name"
                  required
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  maxLength={20}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Complete Account Setup
              </Button>
            </form>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-2xl text-destructive">✕</span>
            </div>
            <h2 className="text-2xl font-bold">Account Setup Failed</h2>
            <p className="text-muted-foreground">Please contact support or try signing up again...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
