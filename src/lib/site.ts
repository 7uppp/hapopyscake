export const siteConfig = {
  name: "Happy's Cake",
  description:
    "Cute custom pet cakes, 3D cupcake toppers, and themed cookies crafted for unforgettable pet birthdays.",
  shortDescription:
    "Custom pet cakes and birthday treats made with love in Australia.",
  contactEmail: "info@happyscake.com",
  phone: "0472707510",
  phoneInternational: "+61 472 707 510",
  pickupAddress: "18 Park Close, Hillcrest QLD 4118",
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
      question: "Are your cakes suitable for both dogs and cats?",
      answer:
        "Yes! Our cakes are suitable for both dogs and cats. As every pet is different, please check the ingredient list carefully and avoid feeding any ingredients your pet may be allergic or sensitive to.",
    },
    {
      question: "What ingredients do you use?",
      answer: `We use human-grade ingredients to create our cakes.
Ingredients include:
- Chicken breast, turkey, duck breast, beef or kangaroo (depending on your chosen flavour)
- Carrot or pumpkin (or choose a 100% meat cake by leaving a note with your order)
- Chinese yam
- Homemade goat cheese
- Goat milk powder
- Fruit & vegetable powder
Our cakes are gluten-free, with no flour, artificial colours, preservatives or additives.`,
    },
    {
      question: "How do I order a custom 3D cake?",
      answer: `Every 3D cake is handcrafted to resemble your furry friend. To achieve the best likeness, please provide:
- At least one clear, eye-level photo showing the exact pose and facial expression you’d like.
- Additional photos from different angles are highly recommended.
You can also customise the cake’s colours, theme, decorations and background. Please note some may incur an additional charge.`,
    },
    {
      question: "How many pets does each cake size serve?",
      answer: `Serving sizes are only a guide and will vary depending on your pet’s size and appetite.

3D Head Cupcake
- Serves 1–2 pets

3D Head Cake
- 4-inch: Serves 1–4 pets
- 5-inch: Serves 2–6 pets
- 6-inch: Serves 4–10 pets

3D Full Body Cake
- Small: Serves 1–2 pets
- Medium: Serves 1–3 pets
- Large: Serves 1–4 pets`,
    },
    {
      question: "How should I store the cake?",
      answer:
        "Store your cake in the refrigerator for up to 2 days, or freeze it for up to 1 month.\nIf frozen, simply thaw it in the refrigerator before serving.",
    },
    {
      question: "Do you sell anything besides cakes?",
      answer:
        "Absolutely! We also offer personalised name cookies and custom themed cookies. They’re perfect for birthdays, Gotcha Days, holidays, anniversaries and other special occasions. Beautifully packaged, they also make thoughtful gifts for fellow pet lovers.",
    },
    {
      question: "Do cake orders include birthday accessories?",
      answer:
        "Yes! Every cake order includes a complimentary birthday candle and a birthday hat (designs are selected at random).\nPlanning a celebration at a dog park or another outdoor location? Simply leave us a note with your order and we’ll also include complimentary disposable plates and a cake knife.",
    },
    {
      question: "How far in advance should I place my order?",
      answer:
        "We recommend placing your order at least 7 days in advance to ensure availability.\nNeed it sooner? Feel free to contact us via email or social media—we’ll always do our best to accommodate last-minute orders where possible.",
    },
    {
      question: "Where is pickup? Do you offer delivery?",
      answer:
        "Pickup is available in Hillcrest, QLD, by appointment only.\nPickup Hours: Daily, 10:00 AM – 8:00 PM\nPlease send us a text, direct message or give us a call at least 20 minutes before you arrive so we can have your order packed and ready for collection.\nDelivery is also available. Delivery fees are calculated based on distance. Please contact us via email or social media for a delivery quote.",
    },
    {
      question: "Can I change my pickup time?",
      answer:
        "Of course!\n- Picking up earlier? Please give us at least 24 hours’ notice.\n- Postponing your pickup by one day or more? Please let us know at least 24 hours in advance.\n- Running a few hours late on the same day? Just send us a quick message as soon as you can.\nWe’ll always do our best to accommodate schedule changes whenever possible.",
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
