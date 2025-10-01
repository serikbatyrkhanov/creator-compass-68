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
        // Get stored signup credentials
        const pendingSignup = sessionStorage.getItem('pendingSignup');
        
        if (!pendingSignup) {
          throw new Error("No pending signup found");
        }

        const { email, password, name } = JSON.parse(pendingSignup);

        // Create account
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name },
          },
        });

        if (signUpError) throw signUpError;

        // Sign in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Clear stored credentials
        sessionStorage.removeItem('pendingSignup');

        setStatus("success");
        
        toast({
          title: "Welcome!",
          description: "Your account has been created and trial started successfully.",
        });

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (error: any) {
        console.error("Error creating account:", error);
        setStatus("error");
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
        
        // Redirect back to auth page
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
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
            <h2 className="text-2xl font-bold">Setting up your account...</h2>
            <p className="text-muted-foreground">Please wait while we complete your registration</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">Success!</h2>
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">Redirecting back to signup...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
