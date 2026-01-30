import { useState, lazy, Suspense, useEffect, useCallback, useMemo } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LoginWrapper } from "./components/LoginWrapper";
import { SignOutButton } from "./SignOutButton";
import { Dashboard } from "./components/Dashboard";
import { LazyLoadingFallback, preloadComponents } from "./utils/lazyLoad";
import { registerServiceWorkerCacheHandlers } from "./utils/cacheService";
import { useOfflineSync } from "./hooks/useOfflineSync";

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
const OutstandingAmount = lazy(() => import("./components/OutstandingAmount"));

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize offline sync
  const { isOnline } = useOfflineSync();
  
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
      () => import("./components/Customers"),
      () => import("./components/EmployeeManagement"),
      () => import("./components/BarcodeManager"),
    ];

    // Delay preloading to avoid blocking initial render
    const timer = setTimeout(() => {
      preloadComponents(preloadList).catch(console.error);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  
  // Fetch store settings
  const storeSettings = useQuery(api.settings.get);

  // Memoize menu items to prevent unnecessary recalculations
  const desktopMenuItems = useMemo(() => [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "pos", name: "POS", icon: "🏷️" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "categories", name: "Categories", icon: "📂" },
    { id: "stock-management", name: "Stock Mgmt", icon: "🏭" },
    { id: "stock-transfer", name: "Stock Transfer", icon: "🔄" },
    { id: "sales", name: "Sales", icon: "💰" },
    { id: "customers", name: "Customers", icon: "👥" },
    { id: "outstanding", name: "Outstanding", icon: "💸" },
    { id: "employees", name: "Employees", icon: "👔" },
    { id: "discounts", name: "Discounts", icon: "🎁" },
    { id: "whatsapp", name: "WhatsApp", icon: "📱" },
    { id: "online", name: "Online Store", icon: "🌐" },
    { id: "barcodes", name: "Barcodes", icon: "🏷️" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ], []);

  // Mobile bottom navigation items (4 main items)
  const mobileBottomNavItems = useMemo(() => [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "pos", name: "POS", icon: "🏷️" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "sales", name: "Sales", icon: "💰" },
  ], []);

  // Mobile menu items (accessible via hamburger menu)
  const mobileMenuItems = useMemo(() => [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "pos", name: "POS", icon: "🏷️" },
    { id: "inventory", name: "Inventory", icon: "📦" },
    { id: "categories", name: "Categories", icon: "📂" },
    { id: "stock-management", name: "Stock Mgmt", icon: "🏭" },
    { id: "stock-transfer", name: "Stock Transfer", icon: "🔄" },
    { id: "sales", name: "Sales", icon: "💰" },
    { id: "customers", name: "Customers", icon: "👥" },
    { id: "outstanding", name: "Outstanding", icon: "💸" },
    { id: "employees", name: "Employees", icon: "👔" },
    { id: "discounts", name: "Discounts", icon: "🎁" },
    { id: "whatsapp", name: "WhatsApp", icon: "📱" },
    { id: "online", name: "Online Store", icon: "🌐" },
    { id: "barcodes", name: "Barcodes", icon: "🏷️" },
    { id: "reports", name: "Reports", icon: "📈" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ], []);

  const renderContent = useCallback(() => {
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
      case "outstanding":
        return <Suspense fallback={<LazyLoadingFallback />}><OutstandingAmount /></Suspense>;
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
  }, [activeTab]);

  return (
    <>
      <Unauthenticated>
        <LoginWrapper />
      </Unauthenticated>
      <Authenticated>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-16 lg:pb-0">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-40 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              {/* Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
              >
                <span className="text-lg">☰</span>
              </button>

              {/* Logo & Store Title */}
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  {storeSettings?.logo ? (
                    <img src={storeSettings.logo} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <img src="/LOGO2.png" alt="Dubai Borka House" className="w-8 h-8 object-contain" />
                  )}
                </div>
                <h1 className="text-sm font-bold text-white truncate">
                  {(storeSettings?.storeTitle || "DUBAI BORKA HOUSE").split(" ")[0]}
                </h1>
              </div>

              {/* Sign Out */}
              <div className="flex-shrink-0">
                <SignOutButton />
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 shadow-xl z-50">
                <div className="max-h-96 overflow-y-auto">
                  {mobileMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-white/10 transition-all duration-200 ${
                        activeTab === item.id 
                          ? "bg-white/20 text-white border-l-4 border-l-purple-400" 
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <span className="font-medium text-sm">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex h-screen lg:h-auto">
            {/* Desktop Sidebar - Modern Design */}
            <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:bg-gradient-to-b lg:from-slate-800 lg:to-slate-900 lg:border-r lg:border-white/10 lg:shadow-2xl">
              {/* Logo Section */}
              <div className="flex items-center justify-center flex-shrink-0 px-6 py-6 border-b border-white/10">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 border border-white/20 flex items-center justify-center mb-3 mx-auto shadow-lg overflow-hidden">
                    {storeSettings?.logo ? (
                      <img src={storeSettings.logo} alt="Logo" className="w-14 h-14 object-contain" />
                    ) : (
                      <img src="/LOGO2.png" alt="Dubai Borka House" className="w-14 h-14 object-contain rounded-full" />
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-white mb-1">
                    {storeSettings?.storeTitle || "DUBAI BORKA HOUSE"}
                  </h2>
                  {storeSettings?.tagline && (
                    <p className="text-xs text-white/50">{storeSettings.tagline}</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-2">
                {desktopMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium text-sm ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-purple-500/30 to-blue-500/20 text-white border border-purple-400/30 shadow-lg shadow-purple-500/20"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className={`text-lg flex-shrink-0 transition-transform duration-200 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {activeTab === item.id && (
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-white/10 p-4">
                <SignOutButton />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-72 flex flex-col flex-1 overflow-hidden">
              <main className="flex-1 overflow-auto">
                <div className="py-6 px-4 sm:px-6 lg:px-8">
                  {renderContent()}
                </div>
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 z-40">
            <div className="grid grid-cols-4 gap-1 p-2">
              {mobileBottomNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-br from-purple-500/30 to-blue-500/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-semibold mt-1">{item.name}</span>
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
