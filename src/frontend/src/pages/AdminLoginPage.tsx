import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Simulate a brief delay for security feel
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (passphrase === "MEGATRX2024") {
      localStorage.setItem("megatrx_admin", "true");
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Incorrect passphrase. Access denied.");
      setPassphrase("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />

      {/* Decorative corner lines */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-primary/20" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter leading-none mb-2">
            MEGA<span className="text-primary">TRX</span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2">
            Admin Portal — Restricted Access
          </p>
        </div>

        {/* Login card */}
        <Card className="bg-card/80 backdrop-blur border-border shadow-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">
                Secure Login
              </span>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="passphrase"
                  className="text-sm font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Passphrase
                </Label>
                <div className="relative">
                  <Input
                    id="passphrase"
                    type={showPassword ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => {
                      setPassphrase(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter admin passphrase"
                    className="pr-10 bg-background/50 border-border focus:border-primary font-mono"
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide passphrase" : "Show passphrase"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    <span className="font-mono">{error}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-mono uppercase tracking-widest"
                disabled={isSubmitting || !passphrase}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Access Dashboard
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/60 text-center font-mono">
                This portal is not publicly advertised.
                <br />
                Unauthorized access attempts are logged.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
