/*
  Mock frontend data for Cart, PlaceOrder, OrderSuccess and Wishlist.
  Shape matches the existing DealHunts product structure (id, name,
  brand, image, vendor, price, originalPrice, discountPct, rating,
  vendorCount). Swap these arrays for Axios calls later — the pages
  only depend on this shape, not on where it comes from.
*/

export const initialCartItems = [
  {
    id: 'p-101',
    name: 'Samsung Galaxy S24 Ultra (256GB)',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
    vendor: 'Amazon',
    variant: 'Titanium Gray, 256GB',
    price: 104999,
    originalPrice: 129999,
    quantity: 1,
    inStock: true,
  },
  {
    id: 'p-102',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
    vendor: 'Flipkart',
    variant: 'Midnight Black',
    price: 26990,
    originalPrice: 34990,
    quantity: 2,
    inStock: true,
  },
  {
    id: 'p-103',
    name: 'Dyson V15 Detect Cordless Vacuum',
    brand: 'Dyson',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80',
    vendor: 'Croma',
    variant: null,
    price: 52900,
    originalPrice: 52900,
    quantity: 1,
    inStock: false,
  },
];

export const wishlistItems = [
  {
    id: 'p-201',
    name: 'Apple MacBook Air M3 (13-inch)',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    price: 114900,
    originalPrice: 124900,
    vendorCount: 6,
    rating: 4.7,
  },
  {
    id: 'p-202',
    name: 'LG 55" OLED evo C4 4K Smart TV',
    brand: 'LG',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80',
    price: 149999,
    originalPrice: 189999,
    vendorCount: 4,
    rating: 4.5,
  },
  {
    id: 'p-203',
    name: 'Canon EOS R50 Mirrorless Camera',
    brand: 'Canon',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    price: 62990,
    originalPrice: 69990,
    vendorCount: 5,
    rating: 4.3,
  },
  {
    id: 'p-204',
    name: 'boAt Airdopes 141 TWS Earbuds',
    brand: 'boAt',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    price: 1299,
    originalPrice: 2490,
    vendorCount: 9,
    rating: 4.1,
  },
];

export const savedAddresses = [
  {
    id: 'addr-1',
    name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    line1: 'Flat 302, Willow Residency',
    line2: 'Banjara Hills Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    isDefault: true,
  },
];

export const paymentMethods = [
  { id: 'cod', label: 'Cash on Delivery', helper: 'Pay when your order arrives' },
  { id: 'upi', label: 'UPI', helper: 'Google Pay, PhonePe, Paytm & more' },
  { id: 'card', label: 'Credit / Debit Card', helper: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', helper: 'All major Indian banks' },
];

export function buildOrderSummary(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = cartItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );
  const discount = Math.max(originalTotal - subtotal, 0);
  const delivery = subtotal > 0 && subtotal < 5000 ? 99 : 0;
  const total = subtotal + delivery;
  return { subtotal, discount, delivery, total };
}
