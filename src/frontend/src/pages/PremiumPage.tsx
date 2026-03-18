import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { usePremiumCredits } from "@/hooks/usePremiumCredits";
import {
  CheckCircle2,
  Crown,
  Infinity as InfinityIcon,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: "$4.99",
    period: "one-time",
    icon: Zap,
    color: "text-blue-400",
    borderColor: "border-blue-400/40",
    bgColor: "bg-blue-400/5",
    benefits: [
      "100 AI image generations",
      "Logo & social post tools",
      "Standard quality output",
      "Email support",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    credits: 500,
    price: "$19.99",
    period: "one-time",
    icon: Star,
    color: "text-amber-400",
    borderColor: "border-amber-400/40",
    bgColor: "bg-amber-400/5",
    popular: true,
    benefits: [
      "500 AI image generations",
      "All AI tools including video",
      "High resolution 1024×1024",
      "Priority support",
      "Remove background tool",
    ],
  },
  {
    id: "pro",
    name: "Pro Unlimited",
    credits: Number.POSITIVE_INFINITY,
    price: "$49.99",
    period: "per month",
    icon: Crown,
    color: "text-purple-400",
    borderColor: "border-purple-400/40",
    bgColor: "bg-purple-400/5",
    benefits: [
      "Unlimited AI generations",
      "All tools + TRX AI Premium",
      "4K output resolution",
      "Dedicated support line",
      "Early access to new features",
      "Brand kit generator",
    ],
  },
];

export default function PremiumPage() {
  const { isLoggedIn } = useAuth();
  const { openModal } = useAuthModal();
  const { isAdmin, balance, tier } = usePremiumCredits();

  function handleBuy() {
    if (!isLoggedIn) {
      openModal("signin");
      return;
    }
    toast.info("Payment integration coming soon!", {
      description: "We'll notify you when purchases are enabled.",
    });
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-16 sm:py-24 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
              TRX AI Premium
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-4">
            MEGA<span className="text-primary">TRX</span>{" "}
            <span className="text-amber-400">Premium</span>
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto mb-8">
            Unlock the full power of TRX AI — generate stunning graphics, logos,
            social media posts, and more with premium-grade AI tools.
          </p>

          {isAdmin && (
            <div className="inline-flex items-center gap-3 bg-amber-400/10 border-2 border-amber-400/50 rounded-xl px-6 py-4 mb-8">
              <Crown className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <p className="text-sm font-bold text-amber-400 font-mono uppercase tracking-wide">
                  FREE ADMIN ACCESS
                </p>
                <p className="text-xs text-amber-400/70">
                  Unlimited credits — no charge for admin accounts
                </p>
              </div>
              <Badge className="bg-amber-400 text-black font-bold">
                ∞ Unlimited
              </Badge>
            </div>
          )}

          {isLoggedIn && !isAdmin && (
            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Current Balance
                </p>
                <p className="text-xl font-bold">
                  {balance === Number.POSITIVE_INFINITY ? "∞" : balance}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    credits
                  </span>
                </p>
              </div>
              <Badge
                variant="outline"
                className="font-mono capitalize border-primary/50 text-primary"
              >
                {tier}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((t, idx) => {
              const Icon = t.icon;
              return (
                <Card
                  key={t.id}
                  data-ocid="premium.tier.card"
                  className={`relative border-2 ${
                    t.popular ? t.borderColor : "border-border"
                  } ${t.bgColor} flex flex-col`}
                >
                  {t.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-400 text-black font-bold text-xs uppercase tracking-wide">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${t.bgColor} border ${t.borderColor} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <CardTitle className="font-mono text-base uppercase tracking-wider">
                      {t.name}
                    </CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{t.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        /{t.period}
                      </span>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 mt-2 text-sm font-mono ${t.color}`}
                    >
                      {t.credits === Number.POSITIVE_INFINITY ? (
                        <>
                          <InfinityIcon className="w-4 h-4" /> Unlimited Credits
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> {t.credits} Credits
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {t.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${t.color}`}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isAdmin ? (
                      <Button
                        className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold"
                        data-ocid="premium.admin_access.button"
                      >
                        <Crown className="w-4 h-4 mr-2" /> Admin — Free Access
                      </Button>
                    ) : (
                      <Button
                        className={`w-full font-mono ${
                          t.popular
                            ? "bg-amber-400 hover:bg-amber-500 text-black"
                            : ""
                        }`}
                        variant={t.popular ? "default" : "outline"}
                        onClick={handleBuy}
                        data-ocid={`premium.buy_${idx + 1}.button`}
                      >
                        {t.id === "pro" ? "Subscribe" : "Buy Credits"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ note */}
          <p className="text-center text-sm text-muted-foreground mt-10 font-mono">
            Credits never expire · Secure payment processing · Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
