// Mock data for the Vendor Dashboard.
// Shape is kept API-ready: swap each export for a fetch()/axios call later
// without touching the components that consume it.

export const vendorInfo = {
  name: "Nagi",
};

// 12 months of sales history. "orders" / "revenue" kept distinct from "sales"
// (sales = units, revenue = gross, could differ from net in real data).
export const monthlySales = [
  { month: "Jan", sales: 58200, orders: 24, revenue: 61500 },
  { month: "Feb", sales: 61400, orders: 27, revenue: 64800 },
  { month: "Mar", sales: 55800, orders: 22, revenue: 58900 },
  { month: "Apr", sales: 67200, orders: 29, revenue: 70100 },
  { month: "May", sales: 72100, orders: 31, revenue: 75600 },
  { month: "Jun", sales: 69800, orders: 28, revenue: 73200 },
  { month: "Jul", sales: 78900, orders: 34, revenue: 82400 },
  { month: "Aug", sales: 124500, orders: 42, revenue: 131200 },
  { month: "Sep", sales: 91200, orders: 37, revenue: 95600 },
  { month: "Oct", sales: 88400, orders: 35, revenue: 92100 },
  { month: "Nov", sales: 96700, orders: 39, revenue: 101300 },
  { month: "Dec", sales: 108300, orders: 44, revenue: 113900 },
];

// Kept separate so shorter filters (7D / 30D) have believable, denser points
// instead of just slicing the monthly array.
export const dailySales = Array.from({ length: 90 }).map((_, i) => {
  const base = 2200 + Math.sin(i / 6) * 900 + (i / 90) * 2600;
  const noise = Math.sin(i * 3.1) * 400;
  const value = Math.max(400, Math.round(base + noise));
  const d = new Date();
  d.setDate(d.getDate() - (89 - i));
  return {
    label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    sales: value,
    orders: Math.max(1, Math.round(value / 2600)),
    revenue: Math.round(value * 1.05),
  };
});

export const salesSummary = {
  totalSales: 842500,
  avgMonthlySales: 70208,
  growthPercent: 18.4,
};

export const inventoryOverview = {
  totalProducts: 48,
  lowStock: 6,
  availableStock: 324,
  outOfStock: 2
};

export const businessOverview = {
  totalOrders: 128,
  pendingOrders: 12,
  completedOrders: 116,
  totalSales: 842500,
  todaysSales: 12450,
  totalCustomers: 342,
};

export const productPerformance = [
  { id: 1, name: "Samsung S24", sales: 42, orders: 42, revenue: 210000, stock: 12, performance: "Excellent" },
  { id: 2, name: "iPhone 15", sales: 31, orders: 31, revenue: 186000, stock: 8, performance: "Good" },
  { id: 3, name: "OnePlus 13", sales: 18, orders: 18, revenue: 108000, stock: 3, performance: "Low Stock" },
  { id: 4, name: "Pixel 9", sales: 15, orders: 15, revenue: 82500, stock: 14, performance: "Good" },
  { id: 5, name: "Xiaomi 14", sales: 9, orders: 9, revenue: 41400, stock: 1, performance: "Low Stock" },
];

// Top 5 = productPerformance sorted by orders, capped — single source of truth
// so this list can never drift out of sync with the table above.
export const topSellingProducts = [...productPerformance]
  .sort((a, b) => b.orders - a.orders)
  .slice(0, 5);

export const carouselSlides = [
  { id: 1, title: "Samsung S24", subtitle: "Flagship pick of the month", price: "₹49,999" },
  { id: 2, title: "Festive Vendor Bonus", subtitle: "0% commission this week", price: "" },
  { id: 3, title: "iPhone 15", subtitle: "Back in stock", price: "₹68,999" },
  { id: 4, title: "New Promotions Tool", subtitle: "Boost visibility in 2 taps", price: "" },
];

