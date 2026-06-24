import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Customer from './models/Customer.js';
import Order from './models/Order.js';
import Staff from './models/Staff.js';
import Settings from './models/Settings.js';

// Product data from frontend
const PRODUCTS = [
  // Drinks
  { id: 'coffee', name: 'Coffee', price: 3.50, category: 'drinks', emoji: '☕' },
  { id: 'tea', name: 'Tea', price: 2.75, category: 'drinks', emoji: '🍵' },
  { id: 'juice', name: 'Orange Juice', price: 4.00, category: 'drinks', emoji: '🧃' },
  { id: 'soda', name: 'Soda', price: 2.00, category: 'drinks', emoji: '🥤' },
  { id: 'water', name: 'Water', price: 1.00, category: 'drinks', emoji: '💧' },
  { id: 'iced-latte', name: 'Iced Latte', price: 4.25, category: 'drinks', emoji: '🧋' },
  { id: 'smoothie', name: 'Smoothie', price: 5.50, category: 'drinks', emoji: '🥝' },
  { id: 'hot-chocolate', name: 'Hot Chocolate', price: 3.75, category: 'drinks', emoji: '🍶' },
  { id: 'lemonade', name: 'Lemonade', price: 3.00, category: 'drinks', emoji: '🍋' },

  // Food
  { id: 'sandwich', name: 'Sandwich', price: 6.50, category: 'food', emoji: '🥪' },
  { id: 'pizza', name: 'Pizza Slice', price: 4.50, category: 'food', emoji: '🍕' },
  { id: 'salad', name: 'Salad', price: 5.50, category: 'food', emoji: '🥗' },
  { id: 'burger', name: 'Burger', price: 7.00, category: 'food', emoji: '🍔' },
  { id: 'wrap', name: 'Wrap', price: 7.50, category: 'food', emoji: '🌯' },
  { id: 'soup', name: 'Soup', price: 4.50, category: 'food', emoji: '🍜' },
  { id: 'burrito', name: 'Burrito', price: 8.00, category: 'food', emoji: '🌮' },
  { id: 'pasta', name: 'Pasta', price: 6.50, category: 'food', emoji: '🍝' },

  // Snacks
  { id: 'chips', name: 'Chips', price: 2.00, category: 'snacks', emoji: '🍟' },
  { id: 'cookies', name: 'Cookies', price: 2.50, category: 'snacks', emoji: '🍪' },
  { id: 'nuts', name: 'Mixed Nuts', price: 3.00, category: 'snacks', emoji: '🥜' },
  { id: 'candy', name: 'Candy Bar', price: 1.75, category: 'snacks', emoji: '🍫' },
  { id: 'muffin', name: 'Muffin', price: 3.50, category: 'snacks', emoji: '🧁' },
  { id: 'brownie', name: 'Brownie', price: 3.00, category: 'snacks', emoji: '🍰' },
  { id: 'pretzel', name: 'Pretzel', price: 2.75, category: 'snacks', emoji: '🥨' },
  { id: 'granola-bar', name: 'Granola Bar', price: 2.25, category: 'snacks', emoji: '🍯' },

  // Merch
  { id: 'tshirt', name: 'T-Shirt', price: 15.00, category: 'merch', emoji: '👕' },
  { id: 'mug', name: 'Mug', price: 10.00, category: 'merch', emoji: '☕' },
  { id: 'sticker', name: 'Sticker Pack', price: 4.00, category: 'merch', emoji: '🌟' },
];

// Customer data from frontend
const CUSTOMERS = [
  { id: 'c1', name: 'Liam', demographic: 'boy', visits: 12, totalSpent: 48.50, lastVisit: '2026-06-17', favoriteItem: 'Hot Chocolate', emoji: '👦' },
  { id: 'c2', name: 'Noah', demographic: 'boy', visits: 8, totalSpent: 32.00, lastVisit: '2026-06-16', favoriteItem: 'Pizza Slice', emoji: '👦' },
  { id: 'c3', name: 'Emma', demographic: 'girl', visits: 15, totalSpent: 56.75, lastVisit: '2026-06-18', favoriteItem: 'Smoothie', emoji: '👧' },
  { id: 'c4', name: 'Olivia', demographic: 'girl', visits: 10, totalSpent: 41.25, lastVisit: '2026-06-15', favoriteItem: 'Muffin', emoji: '👧' },
  { id: 'c5', name: 'Ethan', demographic: 'children', visits: 6, totalSpent: 22.50, lastVisit: '2026-06-14', favoriteItem: 'Candy Bar', emoji: '🧒' },
  { id: 'c6', name: 'Sophia', demographic: 'children', visits: 9, totalSpent: 30.00, lastVisit: '2026-06-17', favoriteItem: 'Cookies', emoji: '🧒' },
  { id: 'c7', name: 'James', demographic: 'men', visits: 20, totalSpent: 96.00, lastVisit: '2026-06-18', favoriteItem: 'Coffee', emoji: '👨' },
  { id: 'c8', name: 'Michael', demographic: 'men', visits: 18, totalSpent: 87.50, lastVisit: '2026-06-17', favoriteItem: 'Burger', emoji: '👨' },
  { id: 'c9', name: 'William', demographic: 'men', visits: 14, totalSpent: 63.00, lastVisit: '2026-06-16', favoriteItem: 'Iced Latte', emoji: '👨' },
  { id: 'c10', name: 'Charlotte', demographic: 'women', visits: 22, totalSpent: 104.50, lastVisit: '2026-06-18', favoriteItem: 'Tea', emoji: '👩' },
  { id: 'c11', name: 'Amelia', demographic: 'women', visits: 16, totalSpent: 71.00, lastVisit: '2026-06-17', favoriteItem: 'Salad', emoji: '👩' },
  { id: 'c12', name: 'Harper', demographic: 'women', visits: 11, totalSpent: 52.25, lastVisit: '2026-06-15', favoriteItem: 'Lemonade', emoji: '👩' },
];

