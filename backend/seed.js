/**
 * Seed script — populates MongoDB with the initial product catalog.
 * Run once: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const ProductSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  category: String,
  price: Number,
  old_price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  reviews: { type: Array, default: [] },
  availability: { type: Boolean, default: true },
  date: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

const SEED_PRODUCTS = [
  {
    id: 1,
    name: 'Aether SoundPro - Wireless Earbuds',
    price: 149,
    description: 'Experience true auditory bliss. The Aether SoundPro delivers premium sound quality with active noise cancellation, custom audio profiling, a 30-hour battery capacity, and a sleek matte finish.',
    rating: 4.8,
    category: 'Audio',
    image: '/images/earbuds.webp',
    stock: 15,
    reviews: [
      { id: 101, user: 'Sarah M.', rating: 5, comment: 'Mind-blowing audio detail and deep bass. Active noise cancellation blocks out my daily train commute entirely.' },
      { id: 102, user: 'David K.', rating: 4, comment: 'Very comfortable to wear for hours. Battery life is excellent, though the mic could be slightly clearer in windy environments.' }
    ]
  },
  {
    id: 2,
    name: 'Chronos SmartWatch v3',
    price: 299,
    description: 'Timekeeping meets luxury and intelligence. Features a stunning always-on AMOLED display, heart rate and blood oxygen monitoring, integrated GPS track logging, and an elegant genuine leather band.',
    rating: 4.7,
    category: 'Wearables',
    image: '/images/smartwatch.webp',
    stock: 7,
    reviews: [
      { id: 201, user: 'Elena R.', rating: 5, comment: 'Looks like a classic mechanical watch but has all the smart features. Health tracking metrics are extremely accurate!' },
      { id: 202, user: 'Marcus T.', rating: 4.4, comment: 'Beautiful design and great build quality. The battery lasts about 4 days, which is stellar for an AMOLED screen watch.' }
    ]
  },
  {
    id: 3,
    name: 'KeyCraft Mechanical Keyboard',
    price: 189,
    description: 'Tailored for typists and gamers alike. Features hot-swappable tactile switches, double-shot PBT keycaps, a solid aluminum frame, and customizable per-key RGB backlighting with dynamic animation controls.',
    rating: 4.9,
    category: 'Accessories',
    image: '/images/keyboard.webp',
    stock: 12,
    reviews: [
      { id: 301, user: 'Leo V.', rating: 5, comment: 'The typing feel is incredibly satisfying. Heavy aluminum base means it stays firmly in place. Simply top-tier.' },
      { id: 302, user: 'Alice G.', rating: 4.8, comment: 'Awesome switches. The sound profile is creamy right out of the box without any modding needed.' }
    ]
  },
  {
    id: 4,
    name: 'HydroVessel Premium Flask',
    price: 45,
    description: 'Stay hydrated in style. A triple-walled vacuum insulated water bottle finished in durable powder-coated matte color. Keeps your water ice-cold for 36 hours or hot for 18 hours.',
    rating: 4.6,
    category: 'Lifestyle',
    image: '/images/flask.webp',
    stock: 25,
    reviews: [
      { id: 401, user: 'Nora J.', rating: 5, comment: 'Kept my ice solid for a whole day in the summer heat. Easy to clean, and the lid loop is very convenient.' },
      { id: 402, user: 'Brian F.', rating: 4.2, comment: 'Minimal design, durable coating. Doesn\'t leak at all, though it fits a bit snug in my car\'s cup holders.' }
    ]
  },
  {
    id: 5,
    name: 'Voyageur Anti-Theft Backpack',
    price: 120,
    description: 'The ultimate companion for modern travel. Engineered from water-resistant ballistic nylon with hidden zippers, secret card slots, an integrated external USB charging port, and a padded 16" laptop pocket.',
    rating: 4.5,
    category: 'Lifestyle',
    image: '/images/backpack.webp',
    stock: 18,
    reviews: [
      { id: 501, user: 'Jared P.', rating: 5, comment: 'Great organization pocket structure. Traveled internationally with it and felt super secure with the hidden zippers.' },
      { id: 502, user: 'Chloe D.', rating: 4, comment: 'Sleek, low profile. It fits a surprising amount of gear, but is not designed for bulky items.' }
    ]
  },
  {
    id: 6,
    name: 'Lumina Ambient LED Bar',
    price: 59,
    description: 'Elevate your desktop or entertainment setup. Smart app-controlled dual lightbars with music rhythm synchronization, 16 million colors, and dynamic gradients. Includes vertical stands and monitor mounts.',
    rating: 4.7,
    category: 'Accessories',
    image: '/images/ledbar.webp',
    stock: 30,
    reviews: [
      { id: 601, user: 'Ethan W.', rating: 5, comment: 'Syncs perfectly with my PC audio. Adds so much atmosphere to my gaming room at night.' },
      { id: 602, user: 'Aria L.', rating: 4.4, comment: 'Easy to set up and configure. The app features dozens of presets which look absolutely gorgeous.' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} products. Skipping seed to avoid duplicates.`);
      console.log('To force re-seed, run: node seed.js --force');
      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      await Product.deleteMany({});
      console.log('Cleared existing products for re-seed.');
    }

    await Product.insertMany(SEED_PRODUCTS);
    console.log(`✅ Successfully seeded ${SEED_PRODUCTS.length} products into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
