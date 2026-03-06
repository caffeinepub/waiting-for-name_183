import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useActor } from "./useActor";

// Seed products — imageUrl is intentionally empty string so getProductImage() uses category map
const SEED_PRODUCTS = [
  {
    name: "Business Card Design",
    description:
      "Professional custom business card design with your logo and contact info. Print-ready files included.",
    price: BigInt(2500),
    category: "Business Cards",
    imageUrl: "",
  },
  {
    name: "Premium Business Card Pack",
    description:
      "Double-sided full-color business card design. 3 revision rounds included.",
    price: BigInt(4500),
    category: "Business Cards",
    imageUrl: "",
  },
  {
    name: "Custom Photo Book",
    description:
      "Beautifully designed photo book layout — perfect for events, family albums, or portfolios.",
    price: BigInt(8500),
    category: "Photo Books",
    imageUrl: "",
  },
  {
    name: "Wedding Photo Book",
    description:
      "Elegant wedding photo book design with custom typography and layouts.",
    price: BigInt(12000),
    category: "Photo Books",
    imageUrl: "",
  },
  {
    name: "Custom Coffee Mug Design",
    description:
      "Full-wrap custom mug design featuring your artwork or brand. Print-ready file.",
    price: BigInt(1800),
    category: "Coffee Mugs",
    imageUrl: "",
  },
  {
    name: "11oz White Mug Wrap",
    description:
      "Vibrant sublimation-ready mug wrap design. Perfect for gifts or merchandise.",
    price: BigInt(1500),
    category: "Coffee Mugs",
    imageUrl: "",
  },
  {
    name: "Custom T-Shirt Design",
    description:
      "Bold, print-ready custom t-shirt graphic. Front and back design available.",
    price: BigInt(3500),
    category: "T-Shirts",
    imageUrl: "",
  },
  {
    name: "Band / Event T-Shirt Design",
    description:
      "High-energy t-shirt artwork for bands, events, or sports teams. Vector files included.",
    price: BigInt(5000),
    category: "T-Shirts",
    imageUrl: "",
  },
  {
    name: "Custom Sweater Design",
    description:
      "Premium custom sweater / hoodie graphic design. Embroidery or print-ready files.",
    price: BigInt(6000),
    category: "Sweaters",
    imageUrl: "",
  },
  {
    name: "Crewneck Sweatshirt Design",
    description:
      "Classic crewneck sweatshirt artwork with your brand or custom graphics.",
    price: BigInt(5500),
    category: "Sweaters",
    imageUrl: "",
  },
  {
    name: "Custom Tumbler Wrap",
    description:
      "20oz or 30oz tumbler wrap design. Skinny or wide. Sublimation-ready print file.",
    price: BigInt(2200),
    category: "Tumblers",
    imageUrl: "",
  },
  {
    name: "Glitter Tumbler Design",
    description:
      "Eye-catching glitter-style tumbler wrap design — great for gifts and merchandise.",
    price: BigInt(2800),
    category: "Tumblers",
    imageUrl: "",
  },
  {
    name: "Event Invitation Design",
    description:
      "Custom event invitation design — birthday, baby shower, wedding, corporate and more.",
    price: BigInt(3000),
    category: "Event Invitations",
    imageUrl: "",
  },
  {
    name: "Digital Flyer Design",
    description: "Social-media-ready event flyer. Delivered in 24 hours.",
    price: BigInt(1500),
    category: "Event Invitations",
    imageUrl: "",
  },
  {
    name: "Sports Graphic Design",
    description:
      "Dynamic sports team or athlete branding — jerseys, logos, social graphics.",
    price: BigInt(4000),
    category: "Sports Graphics",
    imageUrl: "",
  },
  {
    name: "Team Logo & Uniform Design",
    description:
      "Full sports team identity package: logo, colors, and uniform mockup.",
    price: BigInt(9500),
    category: "Sports Graphics",
    imageUrl: "",
  },
  {
    name: "Large Format Poster Design",
    description:
      "Eye-catching poster or banner design — trade shows, events, storefronts.",
    price: BigInt(4500),
    category: "Posters & Banners",
    imageUrl: "",
  },
  {
    name: "Retractable Banner Design",
    description:
      "Professional retractable banner artwork sized for standard 33x80 display.",
    price: BigInt(5000),
    category: "Posters & Banners",
    imageUrl: "",
  },
  {
    name: "Custom Sticker Sheet",
    description:
      "Die-cut sticker sheet design. Perfect for branding, packaging, or merchandise.",
    price: BigInt(2000),
    category: "Stickers & Decals",
    imageUrl: "",
  },
  {
    name: "Vinyl Decal Design",
    description:
      "Custom vinyl decal artwork for vehicles, walls, windows, or products.",
    price: BigInt(1800),
    category: "Stickers & Decals",
    imageUrl: "",
  },
];

