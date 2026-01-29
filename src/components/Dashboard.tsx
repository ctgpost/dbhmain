import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const products = useQuery(api.products.list, {}) || [];
  const sales = useQuery(api.sales.list, {}) || [];
  const categories = useQuery(api.categories.list) || [];
  const customers = useQuery(api.customers.list, {}) || [];
  const storeSettings = useQuery(api.settings.get);

  // If data is loading, show a loading state
  if (products === undefined || sales === undefined || categories === undefined || customers === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">সিস্টেম প্রস্তুত হচ্ছে</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const totalAbayas = products.reduce((sum, product) => sum + product.currentStock, 0);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);
  const totalValue = products.reduce((sum, product) => 
    sum + (product.sellingPrice * product.currentStock), 0
  );

  // Recent sales (last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSales = sales.filter(sale => sale._creationTime >= sevenDaysAgo);
  const totalRecentSales = recentSales.reduce((sum, sale) => sum + sale.total, 0);

  // Today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSales = sales.filter(sale => sale._creationTime >= today.getTime());
  const todayTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);

  // Stock alerts
  const criticalStockProducts = products.filter(p => p.currentStock === 0);
  const lowStockAlerts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  
  // Mobile banking transactions (from recent sales)
  const mobileBankingStats = {
    bkash: recentSales.filter(s => s.paymentMethod === 'bkash').reduce((sum, s) => sum + s.total, 0),
    nagad: recentSales.filter(s => s.paymentMethod === 'nagad').reduce((sum, s) => sum + s.total, 0),
    rocket: recentSales.filter(s => s.paymentMethod === 'rocket').reduce((sum, s) => sum + s.total, 0),
  };
  // Top selling products (by quantity sold)
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.totalPrice;
      productSales.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header with Logo and Title - iOS Style */}
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              {storeSettings?.logo ? (
                <img 
                  src={storeSettings.logo} 
                  alt="Store Logo" 
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                />
              ) : (
                <div className="text-5xl sm:text-6xl">🏪</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {storeSettings?.storeTitle || "DUBAI BORKA HOUSE"}
              </h1>
              {storeSettings?.tagline && (
                <p className="text-sm text-gray-500 font-medium mt-1">{storeSettings.tagline}</p>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium tracking-wide">
            Last updated: {new Date().toLocaleString('en-BD')}
          </div>
        </div>

      {/* Key Metrics - Premium Gradient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products Card */}
        <div className="group bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-300/30 hover:border-blue-200/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Total Entry Bundles</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">{totalProducts}</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Active in inventory</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
              📦
            </div>
          </div>
        </div>

        {/* Total Abayas Card */}
        <div className="group bg-gradient-to-br from-green-500 via-emerald-400 to-teal-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-300/30 hover:border-green-200/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Abayas In Stock</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">{totalAbayas}</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Ready for sale</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
              👗
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="group bg-gradient-to-br from-amber-500 via-orange-400 to-red-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-300/30 hover:border-amber-200/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">⚡ Low Stock Items</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">{lowStockProducts.length}</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Need restocking</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:animate-pulse">
              ⚠️
            </div>
          </div>
        </div>

        {/* Inventory Value Card */}
        <div className="group bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-300/30 hover:border-purple-200/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Inventory Value</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">৳{(totalValue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Total stock worth</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Sales Overview and Top Products - Premium Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Overview Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/30 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">💵</div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Sales Overview</h3>
            </div>
            <div className="space-y-3">
              {/* Today's Sales */}
              <div className="group bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-green-400/20 hover:border-green-300/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300"></div>
                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider mb-1">📅 Today's Sales</p>
                    <p className="text-sm text-white/80 font-semibold">{todaysSales.length} transactions</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">৳{todayTotal.toLocaleString('en-BD')}</p>
                </div>
              </div>
              
              {/* Last 7 Days */}
              <div className="group bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-blue-400/20 hover:border-blue-300/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300"></div>
                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider mb-1">📊 Last 7 Days</p>
                    <p className="text-sm text-white/80 font-semibold">{recentSales.length} transactions</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">৳{totalRecentSales.toLocaleString('en-BD')}</p>
                </div>
              </div>

              {/* Total Sales */}
              <div className="group bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-purple-400/20 hover:border-purple-300/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300"></div>
                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider mb-1">🏆 Total Sales</p>
                    <p className="text-sm text-white/80 font-semibold">{sales.length} transactions</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    ৳{sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('en-BD')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/30 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🏆</div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Top Selling</h3>
            </div>
            <div className="space-y-2">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="group bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-2xl p-4 hover:from-slate-600/70 hover:to-slate-500/50 transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">📦 {product.quantity} sold</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-amber-300 whitespace-nowrap ml-2">
                        ৳{product.revenue.toLocaleString('en-BD')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8 font-medium">No sales data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Premium Gradient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Customers Card */}
        <div className="group bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-indigo-400/30 hover:border-indigo-300/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Total Customers</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">{customers.length}</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Registered clients</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
              👥
            </div>
          </div>
        </div>

        {/* Categories Card */}
        <div className="group bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-pink-400/30 hover:border-pink-300/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Categories</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">{categories.length}</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Product types</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
              📂
            </div>
          </div>
        </div>

        {/* Average Sale Value Card */}
        <div className="group bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-400/30 hover:border-orange-300/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Avg. Sale Value</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">৳{sales.length > 0 ? Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toLocaleString('en-BD') : '0'}</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Per transaction</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-6">
              📈
            </div>
          </div>
        </div>

        {/* Stock Turnover Card */}
        <div className="group bg-gradient-to-br from-red-600 via-red-500 to-pink-400 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-red-400/30 hover:border-red-300/60 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-white/80 tracking-wide uppercase mb-2">Stock Turnover</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">{totalAbayas > 0 ? Math.round((sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) / totalAbayas) * 100) : 0}%</p>
              <p className="text-xs text-white/70 mt-2 font-semibold">Movement rate</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-300 group-hover:animate-spin">
              🔄
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert - Premium Style */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-400 rounded-3xl p-6 sm:p-8 border border-red-400/30 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl animate-pulse">⚠️</span>
              <h3 className="font-bold text-white text-2xl">Low Stock Alert</h3>
              <span className="ml-auto inline-block px-4 py-2 rounded-full bg-white/20 text-white text-sm font-bold border border-white/40 backdrop-blur">
                {lowStockProducts.length} items
              </span>
            </div>
            <p className="text-white/90 font-semibold mb-5 text-lg">
              {lowStockProducts.length} product(s) are running low on stock and need restocking soon.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div key={product._id} className="group bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-300 hover:bg-white/15">
                  <p className="text-sm font-bold text-white truncate">{product.name}</p>
                  <p className="text-xs text-white/80 font-semibold mt-2">
                    📦 Stock: <span className="font-bold text-white">{product.currentStock}</span> (Min: {product.minStockLevel})
                  </p>
                </div>
              ))}
            </div>
            {lowStockProducts.length > 6 && (
              <p className="text-sm text-white/80 font-bold mt-5 bg-white/10 rounded-xl p-3 inline-block border border-white/20 backdrop-blur">
                📌 +{lowStockProducts.length - 6} more items need restocking
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity - Premium Dark Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/30 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🕒</span>
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Recent Sales Activity</h3>
          </div>
          <div className="space-y-2">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale._id} className="group bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-2xl p-4 hover:from-slate-600/70 hover:to-slate-500/50 transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">Sale #{sale.saleNumber}</p>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      {new Date(sale._creationTime).toLocaleString('en-BD')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold border border-green-400/30">
                      🛒 {sale.items.length}
                    </span>
                    <p className="text-lg font-bold text-emerald-300 whitespace-nowrap">
                      ৳{sale.total.toLocaleString('en-BD')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
