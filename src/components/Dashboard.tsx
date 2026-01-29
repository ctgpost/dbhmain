import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const products = useQuery(api.products.list, {}) || [];
  const sales = useQuery(api.sales.list, {}) || [];
  const categories = useQuery(api.categories.list) || [];
  const customers = useQuery(api.customers.list, {}) || [];
  const storeSettings = useQuery(api.settings.get);

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
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm w-full">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0">
              {storeSettings?.logo ? (
                <img 
                  src={storeSettings.logo} 
                  alt="Store Logo" 
                  className="h-14 w-14 sm:h-16 sm:w-16 object-contain filter drop-shadow-md"
                />
              ) : (
                <div className="text-4xl sm:text-5xl">🏪</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {storeSettings?.storeTitle || "DUBAI BORKA HOUSE"}
              </h1>
              {storeSettings?.tagline && (
                <p className="text-xs text-gray-500 font-medium mt-0.5">{storeSettings.tagline}</p>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium tracking-wide">
            📅 {new Date().toLocaleString('en-BD')}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-44 sm:pt-48 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="space-y-6">
      {/* Key Metrics - iOS Style Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50/40 via-white to-slate-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-200/40 hover:border-blue-300/60 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Total Entry Bundles</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Active in inventory</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              📦
            </div>
          </div>
        </div>

        {/* Total Abayas Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-200/40 hover:border-green-300/60 hover:bg-gradient-to-br hover:from-green-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Abayas In Stock</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalAbayas}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Ready for sale</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              👗
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-yellow-200/40 hover:border-yellow-300/60 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Low Stock Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{lowStockProducts.length}</p>
              <p className="text-xs text-yellow-600 mt-2 font-medium">Need restocking</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              ⚠️
            </div>
          </div>
        </div>

        {/* Inventory Value Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50/40 via-white to-pink-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-200/40 hover:border-purple-300/60 hover:bg-gradient-to-br hover:from-purple-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Inventory Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">৳{(totalValue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Total stock worth</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Sales Overview and Top Products - iOS Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Overview Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-100/20 to-transparent rounded-full filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-2 mb-6">
            <span className="text-2xl">💵</span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Sales Overview</h3>
          </div>
          <div className="relative z-10 space-y-4">
            {/* Today's Sales */}
            <div className="group/card relative overflow-hidden bg-gradient-to-br from-green-50 via-green-50/60 to-emerald-50 rounded-2xl p-4 border border-green-200/60 hover:border-green-300/80 transition-all duration-300 cursor-pointer hover:shadow-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Today's Sales</p>
                  <p className="text-sm text-green-600 font-medium">{todaysSales.length} transactions</p>
                </div>
                <p className="text-2xl font-bold text-green-900">৳{todayTotal.toLocaleString('en-BD')}</p>
              </div>
            </div>
            
            {/* Last 7 Days */}
            <div className="group/card relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50/60 to-cyan-50 rounded-2xl p-4 border border-blue-200/60 hover:border-blue-300/80 transition-all duration-300 cursor-pointer hover:shadow-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Last 7 Days</p>
                  <p className="text-sm text-blue-600 font-medium">{recentSales.length} transactions</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">৳{totalRecentSales.toLocaleString('en-BD')}</p>
              </div>
            </div>

            {/* Total Sales */}
            <div className="group/card relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-50/60 to-violet-50 rounded-2xl p-4 border border-purple-200/60 hover:border-purple-300/80 transition-all duration-300 cursor-pointer hover:shadow-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Total Sales</p>
                  <p className="text-sm text-purple-600 font-medium">{sales.length} transactions</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  ৳{sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('en-BD')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-amber-100/20 to-transparent rounded-full filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-2 mb-6">
            <span className="text-2xl">🏆</span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Top Selling Products</h3>
          </div>
          <div className="relative z-10 space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="group/product relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-4 hover:from-slate-100 hover:to-slate-100 transition-all duration-300 border border-slate-200/60 hover:border-slate-300/80 shadow-md hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200/20 via-transparent to-transparent opacity-0 group-hover/product:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{product.quantity} sold</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-2">
                      ৳{product.revenue.toLocaleString('en-BD')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-6 font-medium">No sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats - iOS Style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Customers Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-indigo-200/40 hover:border-indigo-300/60 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Registered clients</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              👥
            </div>
          </div>
        </div>

        {/* Categories Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50/40 via-white to-rose-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-pink-200/40 hover:border-pink-300/60 hover:bg-gradient-to-br hover:from-pink-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Categories</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Product types</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              📂
            </div>
          </div>
        </div>

        {/* Average Sale Value Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50/40 via-white to-amber-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-200/40 hover:border-orange-300/60 hover:bg-gradient-to-br hover:from-orange-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Avg. Sale Value</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">৳{sales.length > 0 ? Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toLocaleString('en-BD') : '0'}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Per transaction</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              📈
            </div>
          </div>
        </div>

        {/* Stock Turnover Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-red-50/40 via-white to-rose-50/40 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-200/40 hover:border-red-300/60 hover:bg-gradient-to-br hover:from-red-50 hover:to-white">
          <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Stock Turnover</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalAbayas > 0 ? Math.round((sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) / totalAbayas) * 100) : 0}%</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Movement rate</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
              🔄
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert - iOS Style */}
      {lowStockProducts.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50/80 via-red-50/40 to-pink-50/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-red-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-100/30 to-transparent rounded-full filter blur-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-3 mb-5">
            <span className="text-2xl animate-pulse">⚠️</span>
            <h3 className="font-bold text-red-900 text-lg">Low Stock Alert</h3>
            <span className="ml-auto inline-block px-3 py-1 rounded-full bg-red-100/80 text-red-700 text-xs font-semibold shadow-md">
              {lowStockProducts.length} items
            </span>
          </div>
          <p className="relative z-10 text-sm text-red-700 font-medium mb-5">
            {lowStockProducts.length} product(s) are running low on stock and need restocking soon.
          </p>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div key={product._id} className="group/alert relative overflow-hidden bg-white/80 rounded-2xl p-3 border border-red-200/60 hover:border-red-300/80 hover:shadow-md transition-all duration-300 hover:bg-red-50/50">
                <p className="text-sm font-semibold text-gray-900 truncate group-hover/alert:text-red-700">{product.name}</p>
                <p className="text-xs text-red-600 font-medium mt-1.5">
                  Stock: <span className="font-bold">{product.currentStock}</span> (Min: {product.minStockLevel})
                </p>
              </div>
            ))}
          </div>
          {lowStockProducts.length > 6 && (
            <p className="relative z-10 text-xs text-red-600 font-medium mt-4 bg-white/50 rounded-lg p-2 inline-block border border-red-200/50">
              +{lowStockProducts.length - 6} more items need restocking
            </p>
          )}
        </div>
      )}

      {/* Recent Activity - iOS Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-500">
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-slate-100/30 to-transparent rounded-full filter blur-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-2 mb-6">
          <span className="text-2xl">🕒</span>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Sales Activity</h3>
        </div>
        <div className="relative z-10 space-y-3">
          {sales.slice(0, 5).map((sale) => (
            <div key={sale._id} className="group/recent relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-4 hover:from-slate-100 hover:to-slate-100 transition-all duration-300 border border-slate-200/60 hover:border-slate-300/80 shadow-md hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200/20 via-transparent to-transparent opacity-0 group-hover/recent:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Sale #{sale.saleNumber}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {sale.customerName || 'Walk-in Customer'} • {new Date(sale._creationTime).toLocaleDateString('en-BD')}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-gray-900">৳{sale.total.toLocaleString('en-BD')}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{sale.items.length} items</p>
                </div>
              </div>
            </div>
          ))}
          {sales.length === 0 && (
            <p className="text-gray-400 text-center py-8 font-medium">No recent sales</p>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
