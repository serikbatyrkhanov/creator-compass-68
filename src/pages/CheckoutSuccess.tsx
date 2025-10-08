import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");

  useEffect(() => {
    const createAccountAndSignIn = async () => {
      try {
        console.log("Starting account creation after successful payment");
        
        // Get stored signup credentials from localStorage (shared across tabs)
        const pendingSignup = localStorage.getItem('pendingSignup');
        
        if (!pendingSignup) {
          console.error("No pending signup found in localStorage");
          throw new Error("No pending signup information found. Please sign up again.");
        }

        const { email, password, name } = JSON.parse(pendingSignup);
        console.log("Retrieved credentials for email:", email);

        // Create Supabase account
        console.log("Creating Supabase account...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { 
              name,
              full_name: name 
            },
          },
        });

        if (signUpError) {
          console.error("Sign up error:", signUpError);
          throw signUpError;
        }

        console.log("Account created successfully:", signUpData.user?.id);

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
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center space-y-4">
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
