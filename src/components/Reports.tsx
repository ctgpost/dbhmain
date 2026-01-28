import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const sales = useQuery(api.sales.list, {}) || [];
  const products = useQuery(api.products.list, {}) || [];
  const categories = useQuery(api.categories.list) || [];
  const customers = useQuery(api.customers.list, {}) || [];

  // Filter sales by date range
  const startTime = new Date(dateRange.startDate).getTime();
  const endTime = new Date(dateRange.endDate).getTime() + 24 * 60 * 60 * 1000; // End of day
  const filteredSales = sales.filter(sale => 
    sale._creationTime >= startTime && sale._creationTime < endTime
  );

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const totalItemsSold = filteredSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Product performance
  const productPerformance = new Map<string, {
    name: string;
    quantitySold: number;
    revenue: number;
    profit: number;
  }>();

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p._id === item.productId);
      const existing = productPerformance.get(item.productId) || {
        name: item.productName,
        quantitySold: 0,
        revenue: 0,
        profit: 0
      };
      
      existing.quantitySold += item.quantity;
      existing.revenue += item.totalPrice;
      if (product) {
        existing.profit += (item.unitPrice - product.costPrice) * item.quantity;
      }
      
      productPerformance.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productPerformance.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Payment method breakdown
  const paymentMethods = new Map<string, { count: number; amount: number }>();
  filteredSales.forEach(sale => {
    const existing = paymentMethods.get(sale.paymentMethod) || { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += sale.total;
    paymentMethods.set(sale.paymentMethod, existing);
  });

  // Daily sales trend
  const dailySales = new Map<string, number>();
  filteredSales.forEach(sale => {
    const date = new Date(sale._creationTime).toLocaleDateString('en-BD');
    dailySales.set(date, (dailySales.get(date) || 0) + sale.total);
  });

  // Inventory metrics
  const totalProducts = products.length;
  const totalAbayas = products.reduce((sum, product) => sum + product.currentStock, 0);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);
  const inventoryValue = products.reduce((sum, product) => 
    sum + (product.sellingPrice * product.currentStock), 0
  );

  // Category performance
  const categoryPerformance = new Map<string, {
    name: string;
    revenue: number;
    itemsSold: number;
  }>();

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p._id === item.productId);
      const category = product?.categoryId ? categories.find(c => c._id === product.categoryId) : null;
      const categoryName = category?.name || 'Uncategorized';
      
      const existing = categoryPerformance.get(categoryName) || {
        name: categoryName,
        revenue: 0,
        itemsSold: 0
      };
      
      existing.revenue += item.totalPrice;
      existing.itemsSold += item.quantity;
      
      categoryPerformance.set(categoryName, existing);
    });
  });

  const topCategories = Array.from(categoryPerformance.values())
    .sort((a, b) => b.revenue - a.revenue);

  const exportToCSV = () => {
    const csvData = [
      ['Date', 'Sale Number', 'Customer', 'Items', 'Total', 'Payment Method'],
      ...filteredSales.map(sale => [
        new Date(sale._creationTime).toLocaleDateString('en-BD'),
        sale.saleNumber,
        sale.customerName || 'Walk-in Customer',
        sale.items.length,
        sale.total,
        sale.paymentMethod
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Track sales, inventory, and performance metrics</p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 sm:w-auto w-full"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Date Range Filter - iOS Style */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Date Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-5 sm:p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">৳{totalRevenue.toLocaleString('en-BD')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-5 sm:p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
                <span className="text-xl">🛒</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Transactions</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-5 sm:p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items Sold</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{totalItemsSold}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-5 sm:p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg. Order Value</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">৳{Math.round(averageOrderValue).toLocaleString('en-BD')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📦 Inventory Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100/50">
            <p className="text-2xl font-bold text-blue-700">{totalProducts}</p>
            <p className="text-xs text-blue-700 font-semibold mt-2">Total Abaya Entry Bundles</p>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-100/50">
            <p className="text-2xl font-bold text-green-700">{totalAbayas}</p>
            <p className="text-sm text-green-800">Total Abayas In Stock</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
            <p className="text-sm text-yellow-800">Low Stock Items</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
            <p className="text-sm text-red-800">Out of Stock</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">৳{Math.round(inventoryValue).toLocaleString('en-BD')}</p>
            <p className="text-sm text-purple-800">Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Products */}
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
                      <p className="text-xs text-gray-500">{product.quantitySold} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">৳{product.revenue.toLocaleString('en-BD')}</p>
                    <p className="text-xs text-green-600">+৳{product.profit.toLocaleString('en-BD')} profit</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales data for selected period</p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Payment Methods</h3>
          <div className="space-y-3">
            {Array.from(paymentMethods.entries()).map(([method, data]) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{method}</p>
                  <p className="text-xs text-gray-500">{data.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">৳{data.amount.toLocaleString('en-BD')}</p>
                  <p className="text-xs text-gray-500">
                    {totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
            {paymentMethods.size === 0 && (
              <p className="text-gray-500 text-center py-4">No payment data for selected period</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 Category Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCategories.length > 0 ? (
            topCategories.map((category, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">#{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-semibold">৳{category.revenue.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Sold:</span>
                    <span className="font-semibold">{category.itemsSold}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4 col-span-full">No category data for selected period</p>
          )}
        </div>
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Daily Sales Trend</h3>
        <div className="space-y-2">
          {Array.from(dailySales.entries())
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, amount]) => (
              <div key={date} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{date}</span>
                <span className="text-sm font-semibold text-gray-900">৳{amount.toLocaleString('en-BD')}</span>
              </div>
            ))}
          {dailySales.size === 0 && (
            <p className="text-gray-500 text-center py-4">No sales data for selected period</p>
          )}
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Customer Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
            <p className="text-sm text-blue-800">Total Customers</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {filteredSales.filter(sale => sale.customerName && sale.customerName !== 'Walk-in Customer').length}
            </p>
            <p className="text-sm text-green-800">Registered Customer Sales</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {filteredSales.filter(sale => !sale.customerName || sale.customerName === 'Walk-in Customer').length}
            </p>
            <p className="text-sm text-purple-800">Walk-in Sales</p>
          </div>
        </div>
      </div>
    </div>
  );
}
