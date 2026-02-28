import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  HelpCircle,
  MessageCircle,
  Package,
  PenTool,
  RefreshCcw,
  Truck,
} from "lucide-react";

const FAQ_SECTIONS = [
  {
    id: "ordering",
    icon: <Package className="w-5 h-5 text-primary" />,
    title: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our shop, add items to your cart, and proceed to checkout. You'll need to create a free account and provide your shipping address. Once submitted, we'll reach out with payment instructions.",
      },
      {
        q: "Can I modify my order after placing it?",
        a: "Modifications can be requested within 24 hours of placing your order. Contact us via the chat widget as soon as possible. Once production begins, changes may not be possible.",
      },
      {
        q: "How do I cancel an order?",
        a: "You can cancel an order from the Order Confirmation page as long as the status is still 'Processing'. Once the order has shipped, cancellations are no longer available. Reach out via chat if you need help.",
      },
      {
        q: "Do I need an account to order?",
        a: "Yes, you'll need a free account to complete checkout. This lets us keep track of your orders, send you updates, and save your shipping address for future orders.",
      },
    ],
  },
  {
    id: "shipping",
    icon: <Truck className="w-5 h-5 text-primary" />,
    title: "Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard production takes 3–5 business days, then 3–7 business days for shipping. Rush options are available — contact us via the chat widget to request expedited production.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes! We ship worldwide. International shipping typically takes 7–21 business days depending on your location. Additional customs fees may apply and are the responsibility of the buyer.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, we'll update the tracking number on your order page. You can find it in your Account → Order History, or on the original order confirmation page.",
      },
      {
        q: "What if my order is lost or damaged?",
        a: "We'll make it right. Contact us immediately via the chat widget with your order number and photos of any damage. We'll replace or refund the affected items at no extra charge.",
      },
    ],
  },
  {
    id: "custom",
    icon: <PenTool className="w-5 h-5 text-primary" />,
    title: "Custom Designs",
    items: [
      {
        q: "How do I request a custom design?",
        a: "Click 'Request Custom Design' on the homepage or shop page, or send us a message through the chat widget. Describe what you need, upload reference files, and we'll get back to you with a quote.",
      },
      {
        q: "What files do you need?",
        a: "High-resolution images (300 DPI or higher), vector files (AI, EPS, SVG), or photos work best. For text, just type it out in your request. We can work with most formats and help clean up lower-quality references.",
      },
      {
        q: "How long does a custom design take?",
        a: "Most designs are completed in 2–5 business days. Complex projects or those requiring multiple revisions may take longer. Rush turnaround (24–48 hours) is available for an additional fee.",
      },
      {
        q: "How many revisions do I get?",
        a: "Standard designs include 2 revision rounds. Additional revisions can be purchased. We want you to love your design, so if something isn't right, just let us know and we'll work with you.",
      },
    ],
  },
  {
    id: "payments",
    icon: <CreditCard className="w-5 h-5 text-primary" />,
    title: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Credit/Debit Cards, Apple Pay, Google Pay, PayPal, and Cash App. After placing your order, we'll send you payment instructions. Orders are fulfilled once payment is confirmed.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. Payment is handled manually — we never store your card numbers or financial data. You pay through your preferred secure payment platform (PayPal, Cash App, etc.) and we receive only the payment confirmation.",
      },
      {
        q: "When am I charged?",
        a: "We'll send you payment instructions after you place your order. Production begins once payment clears, typically within 1–2 business days.",
      },
    ],
  },
  {
    id: "returns",
    icon: <RefreshCcw className="w-5 h-5 text-primary" />,
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "Since our products are custom-made, we cannot accept returns for change-of-mind purchases. However, if there's an error on our part or the product is defective, we will provide a full replacement or refund.",
      },
      {
        q: "How do I request a refund?",
        a: "Contact us via the chat widget within 7 days of receiving your order. Include your order number and clear photos of the issue. Approved refunds are processed within 3–5 business days.",
      },
      {
        q: "My design files had an error — what do I do?",
        a: "If you approved the design proof and the error was in your original files, we can reprint at a discounted rate. If the error was ours, we'll reprint or refund at no charge.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="w-full">
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary mb-2 block">
            Support
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-body">
            Answers to the most common questions about ordering, shipping,
            custom designs, and payments.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.id}>
                <div className="flex items-center gap-3 mb-4">
                  {section.icon}
                  <h2 className="text-xl font-bold tracking-tight font-mono uppercase tracking-wider">
                    {section.title}
                  </h2>
                </div>
                <Card className="border-2 border-border">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {section.items.map((item) => (
                        <AccordionItem
                          key={item.q}
                          value={`${section.id}-${item.q.slice(0, 20)}`}
                          className="border-border"
                        >
                          <AccordionTrigger className="px-4 sm:px-6 text-left font-medium hover:text-primary hover:no-underline">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 sm:px-6 text-muted-foreground font-body leading-relaxed">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 border-t border-border bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground font-body mb-8">
              Our team is here to help. Use the chat widget on any page to get a
              quick response, or contact us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/">
                  <MessageCircle className="w-4 h-4" />
                  Chat With Us
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/shop">Browse Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
