import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const products = useQuery(api.products.list, {}) || [];
  const sales = useQuery(api.sales.list, {}) || [];
  const categories = useQuery(api.categories.list) || [];
  const customers = useQuery(api.customers.list, {}) || [];

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📊 Dashboard</h2>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleString('en-BD')}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📦</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Abaya Entry Bundles</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">👗</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Abayas In Stock</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{totalAbayas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚠️</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">💰</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inventory Value</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">৳{totalValue.toLocaleString('en-BD')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💵 Sales Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Today's Sales</p>
                <p className="text-xs text-green-600">{todaysSales.length} transactions</p>
              </div>
              <p className="text-xl font-bold text-green-900">৳{todayTotal.toLocaleString('en-BD')}</p>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">Last 7 Days</p>
                <p className="text-xs text-blue-600">{recentSales.length} transactions</p>
              </div>
              <p className="text-xl font-bold text-blue-900">৳{totalRecentSales.toLocaleString('en-BD')}</p>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-800">Total Sales</p>
                <p className="text-xs text-purple-600">{sales.length} transactions</p>
              </div>
              <p className="text-xl font-bold text-purple-900">
                ৳{sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('en-BD')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.quantity} sold</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ৳{product.revenue.toLocaleString('en-BD')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-sm">👥</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-lg font-semibold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 text-sm">📂</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-lg font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm">📈</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg. Sale Value</p>
              <p className="text-lg font-semibold text-gray-900">
                ৳{sales.length > 0 ? Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toLocaleString('en-BD') : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">🔄</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Stock Turnover</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalAbayas > 0 ? Math.round((sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0) / totalAbayas) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center mb-3">
            <span className="text-red-600 mr-2">⚠️</span>
            <h3 className="font-medium text-red-800">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-red-600 mb-3">
            {lowStockProducts.length} product(s) are running low on stock:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div key={product._id} className="bg-white p-2 rounded border border-red-200">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-red-600">Stock: {product.currentStock} (Min: {product.minStockLevel})</p>
              </div>
            ))}
          </div>
          {lowStockProducts.length > 6 && (
            <p className="text-xs text-red-500 mt-2">
              +{lowStockProducts.length - 6} more items need restocking
            </p>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 Recent Sales Activity</h3>
        <div className="space-y-3">
          {sales.slice(0, 5).map((sale) => (
            <div key={sale._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Sale #{sale.saleNumber}</p>
                <p className="text-xs text-gray-500">
                  {sale.customerName || 'Walk-in Customer'} • {new Date(sale._creationTime).toLocaleDateString('en-BD')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">৳{sale.total.toLocaleString('en-BD')}</p>
                <p className="text-xs text-gray-500">{sale.items.length} items</p>
              </div>
            </div>
          ))}
          {sales.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent sales</p>
          )}
        </div>
      </div>
    </div>
  );
}
