export const DEMO_CATEGORIES = ['All', 'Groceries', 'Accessories', 'Appliances'];

const makeImage = (title, color, accent) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="#0f1728"/>
        </linearGradient>
      </defs>
      <rect width="900" height="620" fill="url(#bg)"/>
      <circle cx="710" cy="105" r="120" fill="${accent}" opacity="0.25"/>
      <circle cx="190" cy="500" r="155" fill="${accent}" opacity="0.18"/>
      <rect x="230" y="150" width="440" height="300" rx="34" fill="#ffffff" opacity="0.92"/>
      <rect x="275" y="195" width="350" height="190" rx="24" fill="${accent}" opacity="0.22"/>
      <text x="450" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#0f1728">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const DEMO_PRODUCTS = [
  {
    _id: 'grocery-rice',
    name: 'Organic Basmati Rice',
    description: 'Premium long-grain basmati rice for everyday meals and special recipes.',
    price: 18,
    originalPrice: 24,
    category: 'Groceries',
    stock: 35,
    ratings: { average: 5, count: 12 },
    images: [{ url: makeImage('Rice', '#1f7a55', '#facc15') }],
  },
  {
    _id: 'grocery-olive-oil',
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed olive oil for cooking, salads, and healthy meal prep.',
    price: 14,
    originalPrice: 19,
    category: 'Groceries',
    stock: 28,
    ratings: { average: 4, count: 9 },
    images: [{ url: makeImage('Olive Oil', '#31572c', '#f59e0b') }],
  },
  {
    _id: 'grocery-snack-box',
    name: 'Healthy Snack Box',
    description: 'A mixed box of nuts, seeds, granola bites, and fruit crisps.',
    price: 22,
    originalPrice: 28,
    category: 'Groceries',
    stock: 20,
    ratings: { average: 4, count: 7 },
    images: [{ url: makeImage('Snacks', '#7c2d12', '#fb7185') }],
  },
  {
    _id: 'accessory-headphones',
    name: 'AeroSound Earbuds',
    description: 'Compact wireless earbuds with clear calls and quick charging.',
    price: 79,
    originalPrice: 109,
    category: 'Accessories',
    stock: 18,
    ratings: { average: 5, count: 16 },
    images: [{ url: makeImage('Earbuds', '#123c69', '#38bdf8') }],
  },
  {
    _id: 'accessory-backpack',
    name: 'Urban Travel Backpack',
    description: 'Lightweight daily backpack with laptop space and water-resistant fabric.',
    price: 49,
    originalPrice: 69,
    category: 'Accessories',
    stock: 23,
    ratings: { average: 4, count: 11 },
    images: [{ url: makeImage('Backpack', '#2f365f', '#a78bfa') }],
  },
  {
    _id: 'accessory-watch',
    name: 'Quantum Watch Strap',
    description: 'Soft silicone strap compatible with popular smartwatch models.',
    price: 19,
    originalPrice: 29,
    category: 'Accessories',
    stock: 42,
    ratings: { average: 4, count: 8 },
    images: [{ url: makeImage('Watch Strap', '#334155', '#22d3ee') }],
  },
  {
    _id: 'appliance-blender',
    name: 'SwiftMix Blender',
    description: 'Powerful countertop blender for smoothies, soups, and sauces.',
    price: 119,
    originalPrice: 149,
    category: 'Appliances',
    stock: 13,
    ratings: { average: 5, count: 14 },
    images: [{ url: makeImage('Blender', '#4c1d95', '#f97316') }],
  },
  {
    _id: 'appliance-air-fryer',
    name: 'CrispLite Air Fryer',
    description: 'Compact air fryer with preset modes for quick low-oil cooking.',
    price: 159,
    originalPrice: 199,
    category: 'Appliances',
    stock: 10,
    ratings: { average: 4, count: 10 },
    images: [{ url: makeImage('Air Fryer', '#312e81', '#facc15') }],
  },
  {
    _id: 'appliance-kettle',
    name: 'RapidBoil Kettle',
    description: 'Stainless steel electric kettle with auto shut-off and fast boiling.',
    price: 39,
    originalPrice: 54,
    category: 'Appliances',
    stock: 31,
    ratings: { average: 4, count: 13 },
    images: [{ url: makeImage('Kettle', '#164e63', '#67e8f9') }],
  },
];

export const getDemoProductById = (id) => DEMO_PRODUCTS.find((product) => product._id === id) || DEMO_PRODUCTS[0];
