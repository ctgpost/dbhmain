import { useState, lazy, Suspense, useEffect } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LoginWrapper } from "./components/LoginWrapper";
import { SignOutButton } from "./SignOutButton";
import { Dashboard } from "./components/Dashboard";
import { LazyLoadingFallback, preloadComponents } from "./utils/lazyLoad";
import { registerServiceWorkerCacheHandlers } from "./utils/cacheService";

// Lazy load heavy components
const Inventory = lazy(() => import("./components/Inventory"));
const POS = lazy(() => import("./components/POS"));
const EnhancedPOS = lazy(() => import("./components/EnhancedPOS"));
const Sales = lazy(() => import("./components/Sales"));
const Customers = lazy(() => import("./components/Customers"));
const Suppliers = lazy(() => import("./components/Suppliers"));
const PurchaseReceiving = lazy(() => import("./components/PurchaseReceiving"));
const BarcodeManager = lazy(() => import("./components/BarcodeManager"));
const Reports = lazy(() => import("./components/Reports"));
const Settings = lazy(() => import("./components/Settings"));
const Categories = lazy(() => import("./components/Categories"));
const EmployeeManagement = lazy(() => import("./components/EmployeeManagement"));
const DiscountManagement = lazy(() => import("./components/DiscountManagement"));
const WhatsAppOrders = lazy(() => import("./components/WhatsAppOrders"));
const OnlineStore = lazy(() => import("./components/OnlineStore"));
const StockTransferManagement = lazy(() => import("./components/StockTransferManagement"));
const StockManagement = lazy(() => import("./components/StockManagement"));

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize Service Worker and caching
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered successfully");
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }

    // Register cache handlers
    registerServiceWorkerCacheHandlers();

    // Preload main components for faster navigation
    const preloadList = [
      () => import("./components/POS"),
      () => import("./components/Inventory"),
      () => import("./components/Sales"),
      () => import("./components/Reports"),
    ];

    // Delay preloading to avoid blocking initial render
    const timer = setTimeout(() => {
      preloadComponents(preloadList).catch(console.error);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  
  // Fetch store settings
  const storeSettings = useQuery(api.settings.get);

  // Desktop menu items
  const desktopMenuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "pos", name: "POS", icon: "🏷️" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "categories", name: "Categories", icon: "📂" },
    { id: "sales", name: "Sales", icon: "💰" },
    { id: "customers", name: "Customers", icon: "👥" },
    { id: "employees", name: "Employees", icon: "👔" },
    { id: "discounts", name: "Discounts", icon: "🎁" },
    { id: "whatsapp", name: "WhatsApp", icon: "📱" },
    { id: "online", name: "Online Store", icon: "🌐" },
    { id: "barcodes", name: "Barcodes", icon: "🏷️" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  // Mobile bottom navigation items (4 main items)
  const mobileBottomNavItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "pos", name: "POS", icon: "🏷️" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "sales", name: "Sales", icon: "💰" },
  ];

  // Mobile menu items (accessible via hamburger menu)
  const mobileMenuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "pos", name: "POS", icon: "🏷️" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "categories", name: "Categories", icon: "📂" },    { id: "stock-management", name: "Stock Mgmt", icon: "🏭" },
    { id: "stock-transfer", name: "Stock Transfer", icon: "🔄" },    { id: "sales", name: "Sales", icon: "💰" },
    { id: "customers", name: "Customers", icon: "👥" },
    { id: "employees", name: "Employees", icon: "👔" },
    { id: "discounts", name: "Discounts", icon: "🎁" },
    { id: "whatsapp", name: "WhatsApp", icon: "📱" },
    { id: "online", name: "Online Store", icon: "🌐" },
    { id: "barcodes", name: "Barcodes", icon: "🏷️" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <Suspense fallback={<LazyLoadingFallback />}><Inventory /></Suspense>;
      case "categories":
        return <Suspense fallback={<LazyLoadingFallback />}><Categories /></Suspense>;
      case "stock-management":
        return <Suspense fallback={<LazyLoadingFallback />}><StockManagement /></Suspense>;
      case "stock-transfer":
        return <Suspense fallback={<LazyLoadingFallback />}><StockTransferManagement /></Suspense>;
      case "pos":
        return <Suspense fallback={<LazyLoadingFallback />}><POS /></Suspense>;
      case "enhanced-pos":
        return <Suspense fallback={<LazyLoadingFallback />}><EnhancedPOS /></Suspense>;
      case "sales":
        return <Suspense fallback={<LazyLoadingFallback />}><Sales /></Suspense>;
      case "customers":
        return <Suspense fallback={<LazyLoadingFallback />}><Customers /></Suspense>;
      case "employees":
        return <Suspense fallback={<LazyLoadingFallback />}><EmployeeManagement /></Suspense>;
      case "discounts":
        return <Suspense fallback={<LazyLoadingFallback />}><DiscountManagement /></Suspense>;
      case "whatsapp":
        return <Suspense fallback={<LazyLoadingFallback />}><WhatsAppOrders /></Suspense>;
      case "online":
        return <Suspense fallback={<LazyLoadingFallback />}><OnlineStore /></Suspense>;
      case "suppliers":
        return <Suspense fallback={<LazyLoadingFallback />}><Suppliers /></Suspense>;
      case "purchases":
        return <Suspense fallback={<LazyLoadingFallback />}><PurchaseReceiving /></Suspense>;
      case "barcodes":
        return <Suspense fallback={<LazyLoadingFallback />}><BarcodeManager /></Suspense>;
      case "reports":
        return <Suspense fallback={<LazyLoadingFallback />}><Reports /></Suspense>;
      case "settings":
        return <Suspense fallback={<LazyLoadingFallback />}><Settings /></Suspense>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Unauthenticated>
        <LoginWrapper />
      </Unauthenticated>
      <Authenticated>
        <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 text-purple-600"
              >
                {storeSettings?.logo ? (
                  <img src={storeSettings.logo} alt="Logo" className="h-10 w-10 object-contain flex-shrink-0" />
                ) : (
                  <span className="text-2xl">🏪</span>
                )}
                <span className="font-bold text-sm">{storeSettings?.storeTitle || "DUBAI BORKA HOUSE"}</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 hidden sm:block">
                  {mobileMenuItems.find(item => item.id === activeTab)?.name}
                </span>
                <SignOutButton />
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
                <div className="max-h-96 overflow-y-auto">
                  {mobileMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                        activeTab === item.id ? "bg-purple-50 text-purple-600 border-r-4 border-r-purple-600" : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
              <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center justify-center flex-shrink-0 px-4 mb-8">
                  {storeSettings?.logo ? (
                    <img src={storeSettings.logo} alt="Logo" className="h-16 w-16 object-contain flex-shrink-0" />
                  ) : (
                    <span className="text-4xl">🏪</span>
                  )}
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {desktopMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-purple-100 text-purple-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </nav>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                  <SignOutButton />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col flex-1">
              <main className="flex-1">
                <div className="py-4 px-4 sm:px-6 lg:px-8">
                  {renderContent()}
                </div>
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="grid grid-cols-4">
              {mobileBottomNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                    activeTab === item.id
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </Authenticated>
    </>
  );
}
