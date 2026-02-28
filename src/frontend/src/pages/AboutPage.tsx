import { Card, CardContent } from "@/components/ui/card";
import { useGetAboutUs } from "@/hooks/useQueries";
import { Award, Target, Users } from "lucide-react";

export default function AboutPage() {
  const { data: aboutText = "", isLoading } = useGetAboutUs();

  const defaultAbout =
    aboutText ||
    "MEGATRX is a cutting-edge graphic design studio combining creative excellence with modern ecommerce. We specialize in bold, innovative design solutions that help brands stand out in crowded markets.";

  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
            Who We Are
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            About Us
          </h1>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded w-full" />
                <div className="h-6 bg-muted animate-pulse rounded w-5/6" />
                <div className="h-6 bg-muted animate-pulse rounded w-4/6" />
              </div>
            ) : (
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed font-body whitespace-pre-wrap">
                {defaultAbout}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 sm:mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-2 border-border">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Purpose-Driven
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Every design decision is rooted in strategic thinking and
                  clear objectives.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Excellence
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  We hold ourselves to the highest standards of craft and
                  quality.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Collaboration
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  We work closely with clients to bring their vision to life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Let's Work Together
            </h2>
            <p className="text-lg text-muted-foreground mb-8 font-body">
              Ready to elevate your brand with exceptional design? Explore our
              portfolio or shop our ready-made products.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
