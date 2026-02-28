import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthModal() {
  const { isOpen, closeModal, defaultTab } = useAuthModal();
  const { login, register } = useAuth();

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [registering, setRegistering] = useState(false);

  function resetForm() {
    setSignInEmail("");
    setSignInPassword("");
    setSignInError("");
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegError("");
  }

  function handleClose() {
    resetForm();
    closeModal();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError("");
    if (!signInEmail || !signInPassword) {
      setSignInError("Please enter your email and password.");
      return;
    }
    setSigningIn(true);
    await new Promise((r) => setTimeout(r, 300));
    const ok = login(signInEmail, signInPassword);
    setSigningIn(false);
    if (!ok) {
      setSignInError("Invalid email or password.");
      return;
    }
    toast.success("Welcome back!");
    handleClose();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setRegError("Please fill in all fields.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    setRegistering(true);
    await new Promise((r) => setTimeout(r, 300));
    const error = register(regEmail, regPassword, regName);
    setRegistering(false);
    if (error) {
      setRegError(error);
      return;
    }
    toast.success("Account created! Welcome to MEGATRX.");
    handleClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tighter">
            MEGA<span className="text-primary">TRX</span> Account
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} key={defaultTab}>
          <TabsList className="grid grid-cols-2 w-full bg-muted/50">
            <TabsTrigger
              value="signin"
              className="font-mono text-xs uppercase tracking-wide"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="font-mono text-xs uppercase tracking-wide"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Password
                </Label>
                <Input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="bg-background/50"
                />
              </div>
              {signInError && (
                <p className="text-sm text-destructive font-mono">
                  {signInError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={signingIn}
              >
                {signingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Sign In
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Google/Apple login is not available on this platform.
              </p>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs uppercase text-muted-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs uppercase text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs uppercase text-muted-foreground">
                    Confirm
                  </Label>
                  <Input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="bg-background/50"
                  />
                </div>
              </div>
              {regError && (
                <p className="text-sm text-destructive font-mono">{regError}</p>
              )}
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={registering}
              >
                {registering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
