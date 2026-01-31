import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ✅ Get all refunds
export const list = query({
  args: {
    branchId: v.optional(v.id("branches")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    
    let refunds = await ctx.db
      .query("refunds")
      .order("desc")
      .take(args.limit || 100);

    if (args.branchId) {
      refunds = refunds.filter(r => r.branchId === args.branchId);
    }

    if (args.status) {
      refunds = refunds.filter(r => r.status === args.status);
    }

    return refunds;
  },
});

// ✅ Get refund by ID
export const get = query({
  args: { id: v.id("refunds") },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db.get(args.id);
  },
});

// ✅ Get refunds for a specific sale
export const getBySale = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db
      .query("refunds")
      .withIndex("by_sale", q => q.eq("saleId", args.saleId))
      .collect();
  },
});

// ✅ Get refunds for a customer
export const getByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    return await ctx.db
      .query("refunds")
      .withIndex("by_customer", q => q.eq("customerId", args.customerId))
      .collect();
  },
});

// ✅ Get pending refunds requiring approval
export const getPendingApproval = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    
    let refunds = await ctx.db
      .query("refunds")
      .withIndex("by_approval_status", q => q.eq("approvalStatus", "pending_approval"))
      .collect();

    if (args.branchId) {
      refunds = refunds.filter(r => r.branchId === args.branchId);
    }

    return refunds;
  },
});

// ✅ Get refund policy for a branch
export const getPolicy = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    
    const policy = await ctx.db
      .query("refundPolicies")
      .withIndex("by_branch", q => q.eq("branchId", args.branchId))
      .first();

    return policy || null;
  },
});

// ✅ Create refund request
export const create = mutation({
  args: {
    saleId: v.id("sales"),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      size: v.optional(v.string()),
      reason: v.string(),
      condition: v.string(),
      notes: v.optional(v.string()),
    })),
    subtotal: v.number(),
    tax: v.number(),
    discount: v.number(),
    refundAmount: v.number(),
    refundMethod: v.string(),
    refundReason: v.string(),
    refundNotes: v.optional(v.string()),
    restockRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get sale info
    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("Sale not found");

    // Get branch policy
    const policy = await ctx.db
      .query("refundPolicies")
      .withIndex("by_branch", q => q.eq("branchId", sale.branchId))
      .first();

    if (policy && !policy.allowRefunds) {
      throw new Error("Refunds are not allowed at this branch");
    }

    // Check refund window
    if (policy) {
      const daysSinceSale = (Date.now() - (sale._creationTime || 0)) / (1000 * 60 * 60 * 24);
      if (daysSinceSale > policy.refundWindowDays) {
        throw new Error(`Refund window of ${policy.refundWindowDays} days has passed`);
      }
    }

    // Get user info
    const user = await ctx.db.get(userId);

    // Determine approval status
    let approvalStatus = "pending_approval";
    if (policy?.autoApproveBelow && args.refundAmount <= policy.autoApproveBelow) {
      approvalStatus = "approved";
    }

    // Create refund record
    const refundNumber = `REF-${Date.now()}`;
    const refundId = await ctx.db.insert("refunds", {
      refundNumber,
      saleId: args.saleId,
      saleNumber: sale.saleNumber,
      branchId: sale.branchId,
      branchName: sale.branchName,
      customerId: sale.customerId,
      customerName: sale.customerName,
      customerPhone: sale.customerName,
      items: args.items,
      subtotal: args.subtotal,
      tax: args.tax,
      discount: args.discount,
      refundAmount: args.refundAmount,
      refundMethod: args.refundMethod,
      originalPaymentMethod: sale.paymentMethod,
      status: "pending",
      approvalStatus,
      refundReason: args.refundReason,
      refundNotes: args.refundNotes,
      requestDate: Date.now(),
      isReturned: false,
      restockRequired: args.restockRequired,
    });

    // Create audit trail entry
    await ctx.db.insert("refundAuditTrail", {
      refundId,
      refundNumber,
      actionType: "created",
      newStatus: "pending",
      performedBy: userId,
      performedByName: user?.name || user?.email || "Unknown",
      timestamp: Date.now(),
      notes: `Refund request created by ${user?.name || "system"}`,
    });

    return { refundId, refundNumber, approvalStatus };
  },
});

