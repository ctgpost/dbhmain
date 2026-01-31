import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOfflineSync } from "../hooks/useOfflineSync";

export function Dashboard() {
  const products = useQuery(api.products.list, {}) || [];
  const sales = useQuery(api.sales.list, {}) || [];
  const categories = useQuery(api.categories.list) || [];
  const customers = useQuery(api.customers.list, {}) || [];
  const storeSettings = useQuery(api.settings.get);
  const refunds = useQuery(api.refunds.list, {}) || [];
  
  const { isOnline, isSyncing } = useOfflineSync();

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

  // Refund statistics
  const totalRefunds = refunds.length;
  const totalRefundAmount = refunds.reduce((sum, r) => sum + r.refundAmount, 0);
  const pendingRefunds = refunds.filter(r => r.approvalStatus === "pending_approval");
  const completedRefunds = refunds.filter(r => r.status === "completed");
  const refundRate = sales.length > 0 ? ((totalRefunds / sales.length) * 100).toFixed(1) : "0";

  // Top selling products
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
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Online/Offline Indicator */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
            <span className="text-lg">📴</span>
            <span className="text-yellow-800 font-medium">
              {isSyncing ? "🔄 Syncing changes..." : "You are offline - using cached data"}
            </span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center border border-purple-300 shadow-md overflow-hidden">
                {storeSettings?.logo ? (
                  <img src={storeSettings.logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                ) : (
                  <img src="/LOGO2.png" alt="Dubai Borka House" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {storeSettings?.storeTitle || "DUBAI BORKA HOUSE"}
                </h1>
                {storeSettings?.tagline && <p className="text-xs text-slate-500 mt-0.5">{storeSettings.tagline}</p>}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-sm text-slate-500">📅</span>
              <span className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString('en-BD')}</span>
            </div>

            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded text-yellow-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
              <div className="text-xs sm:text-sm text-slate-600">
                {new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
        <div className="space-y-8">
          {/* Metrics Row 1: 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Total Bundles */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Bundles</p>
                  <p className="text-4xl font-bold text-slate-900">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-xl">📦</div>
              </div>
              <p className="text-sm text-slate-600">In inventory</p>
            </div>

            {/* Card 2: In Stock */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">In Stock</p>
                  <p className="text-4xl font-bold text-slate-900">{totalAbayas}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center text-xl">👗</div>
              </div>
              <p className="text-sm text-slate-600">Ready for sale</p>
            </div>

            {/* Card 3: Low Stock Items */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Low Stock</p>
                  <p className="text-4xl font-bold text-slate-900">{lowStockProducts.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center text-xl">⚠️</div>
              </div>
              <p className="text-sm text-slate-600">Need restocking</p>
            </div>

            {/* Card 4: Inventory Value */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Inventory Value</p>
                  <p className="text-4xl font-bold text-slate-900">৳{(totalValue / 100000).toFixed(1)}L</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-xl">💰</div>
              </div>
              <p className="text-sm text-slate-600">Total stock worth</p>
            </div>
          </div>

          {/* Sales Section: 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">💵</span>
                <h3 className="text-lg font-bold text-slate-900">Sales Overview</h3>
              </div>

              <div className="space-y-3">
                {/* Today's Sales */}
                <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-green-700 uppercase">Today's Sales</p>
                    <p className="text-2xl font-bold text-green-900">৳{todayTotal.toLocaleString('en-BD')}</p>
                  </div>
                  <p className="text-sm text-green-700">{todaysSales.length} transactions</p>
                </div>

                {/* Last 7 Days */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-blue-700 uppercase">Last 7 Days</p>
                    <p className="text-2xl font-bold text-blue-900">৳{totalRecentSales.toLocaleString('en-BD')}</p>
                  </div>
                  <p className="text-sm text-blue-700">{recentSales.length} transactions</p>
                </div>

                {/* Total Sales */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-purple-700 uppercase">Total Sales</p>
                    <p className="text-2xl font-bold text-purple-900">৳{sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('en-BD')}</p>
                  </div>
                  <p className="text-sm text-purple-700">{sales.length} transactions</p>
                </div>
              </div>
            </div>

            {/* Top Products Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
              </div>

              <div className="space-y-2">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                          <p className="text-xs text-slate-600">{product.quantity} sold</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900 ml-2">৳{product.revenue.toLocaleString('en-BD')}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6">No sales data</p>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Row 2: 5 Cards (including Refunds) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Total Customers */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Customers</p>
                  <p className="text-4xl font-bold text-slate-900">{customers.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xl">👥</div>
              </div>
              <p className="text-sm text-slate-600">Registered clients</p>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categories</p>
                  <p className="text-4xl font-bold text-slate-900">{categories.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-pink-100 border border-pink-200 flex items-center justify-center text-xl">📂</div>
              </div>
              <p className="text-sm text-slate-600">Product types</p>
            </div>

            {/* Average Sale Value */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg. Sale Value</p>
                  <p className="text-4xl font-bold text-slate-900">৳{sales.length > 0 ? Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toLocaleString('en-BD') : '0'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-xl">📈</div>
              </div>
              <p className="text-sm text-slate-600">Per transaction</p>
            </div>

            {/* Stock Turnover */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stock Turnover</p>
                  <p className="text-4xl font-bold text-slate-900">{totalAbayas > 0 ? Math.round((sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) / totalAbayas) * 100) : 0}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-xl">🔄</div>
              </div>
              <p className="text-sm text-slate-600">Movement rate</p>
            </div>

            {/* ✅ Refund Management Card */}
            <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Refunds</p>
                  <p className="text-4xl font-bold text-slate-900">{totalRefunds}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-xl">🔄</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">৳{totalRefundAmount.toLocaleString('en-BD')} total</p>
                <p className="text-xs text-slate-500">{refundRate}% refund rate</p>
              </div>
            </div>
          </div>

          {/* Low Stock Alert & Refund Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-xl border border-red-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl animate-pulse">⚠️</span>
                  <h3 className="text-lg font-bold text-red-900">Low Stock Alert</h3>
                  <span className="ml-auto inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    {lowStockProducts.length} items
                  </span>
                </div>
                <p className="text-sm text-red-700 mb-4">{lowStockProducts.length} product(s) need restocking</p>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div key={product._id} className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-red-700 mt-2">
                        Stock: <span className="font-bold">{product.currentStock}</span> / Min: {product.minStockLevel}
                      </p>
                    </div>
                  ))}
                </div>
                {lowStockProducts.length > 4 && (
                  <p className="text-xs text-red-700 mt-4 font-medium">+{lowStockProducts.length - 4} more items</p>
                )}
              </div>
            )}

            {/* ✅ Refund Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🔄</span>
                <h3 className="text-lg font-bold text-slate-900">Refund Status</h3>
              </div>

              <div className="space-y-3">
                {/* Pending Approvals */}
                <div className={`rounded-lg p-4 border ${pendingRefunds.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-xs font-semibold uppercase ${pendingRefunds.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                      Pending Approvals
                    </p>
                    <p className={`text-2xl font-bold ${pendingRefunds.length > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                      {pendingRefunds.length}
                    </p>
                  </div>
                  {pendingRefunds.length > 0 && (
                    <p className={`text-sm ${pendingRefunds.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                      Action required
                    </p>
                  )}
                </div>

                {/* Completed Refunds */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-green-700 uppercase">Completed Refunds</p>
                    <p className="text-2xl font-bold text-green-900">{completedRefunds.length}</p>
                  </div>
                  <p className="text-sm text-green-700">Processed successfully</p>
                </div>

                {/* Total Refund Amount */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-blue-700 uppercase">Total Refunded</p>
                    <p className="text-2xl font-bold text-blue-900">৳{totalRefundAmount.toLocaleString('en-BD')}</p>
                  </div>
                  <p className="text-sm text-blue-700">Refund rate: {refundRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🕒</span>
              <h3 className="text-lg font-bold text-slate-900">Recent Sales Activity</h3>
            </div>

            <div className="space-y-2">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Sale #{sale.saleNumber}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {sale.customerName || 'Walk-in'} • {new Date(sale._creationTime).toLocaleDateString('en-BD')}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-slate-900">৳{sale.total.toLocaleString('en-BD')}</p>
                    <p className="text-xs text-slate-600">{sale.items.length} items</p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-center text-slate-400 py-8">No recent sales</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
