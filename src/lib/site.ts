export const siteConfig = {
  name: "Happy's Cake",
  description:
    "Cute custom pet cakes, 3D cupcake toppers, and themed cookies crafted for unforgettable pet birthdays.",
  shortDescription:
    "Custom pet cakes and birthday treats made with love in Australia.",
  contactEmail: "info@happyscake.com",
  phone: "0472707510",
  pickupSuburb: "Brisbane, QLD",
  socials: [
    {
      platform: "Instagram",
      label: "@happyscake.au",
      href: "https://instagram.com/happyscake.au",
    },
    {
      platform: "Facebook",
      label: "Happy's Cake",
      href: "https://facebook.com/happyscake.au",
    },
    {
      platform: "TikTok",
      label: "@happyscake.au",
      href: "https://tiktok.com/@happyscake.au",
    },
  ],
  nav: [
    { href: "/", label: "Home" },
    { href: "/order/head-cake", label: "Shop Cakes" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  legalLinks: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/pickup-information", label: "Pickup Information" },
  ],
  heroStats: [
    { label: "Pet-safe recipes", value: "5 proteins" },
    { label: "Signature cake lines", value: "4 products" },
    { label: "Lead time", value: "2-4 days" },
  ],
  pickupNotes: [
    "Orders are prepared for pickup only in Brisbane for the MVP launch.",
    "Please place custom orders at least 48 hours in advance.",
    "Reference photos help us match your pet's markings and expression.",
  ],
  faq: [
    {
      question: "How early should I place an order?",
      answer:
        "Please order at least 48 hours ahead. Peak birthday weekends may need extra notice.",
    },
    {
      question: "Can I request a custom colour palette?",
      answer:
        "Yes. Every product supports a preferred colour palette, and you can add special notes for final touches.",
    },
    {
      question: "Do you cater to allergies?",
      answer:
        "You can note allergies or foods to avoid in the order form. We will confirm any special requirements by email.",
    },
    {
      question: "Where do I upload my pet photos?",
      answer:
        "Upload them directly in the order form for cake products, or as an attachment in the contact form for pre-order enquiries.",
    },
  ],
};

export const fallbackGalleryItems = [
  {
    id: "fallback-1",
    title: "Birthday corgi cupcake",
    alt: "A pink corgi-themed cupcake with a tiny party hat",
    caption: "3D head cupcake with pastel buttercream swirls.",
    category: "3D Head Cupcake",
    imageUrl:
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-2",
    title: "Golden retriever celebration cake",
    alt: "A dog birthday cake decorated like a golden retriever",
    caption: "Single-head 3D cake with soft peach florals.",
    category: "3D Head Cake",
    imageUrl:
      "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-3",
    title: "Puppy full body cake",
    alt: "A sculpted dog-shaped cake on a pastel party board",
    caption: "Full body design with textured fur details and accessories.",
    category: "3D Full Body Cake",
    imageUrl:
      "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fallback-4",
    title: "Cookie party set",
    alt: "Themed cookies decorated for a pet birthday party",
    caption: "A themed cookie bundle with name plaque and party colour accents.",
    category: "Themed Cookie",
    imageUrl:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80",
  },
];