// Seed portfolio — imageUrl empty so getPortfolioImage() uses title-based lookup
const SEED_PORTFOLIO = [
  {
    title: "MEGATRX Brand Identity",
    description:
      "Official MEGATRX lettermark logo design — bold, rebellious identity for a graphic design powerhouse.",
    category: "Brand Identity",
    imageUrl:
      "/assets/uploads/Rebellious-Lettermark-for-Music-Brand-MEGATRAX-3-1.PNG",
    clientName: "MEGATRX",
  },
  {
    title: "Tumbler Design — I Love ASL",
    description:
      "Custom tumbler wrap featuring sign language 'I Love You' design. Sublimation print.",
    category: "Merchandise",
    imageUrl: "/assets/uploads/82F48B36-35A5-4866-8CDD-468614CA4C54-9.png",
    clientName: "Custom Order",
  },
  {
    title: "Sports Graffiti Graphic",
    description:
      "High-energy basketball-style graffiti art for sports merchandise and jerseys.",
    category: "Sports Graphics",
    imageUrl: "/assets/uploads/Screenshot-2025-11-10-at-3.42.52-PM-1-2.png",
    clientName: "Sports Brand",
  },
  {
    title: "Event Invitation Design",
    description:
      "Bold party invitation design with custom typography and vibrant colors.",
    category: "Print Design",
    imageUrl: "/assets/uploads/0B019974-FB8C-46E0-87BF-FCBA7D6E8B7C-1-3.png",
    clientName: "Private Client",
  },
  {
    title: "Sharpe Frame Photography Flyer",
    description:
      "Real estate and photography services promotional flyer design.",
    category: "Marketing",
    imageUrl:
      "/assets/uploads/Screenshot-2025-04-05-at-11.47.51-AM.jpeg-4-1.png",
    clientName: "Sharpe Frame Photography",
  },
  {
    title: "Real Estate Marketing Flyer",
    description:
      "Clean, professional real estate listing flyer with property photos and agent branding.",
    category: "Marketing",
    imageUrl:
      "/assets/uploads/Screenshot-2025-04-05-at-11.47.51-AM.jpeg-5-4.png",
    clientName: "Real Estate Client",
  },
  {
    title: "Custom Merchandise Tumbler",
    description:
      "Personalized tumbler merchandise design with custom artwork and branding.",
    category: "Merchandise",
    imageUrl: "/assets/uploads/82F48B36-35A5-4866-8CDD-468614CA4C54-1-11.png",
    clientName: "Merchandise Client",
  },
  {
    title: "Party Invite Design",
    description:
      "Vibrant party event invitation with bold design elements and custom layout.",
    category: "Print Design",
    imageUrl: "/assets/uploads/0B019974-FB8C-46E0-87BF-FCBA7D6E8B7C-2-5.png",
    clientName: "Event Client",
  },
];

export function useSeedData() {
  const { actor, isFetching } = useActor();
  const seeded = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!actor || isFetching || seeded.current) return;

    async function seed() {
      if (!actor) return;
      try {
        const [products, portfolio] = await Promise.all([
          actor.getAllProducts(),
          actor.getAllPortfolioItems(),
        ]);

        const tasks: Promise<unknown>[] = [];

        if (products.length === 0) {
          for (const p of SEED_PRODUCTS) {
            tasks.push(
              actor.addProduct(
                p.name,
                p.description,
                p.price,
                p.category,
                p.imageUrl,
              ),
            );
          }
        }

        if (portfolio.length === 0) {
          for (const item of SEED_PORTFOLIO) {
            tasks.push(
              actor.addPortfolioItem(
                item.title,
                item.description,
                item.category,
                item.imageUrl,
                item.clientName,
              ),
            );
          }
        }

        if (tasks.length > 0) {
          await Promise.all(tasks);
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["portfolio"] });
        }

        seeded.current = true;
      } catch (err) {
        console.error("Seed error:", err);
      }
    }

    seed();
  }, [actor, isFetching, queryClient]);
}
