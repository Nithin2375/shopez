const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const User = require('./models/User');

// Load environment variables
dotenv.config();

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

const demoProducts = [
  {
    name: 'Organic Basmati Rice',
    description: 'Premium long-grain basmati rice for everyday meals and special recipes.',
    price: 18,
    originalPrice: 24,
    discountPercent: 25,
    category: 'Groceries',
    stock: 35,
    ratings: { average: 5, count: 12 },
    images: [{ url: makeImage('Rice', '#1f7a55', '#facc15'), altText: 'Organic Basmati Rice' }],
  },
  {
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed olive oil for cooking, salads, and healthy meal prep.',
    price: 14,
    originalPrice: 19,
    discountPercent: 26,
    category: 'Groceries',
    stock: 28,
    ratings: { average: 4, count: 9 },
    images: [{ url: makeImage('Olive Oil', '#31572c', '#f59e0b'), altText: 'Extra Virgin Olive Oil' }],
  },
  {
    name: 'Healthy Snack Box',
    description: 'A mixed box of nuts, seeds, granola bites, and fruit crisps.',
    price: 22,
    originalPrice: 28,
    discountPercent: 21,
    category: 'Groceries',
    stock: 20,
    ratings: { average: 4, count: 7 },
    images: [{ url: makeImage('Snacks', '#7c2d12', '#fb7185'), altText: 'Healthy Snack Box' }],
  },
  {
    name: 'AeroSound Earbuds',
    description: 'Compact wireless earbuds with clear calls and quick charging.',
    price: 79,
    originalPrice: 109,
    discountPercent: 27,
    category: 'Accessories',
    stock: 18,
    ratings: { average: 5, count: 16 },
    images: [{ url: makeImage('Earbuds', '#123c69', '#38bdf8'), altText: 'AeroSound Earbuds' }],
  },
  {
    name: 'Urban Travel Backpack',
    description: 'Lightweight daily backpack with laptop space and water-resistant fabric.',
    price: 49,
    originalPrice: 69,
    discountPercent: 29,
    category: 'Accessories',
    stock: 23,
    ratings: { average: 4, count: 11 },
    images: [{ url: makeImage('Backpack', '#2f365f', '#a78bfa'), altText: 'Urban Travel Backpack' }],
  },
  {
    name: 'Quantum Watch Strap',
    description: 'Soft silicone strap compatible with popular smartwatch models.',
    price: 19,
    originalPrice: 29,
    discountPercent: 34,
    category: 'Accessories',
    stock: 42,
    ratings: { average: 4, count: 8 },
    images: [{ url: makeImage('Watch Strap', '#334155', '#22d3ee'), altText: 'Quantum Watch Strap' }],
  },
  {
    name: 'SwiftMix Blender',
    description: 'Powerful countertop blender for smoothies, soups, and sauces.',
    price: 119,
    originalPrice: 149,
    discountPercent: 20,
    category: 'Appliances',
    stock: 13,
    ratings: { average: 5, count: 14 },
    images: [{ url: makeImage('Blender', '#4c1d95', '#f97316'), altText: 'SwiftMix Blender' }],
  },
  {
    name: 'CrispLite Air Fryer',
    description: 'Compact air fryer with preset modes for quick low-oil cooking.',
    price: 159,
    originalPrice: 199,
    discountPercent: 20,
    category: 'Appliances',
    stock: 10,
    ratings: { average: 4, count: 10 },
    images: [{ url: makeImage('Air Fryer', '#312e81', '#facc15'), altText: 'CrispLite Air Fryer' }],
  },
  {
    name: 'RapidBoil Kettle',
    description: 'Stainless steel electric kettle with auto shut-off and fast boiling.',
    price: 39,
    originalPrice: 54,
    discountPercent: 27,
    category: 'Appliances',
    stock: 31,
    ratings: { average: 4, count: 13 },
    images: [{ url: makeImage('Kettle', '#164e63', '#67e8f9'), altText: 'RapidBoil Kettle' }],
  },
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database successfully!');

    // Clear existing data
    console.log('Cleaning up existing database records...');
    await Admin.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Existing admins, products, and users cleared.');

    // Seed User
    console.log('Creating Demo User account...');
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@shopez.com',
      password: 'demo1234', // Will be hashed via pre('save') hook
      phone: '123-456-7890',
      address: {
        street: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      isActive: true
    });
    await demoUser.save();
    console.log('Demo User created: demo@shopez.com / demo1234');

    // Seed Admins
    console.log('Creating Admin accounts...');
    
    // We create the admin manually to trigger password hashing via mongoose pre-save hook
    const superAdmin = new Admin({
      name: 'Super Admin',
      email: 'admin@shopez.com',
      password: 'admin123', // Will be hashed via pre('save') hook
      role: 'superadmin',
      categories: ['Groceries', 'Accessories', 'Appliances'],
      isActive: true,
    });
    await superAdmin.save();

    const normalAdmin = new Admin({
      name: 'Store Manager',
      email: 'store@shopez.com',
      password: 'admin123', // Will be hashed via pre('save') hook
      role: 'admin',
      categories: ['Groceries', 'Accessories', 'Appliances'],
      isActive: true,
    });
    await normalAdmin.save();

    console.log('Admin accounts created successfully:');
    console.log('1. Super Admin: admin@shopez.com / admin123 (role: superadmin)');
    console.log('2. Store Manager: store@shopez.com / admin123 (role: admin)');

    // Seed Products
    console.log('Creating Products...');
    const productsToSeed = demoProducts.map(product => ({
      ...product,
      createdBy: superAdmin._id
    }));

    await Product.insertMany(productsToSeed);
    console.log(`Seeded ${productsToSeed.length} products successfully!`);

    mongoose.connection.close();
    console.log('Database seeding process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
