import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Try to get session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        toast.error("Authentication failed. Please try again.");
        navigate("/signin");
        return;
      }

      if (data?.session) {
        toast.success("Successfully signed in!");
        navigate("/get-started");
      } else {
        // No session found, redirect to signin
        toast.error("No session found. Please try signing in again.");
        navigate("/signin");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-20 flex justify-center items-center bg-gradient-to-b from-white to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
