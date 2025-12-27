const DEMO_SEED = {
  settings: {
    restaurantName: "لقمان أبو صليح",
    isOpenNow: true,
    deliveryFeeIQD: 3000,
    minOrderIQD: 10000,
    workingHoursText: "12:00 ظهرًا - 12:00 ليلًا"
  },
  categories: [
    { id: "cat_burgers", name: "برغر", isActive: true, sort: 1 },
    { id: "cat_pizza", name: "بيتزا", isActive: true, sort: 2 },
    { id: "cat_grill", name: "مشاوي", isActive: true, sort: 3 },
    { id: "cat_sides", name: "مقبلات", isActive: true, sort: 4 },
    { id: "cat_drinks", name: "مشروبات", isActive: true, sort: 5 },
    { id: "cat_dessert", name: "حلويات", isActive: true, sort: 6 }
  ],
  items: [
    {
      id: "it_b1",
      categoryId: "cat_burgers",
      name: "برغر لحم كلاسيك",
      desc: "لحم مشوي، جبن، خس، صوص خاص.",
      priceIQD: 8000,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_b2",
      categoryId: "cat_burgers",
      name: "برغر دجاج كرسبي",
      desc: "صدر دجاج مقرمش، جبن، مخلل، صوص.",
      priceIQD: 7500,
      imageUrl: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_b3",
      categoryId: "cat_burgers",
      name: "تشيز برغر دبل",
      desc: "قطعتان لحم، جبن مزدوج، صوص مدخّن.",
      priceIQD: 10500,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&q=80",
      isAvailable: true
    },

    {
      id: "it_p1",
      categoryId: "cat_pizza",
      name: "بيتزا بيبروني",
      desc: "موزاريلا، بيبروني، صوص طماطم.",
      priceIQD: 12000,
      imageUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_p2",
      categoryId: "cat_pizza",
      name: "بيتزا خضار",
      desc: "خضار طازجة، جبن، زيت زيتون.",
      priceIQD: 11000,
      imageUrl: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_p3",
      categoryId: "cat_pizza",
      name: "بيتزا دجاج باربيكيو",
      desc: "دجاج، صوص باربيكيو، جبن.",
      priceIQD: 13000,
      imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=1400&q=80",
      isAvailable: true
    },

    {
      id: "it_g1",
      categoryId: "cat_grill",
      name: "كباب عراقي",
      desc: "كباب مشوي مع خبز وسلطات.",
      priceIQD: 14000,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_g2",
      categoryId: "cat_grill",
      name: "شيش طاووق",
      desc: "دجاج متبّل ومشوي، مع صوص ثوم.",
      priceIQD: 13500,
      imageUrl: "https://images.unsplash.com/photo-1604908554162-45f0c8f7f3fb?w=1400&q=80",
      isAvailable: true
    },

    {
      id: "it_s1",
      categoryId: "cat_sides",
      name: "بطاطا مقلية",
      desc: "مقرمشة مع صوص كاتشب.",
      priceIQD: 4000,
      imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_s2",
      categoryId: "cat_sides",
      name: "حلقات بصل",
      desc: "مقرمشة مع صوص خاص.",
      priceIQD: 4500,
      imageUrl: "https://images.unsplash.com/photo-1631214519213-bd43fda6a6f2?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_s3",
      categoryId: "cat_sides",
      name: "ناجتس (6 قطع)",
      desc: "6 قطع ناجتس مع صوص.",
      priceIQD: 6000,
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=1400&q=80",
      isAvailable: true
    },

    {
      id: "it_d1",
      categoryId: "cat_drinks",
      name: "بيبسي",
      desc: "علبة 330 مل.",
      priceIQD: 1000,
      imageUrl: "https://images.unsplash.com/photo-1622480916113-9000d3f0d8cb?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_d2",
      categoryId: "cat_drinks",
      name: "ماء",
      desc: "قارورة ماء.",
      priceIQD: 500,
      imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_d3",
      categoryId: "cat_drinks",
      name: "عصير طبيعي",
      desc: "عصير منعش حسب المتوفر.",
      priceIQD: 2500,
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1400&q=80",
      isAvailable: true
    },

    {
      id: "it_ds1",
      categoryId: "cat_dessert",
      name: "تشيز كيك",
      desc: "قطعة تشيز كيك كريمية.",
      priceIQD: 5500,
      imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=1400&q=80",
      isAvailable: true
    },
    {
      id: "it_ds2",
      categoryId: "cat_dessert",
      name: "براونيز",
      desc: "براونيز شوكولا غني.",
      priceIQD: 4500,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1400&q=80",
      isAvailable: true
    }
  ]
};
