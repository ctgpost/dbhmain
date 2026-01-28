import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { InvoiceModal } from "./InvoiceModal";

export function Sales() {
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const sales = useQuery(api.sales.list, {
    limit: 100,
  });

  if (!sales) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handleViewInvoice = (sale: any) => {
    setSelectedSale(sale);
    setShowInvoice(true);
  };

  const paymentMethods = [
    { id: "cash", name: "Cash" },
    { id: "bkash", name: "bKash" },
    { id: "nagad", name: "Nagad" },
    { id: "rocket", name: "Rocket" },
    { id: "upay", name: "Upay" },
    { id: "card", name: "Card" },
    { id: "cod", name: "Cash on Delivery" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Sales History</h1>
            <p className="text-sm text-gray-600 mt-1">Track all customer transactions and payments</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 text-sm font-semibold text-purple-600 border border-white/60">
            Total Sales: {sales.length}
          </div>
        </div>

        {/* Filters - iOS Style */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-50 font-medium transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-50 font-medium transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-50 font-medium transition-all text-sm"
            >
              <option value="">All Methods</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card View for Sales */}
      <div className="block sm:hidden space-y-4">
        {sales.map((sale) => (
          <div key={sale._id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{sale.saleNumber}</h3>
                <p className="text-xs text-gray-600 mt-1">{sale.customerName || "Walk-in Customer"}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                sale.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : sale.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {sale.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Items</p>
                <p className="font-bold text-gray-900 mt-1">{sale.items.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total</p>
                <p className="font-bold text-purple-600 mt-1">৳{sale.total.toLocaleString('en-BD')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Payment</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1 capitalize">
                  {sale.paymentMethod}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Date</p>
                <p className="font-medium text-gray-900 mt-1">{new Date(sale._creationTime).toLocaleDateString('en-BD')}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleViewInvoice(sale)}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all duration-300 text-sm"
            >
              View Invoice
            </button>
          </div>
        ))}
      </div>
                sale.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : sale.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {sale.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <p className="text-gray-500">Items</p>
                <p className="font-medium">{sale.items.length} items</p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-red-600">৳{sale.total.toLocaleString('en-BD')}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                  {sale.paymentMethod}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{new Date(sale._creationTime).toLocaleDateString('en-BD')}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleViewInvoice(sale)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              View Invoice
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sale #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{sale.saleNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.customerName || "Walk-in Customer"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{sale.items.length} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">৳{sale.total.toLocaleString('en-BD')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(sale._creationTime).toLocaleDateString('en-BD')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      sale.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : sale.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewInvoice(sale)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 text-xs"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards - iOS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-md border border-white/60 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Sales</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">৳{sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('en-BD')}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">💰</div>
          </div>
        </div>
        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-md border border-white/60 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Average Sale</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">৳{sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toLocaleString('en-BD') : '0'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">📊</div>
          </div>
        </div>
        <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-md border border-white/60 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Items Sold</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">📦</div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedSale && (
        <InvoiceModal
          sale={selectedSale}
          onClose={() => {
            setShowInvoice(false);
            setSelectedSale(null);
          }}
        />
      )}
      </div>
    </div>
  );
}
