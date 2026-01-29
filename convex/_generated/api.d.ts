/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as backup from "../backup.js";
import type * as branches from "../branches.js";
import type * as categories from "../categories.js";
import type * as coupons from "../coupons.js";
import type * as customers from "../customers.js";
import type * as dashboard from "../dashboard.js";
import type * as discountUtils from "../discountUtils.js";
import type * as discounts from "../discounts.js";
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as loyalty from "../loyalty.js";
import type * as notifications from "../notifications.js";
import type * as onlineStore from "../onlineStore.js";
import type * as products from "../products.js";
import type * as returns from "../returns.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as sales from "../sales.js";
import type * as settings from "../settings.js";
import type * as stockManagement from "../stockManagement.js";
import type * as stockTransfer from "../stockTransfer.js";
import type * as userRules from "../userRules.js";
import type * as whatsappOrders from "../whatsappOrders.js";
import type * as wishlist from "../wishlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  backup: typeof backup;
  branches: typeof branches;
  categories: typeof categories;
  coupons: typeof coupons;
  customers: typeof customers;
  dashboard: typeof dashboard;
  discountUtils: typeof discountUtils;
  discounts: typeof discounts;
  employees: typeof employees;
  http: typeof http;
  loyalty: typeof loyalty;
  notifications: typeof notifications;
  onlineStore: typeof onlineStore;
  products: typeof products;
  returns: typeof returns;
  reviews: typeof reviews;
  router: typeof router;
  sales: typeof sales;
  settings: typeof settings;
  stockManagement: typeof stockManagement;
  stockTransfer: typeof stockTransfer;
  userRules: typeof userRules;
  whatsappOrders: typeof whatsappOrders;
  wishlist: typeof wishlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