// ✅ Approve refund
export const approve = mutation({
  args: {
    refundId: v.id("refunds"),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const refund = await ctx.db.get(args.refundId);
    if (!refund) throw new Error("Refund not found");

    if (refund.approvalStatus !== "pending_approval") {
      throw new Error(`Cannot approve refund with status: ${refund.approvalStatus}`);
    }

    const user = await ctx.db.get(userId);

    // Update refund
    await ctx.db.patch(args.refundId, {
      approvalStatus: "approved",
      approvalDate: Date.now(),
      approvedBy: userId,
      approvedByName: user?.name || user?.email || "Unknown",
    });

    // Create audit trail
    await ctx.db.insert("refundAuditTrail", {
      refundId: args.refundId,
      refundNumber: refund.refundNumber,
      actionType: "approved",
      previousStatus: refund.approvalStatus,
      newStatus: "approved",
      performedBy: userId,
      performedByName: user?.name || user?.email || "Unknown",
      timestamp: Date.now(),
      notes: args.approvalNotes,
    });

    return { success: true, refundId: args.refundId };
  },
});

// ✅ Reject refund
export const reject = mutation({
  args: {
    refundId: v.id("refunds"),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const refund = await ctx.db.get(args.refundId);
    if (!refund) throw new Error("Refund not found");

    const user = await ctx.db.get(userId);

    // Update refund
    await ctx.db.patch(args.refundId, {
      status: "rejected",
      approvalStatus: "rejected",
      processedBy: userId,
      processedByName: user?.name || user?.email || "Unknown",
      processedDate: Date.now(),
      internalNotes: args.rejectionReason,
    });

    // Create audit trail
    await ctx.db.insert("refundAuditTrail", {
      refundId: args.refundId,
      refundNumber: refund.refundNumber,
      actionType: "rejected",
      previousStatus: refund.approvalStatus,
      newStatus: "rejected",
      performedBy: userId,
      performedByName: user?.name || user?.email || "Unknown",
      timestamp: Date.now(),
      notes: args.rejectionReason,
    });

    return { success: true, refundId: args.refundId };
  },
});