// Staff data
const STAFF = [
  { id: 's1', name: 'Alex Johnson', role: 'manager', shift: 'morning', email: 'alex@mpro.com', phone: '555-0101', status: 'active', hireDate: '2024-01-15', emoji: '👨‍💼', ordersHandled: 156, notes: 'Team lead' },
  { id: 's2', name: 'Sarah Chen', role: 'barista', shift: 'morning', email: 'sarah@mpro.com', phone: '555-0102', status: 'active', hireDate: '2024-03-20', emoji: '👩‍🍳', ordersHandled: 234, notes: 'Latte art expert' },
  { id: 's3', name: 'Mike Rivera', role: 'cashier', shift: 'afternoon', email: 'mike@mpro.com', phone: '555-0103', status: 'active', hireDate: '2024-06-10', emoji: '👨‍💻', ordersHandled: 189, notes: '' },
  { id: 's4', name: 'Emily Park', role: 'server', shift: 'evening', email: 'emily@mpro.com', phone: '555-0104', status: 'on-break', hireDate: '2025-01-05', emoji: '👩‍💼', ordersHandled: 98, notes: 'Part-time' },
  { id: 's5', name: 'Carlos Lopez', role: 'chef', shift: 'afternoon', email: 'carlos@mpro.com', phone: '555-0105', status: 'active', hireDate: '2024-11-12', emoji: '👨‍🍳', ordersHandled: 145, notes: 'Specializes in wraps' },
];

// Sample orders
const ORDERS = [
  {
    id: 'ORD-20260624-A1B2',
    items: [
      { product: { id: 'coffee', name: 'Coffee', price: 3.50, category: 'drinks', emoji: '☕' }, quantity: 2 },
      { product: { id: 'muffin', name: 'Muffin', price: 3.50, category: 'snacks', emoji: '🧁' }, quantity: 1 },
    ],
    subtotal: 10.50,
    tax: 0.84,
    total: 11.34,
    paymentMethod: 'card',
    createdAt: '2026-06-24T09:15:00.000Z',
    customerName: 'James',
    customerType: 'dine-in',
    customerId: 'c7',
    customerDemographic: 'men',
  },
  {
    id: 'ORD-20260624-C3D4',
    items: [
      { product: { id: 'smoothie', name: 'Smoothie', price: 5.50, category: 'drinks', emoji: '🥝' }, quantity: 1 },
      { product: { id: 'salad', name: 'Salad', price: 5.50, category: 'food', emoji: '🥗' }, quantity: 1 },
    ],
    subtotal: 11.00,
    tax: 0.88,
    total: 11.88,
    paymentMethod: 'mobile',
    createdAt: '2026-06-24T10:30:00.000Z',
    customerName: 'Emma',
    customerType: 'takeout',
    customerId: 'c3',
    customerDemographic: 'girl',
  },
  {
    id: 'ORD-20260624-E5F6',
    items: [
      { product: { id: 'burger', name: 'Burger', price: 7.00, category: 'food', emoji: '🍔' }, quantity: 1 },
      { product: { id: 'soda', name: 'Soda', price: 2.00, category: 'drinks', emoji: '🥤' }, quantity: 2 },
      { product: { id: 'chips', name: 'Chips', price: 2.00, category: 'snacks', emoji: '🍟' }, quantity: 1 },
    ],
    subtotal: 13.00,
    tax: 1.04,
    total: 14.04,
    paymentMethod: 'cash',
    createdAt: '2026-06-24T12:45:00.000Z',
    customerName: 'Michael',
    customerType: 'dine-in',
    customerId: 'c8',
    customerDemographic: 'men',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Create a .env file in server/');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Staff.deleteMany({});
    await Settings.deleteMany({});

    // Seed products
    console.log('📦 Seeding products...');
    await Product.insertMany(PRODUCTS);
    console.log(`   ✓ ${PRODUCTS.length} products seeded`);

    // Seed customers
    console.log('👥 Seeding customers...');
    await Customer.insertMany(CUSTOMERS);
    console.log(`   ✓ ${CUSTOMERS.length} customers seeded`);

    // Seed staff
    console.log('👨‍💼 Seeding staff...');
    await Staff.insertMany(STAFF);
    console.log(`   ✓ ${STAFF.length} staff members seeded`);

    // Seed orders
    console.log('📋 Seeding orders...');
    await Order.insertMany(ORDERS);
    console.log(`   ✓ ${ORDERS.length} orders seeded`);

    // Seed default settings
    console.log('⚙️  Seeding settings...');
    await Settings.create({ key: 'default' });
    console.log('   ✓ Default settings seeded');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
