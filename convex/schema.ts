import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Branches/Locations/Showrooms
  branches: defineTable({
    name: v.string(),
    code: v.string(), // Unique branch code
    address: v.string(),
    city: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    managerId: v.optional(v.id("employees")),
    managerName: v.optional(v.string()),
    isActive: v.boolean(),
    settings: v.optional(v.object({
      allowNegativeStock: v.boolean(),
      autoReorderLevel: v.number(),
      taxRate: v.number(),
      currency: v.string(),
    })),
  })
    .index("by_code", ["code"])
    .index("by_city", ["city"]),

  // Employees
  employees: defineTable({
    employeeId: v.string(), // Unique employee ID
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    position: v.string(), // "Manager", "Cashier", "Sales Associate", "Stock Keeper"
    branchId: v.id("branches"),
    branchName: v.string(),
    salary: v.optional(v.number()),
    commissionRate: v.optional(v.number()), // Percentage
    permissions: v.array(v.string()), // ["pos", "inventory", "reports", "customers", "settings"]
    isActive: v.boolean(),
    hireDate: v.number(),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relation: v.string(),
    })),
  })
    .index("by_branch", ["branchId"])
    .index("by_employee_id", ["employeeId"])
    .index("by_position", ["position"]),

  // Discount Management
  discounts: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // "percentage", "fixed_amount"
    value: v.number(), // Percentage or fixed amount
    scope: v.string(), // "all_products", "category", "specific_products"
    categoryIds: v.optional(v.array(v.id("categories"))),
    productIds: v.optional(v.array(v.id("products"))),
    branchIds: v.optional(v.array(v.id("branches"))), // Which branches can use this discount
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    usageLimit: v.optional(v.number()), // Max number of times this discount can be used
    usageCount: v.number(), // Current usage count
    minPurchaseAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    createdBy: v.id("users"),
    createdByName: v.string(),
  })
    .index("by_branch", ["branchIds"])
    .index("by_category", ["categoryIds"])
    .index("by_active", ["isActive"])
    .index("by_date_range", ["startDate", "endDate"]),

  // WhatsApp Orders
  whatsappOrders: defineTable({
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    customerWhatsApp: v.string(),
    items: v.array(v.object({
      productId: v.optional(v.id("products")),
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      size: v.optional(v.string()),
      color: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    subtotal: v.number(),
    discount: v.number(),
    deliveryCharge: v.number(),
    total: v.number(),
    status: v.string(), // "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"
    branchId: v.id("branches"),
    branchName: v.string(),
    assignedTo: v.optional(v.id("employees")),
    assignedToName: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    deliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    whatsappMessageId: v.optional(v.string()),
  })
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_customer_phone", ["customerPhone"])
    .index("by_assigned_to", ["assignedTo"]),

  // Online Store Products
  onlineProducts: defineTable({
    productId: v.id("products"),
    isOnline: v.boolean(),
    onlinePrice: v.optional(v.number()), // Different price for online
    onlineDiscount: v.optional(v.number()),
    onlineDescription: v.optional(v.string()),
    onlineImages: v.optional(v.array(v.string())),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featured: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_online", ["isOnline"])
    .index("by_featured", ["featured"]),

  // Online Orders
  onlineOrders: defineTable({
    orderNumber: v.string(),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      size: v.optional(v.string()),
      color: v.optional(v.string()),
    })),
    subtotal: v.number(),
    discount: v.number(),
    shippingCharge: v.number(),
    tax: v.number(),
    total: v.number(),
    status: v.string(), // "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"
    paymentStatus: v.string(), // "pending", "paid", "failed", "refunded"
    paymentMethod: v.string(),
    shippingAddress: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      postalCode: v.optional(v.string()),
    }),
    branchId: v.id("branches"), // Which branch will fulfill this order
    branchName: v.string(),
    assignedTo: v.optional(v.id("employees")),
    trackingNumber: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_customer", ["customerId"]),

  // Abaya Categories (Styles, Types)
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    isActive: v.boolean(),
  }),

  // Abaya Products
  products: defineTable({
    name: v.string(),
    brand: v.string(),
    model: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    
    // Abaya specific fields
    style: v.optional(v.string()), // "Traditional", "Modern", "Dubai Style", "Saudi Style", etc.
    fabric: v.string(), // "Crepe", "Chiffon", "Georgette", "Nida", "Jersey", etc.
    color: v.string(),
    sizes: v.array(v.string()), // ['50"', '52"', '54"', '56"', '58"', '60"', '62"']
    embellishments: v.optional(v.string()), // "Embroidered", "Beaded", "Lace", "Plain", etc.
    occasion: v.optional(v.string()), // "Daily Wear", "Party Wear", "Formal", "Casual", etc.
    
    // Pricing
    costPrice: v.number(),
    sellingPrice: v.number(),
    
    // Product image and barcode
    pictureUrl: v.optional(v.string()),
    barcode: v.string(),
    productCode: v.string(),
    madeBy: v.optional(v.string()),
    
    // Stock management per branch
    branchStock: v.array(v.object({
      branchId: v.id("branches"),
      branchName: v.string(),
      currentStock: v.number(),
      minStockLevel: v.number(),
      maxStockLevel: v.number(),
    })),
    
    // Global stock (sum of all branches)
    currentStock: v.number(),
    minStockLevel: v.number(),
    maxStockLevel: v.number(),
    
    // Product details
    description: v.optional(v.string()),
    
    // Status
    isActive: v.boolean(),
  })
    .index("by_category", ["categoryId"])
    .index("by_brand", ["brand"])
    .index("by_style", ["style"])
    .index("by_fabric", ["fabric"])
    .index("by_color", ["color"])
    .index("by_occasion", ["occasion"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["categoryId", "brand", "style", "fabric", "color", "occasion", "isActive"],
    }),

  // Sales
  sales: defineTable({
    saleNumber: v.string(),
    branchId: v.id("branches"),
    branchName: v.string(),
    customerId: v.optional(v.id("customers")),
    customerName: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      size: v.optional(v.string()),
      discountApplied: v.optional(v.object({
        discountId: v.id("discounts"),
        discountName: v.string(),
        discountValue: v.number(),
        discountAmount: v.number(),
      })),
    })),
    subtotal: v.number(),
    tax: v.number(),
    discount: v.number(),
    total: v.number(),
    paidAmount: v.number(),
    dueAmount: v.number(),
    paymentMethod: v.string(),
    paymentDetails: v.optional(v.object({
      transactionId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      reference: v.optional(v.string()),
      status: v.optional(v.string()),
    })),
    status: v.string(), // "completed", "partial", "pending", "cancelled", "returned"
    cashierId: v.id("users"),
    cashierName: v.string(),
    employeeId: v.optional(v.id("employees")),
    employeeName: v.optional(v.string()),
    deliveryInfo: v.optional(v.object({
      type: v.string(), // "pickup", "delivery"
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      charges: v.optional(v.number()),
    })),
  })
    .index("by_branch", ["branchId"])
    .index("by_customer", ["customerId"])
    .index("by_employee", ["employeeId"])
    .index("by_payment_method", ["paymentMethod"])
    .index("by_status", ["status"]),

  // Customers
  customers: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    preferredBranchId: v.optional(v.id("branches")),
    preferredStyle: v.optional(v.string()), // "Traditional", "Modern", etc.
    preferredSize: v.optional(v.string()),
    preferredColors: v.optional(v.array(v.string())),
    totalPurchases: v.number(),
    lastPurchaseDate: v.optional(v.number()),
    loyaltyPoints: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_phone", ["phone"])
    .index("by_email", ["email"])
    .index("by_branch", ["preferredBranchId"]),

  // Stock Movements
  stockMovements: defineTable({
    productId: v.id("products"),
    productName: v.string(),
    branchId: v.id("branches"),
    branchName: v.string(),
    type: v.string(), // "in", "out", "transfer", "adjustment"
    quantity: v.number(),
    reason: v.string(), // "Sale", "Return", "Damage", "Adjustment", "Transfer"
    reference: v.optional(v.string()), // Sale number, transfer number
    fromBranchId: v.optional(v.id("branches")), // For transfers
    toBranchId: v.optional(v.id("branches")), // For transfers
    userId: v.id("users"),
    userName: v.string(),
    employeeId: v.optional(v.id("employees")),
    employeeName: v.optional(v.string()),
    previousStock: v.number(),
    newStock: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_product", ["productId"])
    .index("by_branch", ["branchId"])
    .index("by_type", ["type"]),

  // Transactions (Mobile Banking, etc.)
  transactions: defineTable({
    transactionId: v.string(),
    branchId: v.id("branches"),
    branchName: v.string(),
    type: v.string(), // "sale", "expense", "payment"
    referenceId: v.optional(v.id("sales")),
    amount: v.number(),
    paymentMethod: v.string(),
    phoneNumber: v.optional(v.string()),
    status: v.string(), // "completed", "pending", "failed"
    details: v.optional(v.object({
      senderNumber: v.optional(v.string()),
      receiverNumber: v.optional(v.string()),
      fee: v.optional(v.number()),
      reference: v.optional(v.string()),
    })),
    userId: v.id("users"),
    employeeId: v.optional(v.id("employees")),
  })
    .index("by_branch", ["branchId"])
    .index("by_transaction_id", ["transactionId"])
    .index("by_type", ["type"])
    .index("by_payment_method", ["paymentMethod"]),

  // Branch Transfers
  branchTransfers: defineTable({
    transferNumber: v.string(),
    fromBranchId: v.id("branches"),
    fromBranchName: v.string(),
    toBranchId: v.id("branches"),
    toBranchName: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      unitCost: v.number(),
      totalCost: v.number(),
    })),
    totalItems: v.number(),
    totalCost: v.number(),
    status: v.string(), // "pending", "in_transit", "received", "cancelled"
    requestedBy: v.id("users"),
    requestedByName: v.string(),
    approvedBy: v.optional(v.id("users")),
    approvedByName: v.optional(v.string()),
    receivedBy: v.optional(v.id("users")),
    receivedByName: v.optional(v.string()),
    requestDate: v.number(),
    approvalDate: v.optional(v.number()),
    receivedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_from_branch", ["fromBranchId"])
    .index("by_to_branch", ["toBranchId"])
    .index("by_status", ["status"]),

  // Store Settings
  storeSettings: defineTable({
    storeName: v.string(),
    storeTitle: v.string(),
    logo: v.optional(v.string()), // Base64 encoded logo or URL
    favicon: v.optional(v.string()), // Base64 encoded favicon
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    theme: v.optional(v.object({
      primaryColor: v.string(),
      secondaryColor: v.string(),
    })),
    contact: v.optional(v.object({
      phone: v.string(),
      email: v.string(),
      address: v.string(),
      website: v.optional(v.string()),
    })),
    lastUpdated: v.number(),
    updatedBy: v.id("users"),
  }),

  // Customer Reviews & Ratings
  customerReviews: defineTable({
    productId: v.id("products"),
    orderId: v.optional(v.id("sales")),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    rating: v.number(), // 1-5 stars
    title: v.string(),
    review: v.string(),
    verified: v.boolean(), // true if purchased
    helpful: v.number(), // helpful count
    createdAt: v.number(),
    status: v.string(), // "pending", "approved", "rejected"
  })
    .index("by_product", ["productId"])
    .index("by_order", ["orderId"]),

  // Wishlist for Online Store
  wishlist: defineTable({
    userId: v.optional(v.id("users")),
    customerId: v.optional(v.id("customers")),
    productId: v.id("products"),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"]),

  // Coupon/Promo Codes
  coupons: defineTable({
    code: v.string(),
    description: v.optional(v.string()),
    discountType: v.string(), // "percentage", "fixed"
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxUsageCount: v.optional(v.number()),
    usedCount: v.number(),
    validFrom: v.number(),
    validUntil: v.number(),
    isActive: v.boolean(),
    applicableProducts: v.optional(v.array(v.id("products"))),
    applicableCategories: v.optional(v.array(v.id("categories"))),
  })
    .index("by_code", ["code"]),

  // Order Notifications
  orderNotifications: defineTable({
    orderId: v.optional(v.id("sales")),
    whatsappOrderId: v.optional(v.id("whatsappOrders")),
    onlineOrderId: v.optional(v.id("onlineOrders")),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notificationType: v.string(), // "email", "sms", "whatsapp"
    status: v.string(), // "pending", "sent", "failed"
    subject: v.optional(v.string()),
    message: v.string(),
    sentAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
  })
    .index("by_order", ["orderId"])
    .index("by_whatsapp_order", ["whatsappOrderId"])
    .index("by_online_order", ["onlineOrderId"]),

  // Return & Exchange Requests
  returns: defineTable({
    orderNumber: v.string(),
    orderId: v.optional(v.id("sales")),
    whatsappOrderId: v.optional(v.id("whatsappOrders")),
    onlineOrderId: v.optional(v.id("onlineOrders")),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerPhone: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      reason: v.string(),
      condition: v.string(), // "unopened", "used", "damaged"
    })),
    reason: v.string(),
    description: v.string(),
    status: v.string(), // "pending", "approved", "rejected", "completed"
    refundAmount: v.optional(v.number()),
    replacementOrderNumber: v.optional(v.string()),
    requestDate: v.number(),
    approvalDate: v.optional(v.number()),
    completionDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_order", ["orderId"])
    .index("by_customer", ["customerId"]),

  // Order Analytics/Metrics
  orderAnalytics: defineTable({
    date: v.string(), // "YYYY-MM-DD"
    channel: v.string(), // "pos", "whatsapp", "online"
    totalOrders: v.number(),
    totalRevenue: v.number(),
    averageOrderValue: v.number(),
    topProducts: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      revenue: v.number(),
    })),
    conversionRate: v.optional(v.number()),
  })
    .index("by_date", ["date"])
    .index("by_channel", ["channel"]),

  // User Roles
  userRoles: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()), // Array of permission names
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_name", ["name"]),

  // User Rules
  userRules: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    condition: v.string(), // JavaScript expression to evaluate
    action: v.string(), // Action to take if condition is true
    actionParams: v.optional(v.object({
      roleId: v.optional(v.id("userRoles")),
      roleName: v.optional(v.string()),
      permissions: v.optional(v.array(v.string())),
      metadata: v.optional(v.any()),
    })),
    isActive: v.boolean(),
    priority: v.number(), // Higher priority rules execute first
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_priority", ["priority"]),

  // User Rule Applications Log
  ruleApplicationLog: defineTable({
    ruleId: v.id("userRules"),
    ruleName: v.string(),
    userId: v.id("users"),
    userName: v.string(),
    applicationType: v.string(), // "auto", "manual", "scheduled"
    result: v.string(), // "success", "failed", "skipped"
    resultMessage: v.optional(v.string()),
    appliedAt: v.number(),
  })
    .index("by_rule", ["ruleId"])
    .index("by_user", ["userId"])
    .index("by_applied_at", ["appliedAt"]),

  // Permission Templates
  permissionTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
    category: v.string(), // "sales", "inventory", "reports", "admin", "settings"
    createdAt: v.number(),
  })
    .index("by_category", ["category"]),

  // Loyalty Program & Tiers
  loyaltyPrograms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    pointsPerDollar: v.number(), // e.g., 1 point per $1 spent
    isActive: v.boolean(),
    tiers: v.array(v.object({
      name: v.string(), // "Bronze", "Silver", "Gold", "Platinum"
      minPoints: v.number(),
      discountPercentage: v.number(),
      bonusPointsMultiplier: v.number(), // e.g., 1.5x for higher tiers
      benefits: v.optional(v.array(v.string())), // Special benefits like free shipping, birthday bonus
    })),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"]),

  // Customer Loyalty Account
  customerLoyalty: defineTable({
    customerId: v.id("customers"),
    customerName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    totalPoints: v.number(),
    availablePoints: v.number(),
    redeemedPoints: v.number(),
    currentTier: v.string(), // "Bronze", "Silver", "Gold", "Platinum"
    tierUpgradeDate: v.optional(v.number()),
    membershipDate: v.number(),
    lastActivityDate: v.number(),
    totalSpent: v.number(),
    totalOrders: v.number(),
    birthDate: v.optional(v.number()),
    referralCode: v.string(),
    referredCustomers: v.array(v.string()), // Array of referred customer IDs
    isActive: v.boolean(),
  })
    .index("by_customer", ["customerId"])
    .index("by_tier", ["currentTier"])
    .index("by_referral", ["referralCode"]),

  // Loyalty Points Transactions
  pointsTransactions: defineTable({
    customerId: v.id("customers"),
    customerName: v.string(),
    transactionType: v.string(), // "purchase", "redemption", "bonus", "refund", "referral", "adjustment"
    points: v.number(),
    description: v.string(),
    referenceId: v.optional(v.id("sales")), // Link to sale if applicable
    branchId: v.optional(v.id("branches")),
    branchName: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_type", ["transactionType"])
    .index("by_date", ["createdAt"]),

  // Enhanced Coupons with more features
  advancedCoupons: defineTable({
    code: v.string(),
    description: v.optional(v.string()),
    discountType: v.string(), // "percentage", "fixed", "points", "free_shipping"
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    usagePerCustomer: v.optional(v.number()), // Max uses per customer (default 1)
    maxUsageCount: v.optional(v.number()), // Total max uses globally
    usageCount: v.number(),
    validFrom: v.number(),
    validUntil: v.number(),
    isActive: v.boolean(),
    applicableProducts: v.optional(v.array(v.id("products"))),
    applicableCategories: v.optional(v.array(v.id("categories"))),
    applicableBranches: v.optional(v.array(v.id("branches"))),
    loyaltyTiersRequired: v.optional(v.array(v.string())), // e.g., ["Gold", "Platinum"]
    requiresLoyaltyPoints: v.optional(v.number()), // Minimum points to use
    createdBy: v.id("users"),
    createdByName: v.string(),
    createdAt: v.number(),
    usedBy: v.array(v.object({
      customerId: v.id("customers"),
      customerName: v.string(),
      usageCount: v.number(),
      lastUsedAt: v.number(),
    })),
  })
    .index("by_code", ["code"])
    .index("by_active", ["isActive"])
    .index("by_validity", ["validFrom", "validUntil"]),

  // Coupon Redemption History
  couponRedemptions: defineTable({
    couponId: v.id("advancedCoupons"),
    couponCode: v.string(),
    customerId: v.id("customers"),
    customerName: v.string(),
    saleId: v.optional(v.id("sales")),
    discountAmount: v.number(),
    pointsEarned: v.optional(v.number()),
    pointsRedeemed: v.optional(v.number()),
    branchId: v.id("branches"),
    branchName: v.string(),
    redeemedAt: v.number(),
    employeeId: v.optional(v.id("employees")),
    employeeName: v.optional(v.string()),
  })
    .index("by_coupon", ["couponId"])
    .index("by_customer", ["customerId"])
    .index("by_sale", ["saleId"])
    .index("by_date", ["redeemedAt"]),

  // Referral Program
  referralProgram: defineTable({
    referrerId: v.id("customers"),
    referrerName: v.string(),
    referrerPhone: v.optional(v.string()),
    referredCustomerId: v.optional(v.id("customers")),
    referredName: v.optional(v.string()),
    referredPhone: v.optional(v.string()),
    referralCode: v.string(),
    status: v.string(), // "pending", "completed", "cancelled"
    bonusPointsOffered: v.number(),
    bonusPointsAwarded: v.number(),
    referredAt: v.number(),
    completedAt: v.optional(v.number()),
    firstPurchaseAmount: v.optional(v.number()),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"]),

  // Stock Transfers
  stockTransfers: defineTable({
    transferNumber: v.string(),
    sourceBranchId: v.id("branches"),
    sourceBranchName: v.string(),
    destinationBranchId: v.id("branches"),
    destinationBranchName: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        currentStock: v.number(),
      })
    ),
    status: v.string(), // "pending", "approved", "in_transit", "completed", "cancelled"
    notes: v.optional(v.string()),
    requestedBy: v.string(),
    approvedBy: v.optional(v.string()),
    receivedBy: v.optional(v.string()),
    cancelReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    approvedAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_source_branch", ["sourceBranchId"])
    .index("by_destination_branch", ["destinationBranchId"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  // Inventory Transactions (Log)
  inventoryTransactions: defineTable({
    productId: v.id("products"),
    productName: v.string(),
    branchId: v.id("branches"),
    branchName: v.string(),
    type: v.string(), // "stock_transfer_out", "stock_transfer_in", "add", "deduct", "adjustment", "sale", "return", "purchase"
    quantity: v.number(),
    notes: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_branch", ["branchId"])
    .index("by_product", ["productId"])
    .index("by_date", ["createdAt"])
    .index("by_type", ["type"]),

  // Outstanding Amount / Customer Receivables Management
  outstandingAmounts: defineTable({
    customerId: v.id("customers"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    branchId: v.id("branches"),
    branchName: v.string(),
    saleIds: v.array(v.id("sales")), // Related sale IDs
    totalAmount: v.number(), // Total outstanding amount
    paidAmount: v.number(), // Total paid so far
    remainingAmount: v.number(), // Remaining balance
    outstandingDays: v.number(), // Days since first outstanding
    status: v.string(), // "active", "resolved", "overdue", "partial"
    dueDate: v.optional(v.number()), // Expected payment date
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    lastModifiedBy: v.id("users"),
  })
    .index("by_customer", ["customerId"])
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_amount", ["remainingAmount"])
    .index("by_days", ["outstandingDays"]),

  // Payment Records for Outstanding Amounts
  outstandingPayments: defineTable({
    outstandingId: v.id("outstandingAmounts"),
    customerId: v.id("customers"),
    customerName: v.string(),
    saleId: v.optional(v.id("sales")),
    saleNumber: v.optional(v.string()),
    amount: v.number(), // Payment amount
    paymentMethod: v.string(), // "cash", "card", "bank_transfer", "mobile_banking", "cheque", "other"
    paymentDetails: v.optional(v.object({
      transactionId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      chequeNumber: v.optional(v.string()),
      bankName: v.optional(v.string()),
      reference: v.optional(v.string()),
    })),
    paymentDate: v.number(),
    notes: v.optional(v.string()),
    branchId: v.id("branches"),
    branchName: v.string(),
    recordedBy: v.id("users"),
    recordedByName: v.string(),
  })
    .index("by_outstanding", ["outstandingId"])
    .index("by_customer", ["customerId"])
    .index("by_payment_date", ["paymentDate"])
    .index("by_payment_method", ["paymentMethod"]),

  // Payment Reminders for Outstanding Amounts
  paymentReminders: defineTable({
    outstandingId: v.id("outstandingAmounts"),
    customerId: v.id("customers"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    remainingAmount: v.number(),
    reminderType: v.string(), // "sms", "email", "whatsapp", "call"
    reminderStatus: v.string(), // "pending", "sent", "failed", "acknowledged"
    message: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    scheduledFor: v.number(), // Date when to send reminder
    daysOverdue: v.number(),
    createdAt: v.number(),
    sentBy: v.optional(v.id("users")),
    failureReason: v.optional(v.string()),
  })
    .index("by_outstanding", ["outstandingId"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["reminderStatus"])
    .index("by_date", ["scheduledFor"]),

  // Outstanding Amount Aging Report
  outstandingAging: defineTable({
    customerId: v.id("customers"),
    customerName: v.string(),
    branchId: v.id("branches"),
    branchName: v.string(),
    current: v.number(), // 0-30 days
    days30_60: v.number(), // 30-60 days
    days60_90: v.number(), // 60-90 days
    days90plus: v.number(), // 90+ days
    totalOutstanding: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_branch", ["branchId"]),

  // Collection History / Follow-ups
  collectionFollowups: defineTable({
    outstandingId: v.id("outstandingAmounts"),
    customerId: v.id("customers"),
    customerName: v.string(),
    followupType: v.string(), // "call", "sms", "email", "whatsapp", "visit", "note"
    description: v.string(),
    promiseAmount: v.optional(v.number()), // Amount customer promised to pay
    promiseDate: v.optional(v.number()), // When they promised to pay
    outcome: v.string(), // "promised", "partial_paid", "pending", "no_response", "refused"
    notes: v.optional(v.string()),
    nextFollowupDate: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.id("users"),
    createdByName: v.string(),
  })
    .index("by_outstanding", ["outstandingId"])
    .index("by_customer", ["customerId"])
    .index("by_type", ["followupType"])
    .index("by_date", ["createdAt"]),
};



export default defineSchema({
  ...authTables,
  ...applicationTables,
});