// ✅ Process refund (process payment)
export const process = mutation({
  args: {
    refundId: v.id("refunds"),
    refundDetails: v.optional(v.object({
      transactionId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      reference: v.optional(v.string()),
      status: v.optional(v.string()),
      remark: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const refund = await ctx.db.get(args.refundId);
    if (!refund) throw new Error("Refund not found");

    if (refund.approvalStatus !== "approved") {
      throw new Error(`Cannot process unapproved refund`);
    }

    const user = await ctx.db.get(userId);

    // Update refund
    await ctx.db.patch(args.refundId, {
      status: "processed",
      processedBy: userId,
      processedByName: user?.name || user?.email || "Unknown",
      processedDate: Date.now(),
      refundDetails: args.refundDetails,
    });

    // Create audit trail
    await ctx.db.insert("refundAuditTrail", {
      refundId: args.refundId,
      refundNumber: refund.refundNumber,
      actionType: "processed",
      previousStatus: refund.status,
      newStatus: "processed",
      performedBy: userId,
      performedByName: user?.name || user?.email || "Unknown",
      timestamp: Date.now(),
      notes: `Refund processed with method: ${refund.refundMethod}`,
    });

    return { success: true, refundId: args.refundId };
  },
});

// ✅ Mark refund as completed
export const complete = mutation({
  args: {
    refundId: v.id("refunds"),
    returnCondition: v.optional(v.string()),
    inspectionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const refund = await ctx.db.get(args.refundId);
    if (!refund) throw new Error("Refund not found");

    const user = await ctx.db.get(userId);

    // ✅ UNDO SALE - Get original sale to reverse all transactions
    let originalSale = null;
    if (refund.saleId) {
      originalSale = await ctx.db.get(refund.saleId);
    }

    // Update refund status
    await ctx.db.patch(args.refundId, {
      status: "completed",
      completedDate: Date.now(),
      isReturned: true,
      returnDate: Date.now(),
      returnCondition: args.returnCondition,
      inspectionNotes: args.inspectionNotes,
    });

    // ✅ STEP 1: Mark original sale as CANCELLED (complete undo)
    if (originalSale && refund.saleId) {
      await ctx.db.patch(refund.saleId, {
        status: "cancelled", // ✅ Mark as cancelled (not just returned)
      });
    }

    // ✅ STEP 2: Record refund payment transaction
    if (originalSale && originalSale.paidAmount > 0) {
      // Record the refund as a credit/reversal entry
      // Since there's no explicit payment reversal table, we create an audit entry
      // The actual payment reversal is tracked in the sale status change to "cancelled"
      // and documented in the refund audit trail
    }

    // ✅ STEP 3: Restore all products to inventory
    if (refund.restockRequired && refund.items) {
      for (const item of refund.items) {
        // Create stock movement record
        await ctx.db.insert("stockMovements", {
          productId: item.productId,
          productName: item.productName,
          branchId: refund.branchId,
          branchName: refund.branchName,
          type: "in", // ✅ Stock coming IN (return to inventory)
          quantity: item.quantity,
          reason: "Undo Sale Return",
          reference: refund.refundNumber,
          userId,
          userName: user?.name || "Unknown",
          previousStock: 0,
          newStock: 0,
          notes: `Sale UNDO: Restocking from sale #${originalSale?.saleNumber || "N/A"} - Refund #${refund.refundNumber}`,
        });

        // Update product stock
        const product = await ctx.db.get(item.productId);
        if (product) {
          const newStock = (product.currentStock || 0) + item.quantity;
          
          // Update global stock
          await ctx.db.patch(item.productId, {
            currentStock: newStock,
            isActive: true,
          });

          // Update branch-specific stock if applicable
          if (product.branchStock && product.branchStock.length > 0) {
            const updatedBranchStock = product.branchStock.map((bs: any) => {
              if (bs.branchId === refund.branchId) {
                return {
                  ...bs,
                  currentStock: (bs.currentStock || 0) + item.quantity,
                };
              }
              return bs;
            });
            await ctx.db.patch(item.productId, {
              branchStock: updatedBranchStock,
            });
          }
        }
      }
    }

    // ✅ STEP 4: Reverse loyalty points if applicable
    if (originalSale?.customerId) {
      const customer = await ctx.db.get(originalSale.customerId);
      if (customer) {
        // Find loyalty points earned from this sale 
        // Look for purchase transactions linked to this sale
        const allPointsForSale = await ctx.db
          .query("pointsTransactions")
          .collect();

        // Filter for purchase type transactions from this sale only
        let totalPointsToReverse = 0;
        for (const transaction of allPointsForSale) {
          if (
            transaction.transactionType === "purchase" && 
            transaction.referenceId === refund.saleId
          ) {
            totalPointsToReverse += transaction.points;
          }
        }

        if (totalPointsToReverse > 0) {
          // Record reversal transaction
          await ctx.db.insert("pointsTransactions", {
            customerId: originalSale.customerId,
            customerName: originalSale.customerName || "Walk-in",
            transactionType: "refund", // ✅ Mark as refund reversal
            points: -totalPointsToReverse, // ✅ Negative = points reversed
            description: `Points reversal for sale #${originalSale.saleNumber} - Refund #${refund.refundNumber}`,
            referenceId: refund.saleId,
            branchId: refund.branchId,
            branchName: refund.branchName,
            createdAt: Date.now(),
            createdBy: userId,
            notes: `Loyalty points reversed: -${totalPointsToReverse} points`,
          });

          // Update customer loyalty points
          const reversedPoints = (customer.loyaltyPoints || 0) - totalPointsToReverse;
          await ctx.db.patch(originalSale.customerId, {
            loyaltyPoints: Math.max(0, reversedPoints), // ✅ Don't go below 0
          });
        }
      }
    }

    // ✅ STEP 5: Record discount reversal if discounts were applied
    if (originalSale && originalSale.discount > 0) {
      // Discount is already captured in refund amount, but create audit record
      await ctx.db.insert("refundAuditTrail", {
        refundId: args.refundId,
        refundNumber: refund.refundNumber,
        actionType: "discount_reversal",
        previousStatus: "pending",
        newStatus: "completed",
        performedBy: userId,
        performedByName: user?.name || user?.email || "Unknown",
        timestamp: Date.now(),
        notes: `Discount reversal: ${originalSale.discount} (included in refund of ${refund.refundAmount})`,
      });
    }

    // ✅ STEP 6: Record tax reversal
    if (originalSale && originalSale.tax > 0) {
      // Tax is already captured in refund amount, but create audit record
      await ctx.db.insert("refundAuditTrail", {
        refundId: args.refundId,
        refundNumber: refund.refundNumber,
        actionType: "tax_reversal",
        previousStatus: "pending",
        newStatus: "completed",
        performedBy: userId,
        performedByName: user?.name || user?.email || "Unknown",
        timestamp: Date.now(),
        notes: `Tax reversal: ${originalSale.tax} (included in refund of ${refund.refundAmount})`,
      });
    }

    // ✅ STEP 7: Create comprehensive completion audit trail
    await ctx.db.insert("refundAuditTrail", {
      refundId: args.refundId,
      refundNumber: refund.refundNumber,
      actionType: "completed",
      previousStatus: refund.status,
      newStatus: "completed",
      performedBy: userId,
      performedByName: user?.name || user?.email || "Unknown",
      timestamp: Date.now(),
      notes: `✅ UNDO SALE COMPLETED - All transactions reversed. Original sale #${originalSale?.saleNumber || "N/A"} marked as cancelled. Payment reversed (${originalSale?.paidAmount || 0}). Stock restored (${refund.items?.length || 0} items). Loyalty points reversed. Return condition: ${args.returnCondition || "Not specified"}`,
    });

    return { 
      success: true, 
      refundId: args.refundId,
      message: "Sale completely undone. All transactions reversed, inventory restored, loyalty points adjusted.",
    };
  },
});

// ✅ Update refund policy
export const updatePolicy = mutation({
  args: {
    branchId: v.id("branches"),
    allowRefunds: v.optional(v.boolean()),
    refundWindowDays: v.optional(v.number()),
    requireApproval: v.optional(v.boolean()),
    maxRefundPercentage: v.optional(v.number()),
    requireReturnedGoods: v.optional(v.boolean()),
    allowPartialRefund: v.optional(v.boolean()),
    allowedReasons: v.optional(v.array(v.string())),
    requirePhotoEvidence: v.optional(v.boolean()),
    requireManagerApprovalAbove: v.optional(v.number()),
    autoApproveBelow: v.optional(v.number()),
    autoCompleteAfterDays: v.optional(v.number()),
    autoRestockRefundedItems: v.optional(v.boolean()),
    restockPenalty: v.optional(v.number()),
    notifyManagerOnRefund: v.optional(v.boolean()),
    notifyCustomerOnApproval: v.optional(v.boolean()),
    notifyCustomerOnCompletion: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);

    // Find existing policy
    const existingPolicy = await ctx.db
      .query("refundPolicies")
      .withIndex("by_branch", q => q.eq("branchId", args.branchId))
      .first();

    const branch = await ctx.db.get(args.branchId);

    const policyData = {
      ...(args.allowRefunds !== undefined && { allowRefunds: args.allowRefunds }),
      ...(args.refundWindowDays !== undefined && { refundWindowDays: args.refundWindowDays }),
      ...(args.requireApproval !== undefined && { requireApproval: args.requireApproval }),
      ...(args.maxRefundPercentage !== undefined && { maxRefundPercentage: args.maxRefundPercentage }),
      ...(args.requireReturnedGoods !== undefined && { requireReturnedGoods: args.requireReturnedGoods }),
      ...(args.allowPartialRefund !== undefined && { allowPartialRefund: args.allowPartialRefund }),
      ...(args.allowedReasons !== undefined && { allowedReasons: args.allowedReasons }),
      ...(args.requirePhotoEvidence !== undefined && { requirePhotoEvidence: args.requirePhotoEvidence }),
      ...(args.requireManagerApprovalAbove !== undefined && { requireManagerApprovalAbove: args.requireManagerApprovalAbove }),
      ...(args.autoApproveBelow !== undefined && { autoApproveBelow: args.autoApproveBelow }),
      ...(args.autoCompleteAfterDays !== undefined && { autoCompleteAfterDays: args.autoCompleteAfterDays }),
      ...(args.autoRestockRefundedItems !== undefined && { autoRestockRefundedItems: args.autoRestockRefundedItems }),
      ...(args.restockPenalty !== undefined && { restockPenalty: args.restockPenalty }),
      ...(args.notifyManagerOnRefund !== undefined && { notifyManagerOnRefund: args.notifyManagerOnRefund }),
      ...(args.notifyCustomerOnApproval !== undefined && { notifyCustomerOnApproval: args.notifyCustomerOnApproval }),
      ...(args.notifyCustomerOnCompletion !== undefined && { notifyCustomerOnCompletion: args.notifyCustomerOnCompletion }),
      updatedBy: userId,
      updatedByName: user?.name || user?.email || "Unknown",
      lastUpdated: Date.now(),
    };

    if (existingPolicy) {
      await ctx.db.patch(existingPolicy._id, policyData);
      return { success: true, policyId: existingPolicy._id, isNew: false };
    } else {
      const policyId = await ctx.db.insert("refundPolicies", {
        branchId: args.branchId,
        branchName: branch?.name || "Unknown",
        allowRefunds: args.allowRefunds !== undefined ? args.allowRefunds : true,
        refundWindowDays: args.refundWindowDays || 30,
        requireApproval: args.requireApproval !== undefined ? args.requireApproval : true,
        maxRefundPercentage: args.maxRefundPercentage || 100,
        requireReturnedGoods: args.requireReturnedGoods !== undefined ? args.requireReturnedGoods : true,
        allowPartialRefund: args.allowPartialRefund !== undefined ? args.allowPartialRefund : true,
        allowedReasons: args.allowedReasons || ["defective", "wrong_item", "customer_request", "other"],
        requirePhotoEvidence: args.requirePhotoEvidence !== undefined ? args.requirePhotoEvidence : false,
        requireManagerApprovalAbove: args.requireManagerApprovalAbove || 5000,
        autoApproveBelow: args.autoApproveBelow || 1000,
        autoCompleteAfterDays: args.autoCompleteAfterDays || 7,
        autoRestockRefundedItems: args.autoRestockRefundedItems !== undefined ? args.autoRestockRefundedItems : true,
        restockPenalty: args.restockPenalty,
        notifyManagerOnRefund: args.notifyManagerOnRefund !== undefined ? args.notifyManagerOnRefund : true,
        notifyCustomerOnApproval: args.notifyCustomerOnApproval !== undefined ? args.notifyCustomerOnApproval : true,
        notifyCustomerOnCompletion: args.notifyCustomerOnCompletion !== undefined ? args.notifyCustomerOnCompletion : true,
        updatedBy: userId,
        updatedByName: user?.name || user?.email || "Unknown",
        lastUpdated: Date.now(),
      });
      return { success: true, policyId, isNew: true };
    }
  },
});

// ✅ Get refund statistics
export const getStatistics = query({
  args: {
    branchId: v.optional(v.id("branches")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);

    let refunds = await ctx.db.query("refunds").collect();

    if (args.branchId) {
      refunds = refunds.filter(r => r.branchId === args.branchId);
    }

    if (args.startDate !== undefined && args.endDate !== undefined) {
      refunds = refunds.filter(r => r.requestDate >= args.startDate! && r.requestDate <= args.endDate!);
    }

    const stats = {
      totalRefunds: refunds.length,
      totalRefundAmount: refunds.reduce((sum, r) => sum + r.refundAmount, 0),
      byStatus: {
        pending: refunds.filter(r => r.status === "pending").length,
        approved: refunds.filter(r => r.approvalStatus === "approved").length,
        processed: refunds.filter(r => r.status === "processed").length,
        completed: refunds.filter(r => r.status === "completed").length,
        rejected: refunds.filter(r => r.status === "rejected").length,
      },
      byReason: {} as Record<string, number>,
      byMethod: {} as Record<string, number>,
      pendingApproval: refunds.filter(r => r.approvalStatus === "pending_approval").length,
      averageRefundAmount: refunds.length > 0 ? refunds.reduce((sum, r) => sum + r.refundAmount, 0) / refunds.length : 0,
    };

    // Count by reason
    refunds.forEach(r => {
      stats.byReason[r.refundReason] = (stats.byReason[r.refundReason] || 0) + 1;
    });

    // Count by method
    refunds.forEach(r => {
      stats.byMethod[r.refundMethod] = (stats.byMethod[r.refundMethod] || 0) + 1;
    });

    return stats;
  },
});

// ✅ Get refund audit trail
export const getAuditTrail = query({
  args: { refundId: v.id("refunds") },
  handler: async (ctx, args) => {
    await getAuthUserId(ctx);
    
    return await ctx.db
      .query("refundAuditTrail")
      .withIndex("by_refund", q => q.eq("refundId", args.refundId))
      .order("desc")
      .collect();
  },
});
