import React, { Suspense, lazy, ComponentType, ReactNode } from "react";

interface LazyComponentProps {
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

/**
 * Lazy load a component with automatic code splitting
 * @example
 * const Dashboard = lazyImport(() => import('./Dashboard'));
 * 
 * <Suspense fallback={<Loading />}>
 *   <Dashboard />
 * </Suspense>
 */
export function lazyImport<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  return React.lazy(factory);
}

/**
 * Wrapper component for lazy loaded components with loading state
 */
export const LazyBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = <LazyLoadingFallback /> }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

/**
 * Default loading fallback component
 */
export const LazyLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium">লোডিং হচ্ছে...</p>
      <p className="text-sm text-gray-400 mt-2">একটু অপেক্ষা করুন</p>
    </div>
  </div>
);

/**
 * Preload a lazy component for faster rendering
 */
export function preloadComponent<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>
): void {
  factory().catch((error) => {
    console.warn("Failed to preload component:", error);
  });
}

/**
 * Create a route-based lazy loaded component
 */
// Pre-defined lazy route components to avoid dynamic import issues
export const LazyRoutes: Record<string, ComponentType<any>> = {
  Dashboard: lazy(() => import("../components/Dashboard").then(m => ({ default: m.Dashboard }))),
  POS: lazy(() => import("../components/POS").then(m => ({ default: m.POS }))),
  Inventory: lazy(() => import("../components/Inventory").then(m => ({ default: m.Inventory }))),
  Sales: lazy(() => import("../components/Sales").then(m => ({ default: m.Sales }))),
  Customers: lazy(() => import("../components/Customers").then(m => ({ default: m.Customers }))),
  Reports: lazy(() => import("../components/Reports").then(m => ({ default: m.Reports }))),
  Settings: lazy(() => import("../components/Settings").then(m => ({ default: m.Settings }))),
  Categories: lazy(() => import("../components/Categories").then(m => ({ default: m.Categories }))),
  EmployeeManagement: lazy(() => import("../components/EmployeeManagement").then(m => ({ default: m.EmployeeManagement }))),
  DiscountManagement: lazy(() => import("../components/DiscountManagement").then(m => ({ default: m.DiscountManagement }))),
  BarcodeManager: lazy(() => import("../components/BarcodeManager").then(m => ({ default: m.BarcodeManager }))),
  WhatsAppOrders: lazy(() => import("../components/WhatsAppOrders").then(m => ({ default: m.WhatsAppOrders }))),
  OnlineStore: lazy(() => import("../components/OnlineStore").then(m => ({ default: m.OnlineStore }))),
  Suppliers: lazy(() => import("../components/Suppliers").then(m => ({ default: m.Suppliers }))),
  PurchaseReceiving: lazy(() => import("../components/PurchaseReceiving").then(m => ({ default: m.PurchaseReceiving }))),
  EnhancedPOS: lazy(() => import("../components/EnhancedPOS").then(m => ({ default: m.EnhancedPOS }))),
};

export function createLazyRoute<P extends object>(
  componentName: string
): ComponentType<P> {
  const Component = LazyRoutes[componentName] || LazyRoutes.Dashboard;
  (Component as any).displayName = `Lazy(${componentName})`;
  return Component;
}

/**
 * Batch preload multiple components
 */
export async function preloadComponents(
  factories: Array<() => Promise<any>>
): Promise<void> {
  await Promise.allSettled(factories.map((factory) => factory()));
}
