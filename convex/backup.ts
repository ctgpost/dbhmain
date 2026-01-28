import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const exportAllData = query({
  args: {},
  handler: async (ctx) => {
    await getAuthUserId(ctx);
    
    const products = await ctx.db.query("products").collect();
    const sales = await ctx.db.query("sales").collect();
    const customers = await ctx.db.query("customers").collect();
    const categories = await ctx.db.query("categories").collect();

    return {
      timestamp: Date.now(),
      version: "1.0",
      store: "DUBAI BORKA HOUSE",
      data: {
        products,
        sales,
        customers,
        categories
      }
    };
  },
});

export const importAllData = mutation({
  args: {
    data: v.object({
      products: v.array(v.any()),
      sales: v.array(v.any()),
      customers: v.array(v.any()),
      categories: v.array(v.any())
    })
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clear existing data first
    const existingProducts = await ctx.db.query("products").collect();
    const existingSales = await ctx.db.query("sales").collect();
    const existingCustomers = await ctx.db.query("customers").collect();
    const existingCategories = await ctx.db.query("categories").collect();

    // Delete existing records
    for (const product of existingProducts) {
      await ctx.db.delete(product._id);
    }
    for (const sale of existingSales) {
      await ctx.db.delete(sale._id);
    }
    for (const customer of existingCustomers) {
      await ctx.db.delete(customer._id);
    }
    for (const category of existingCategories) {
      await ctx.db.delete(category._id);
    }

    // Import new data (excluding system fields like _id, _creationTime)
    for (const category of args.data.categories) {
      const { _id, _creationTime, ...categoryData } = category;
      await ctx.db.insert("categories", categoryData);
    }

    for (const customer of args.data.customers) {
      const { _id, _creationTime, ...customerData } = customer;
      await ctx.db.insert("customers", customerData);
    }

    for (const product of args.data.products) {
      const { _id, _creationTime, ...productData } = product;
      await ctx.db.insert("products", productData);
    }

    for (const sale of args.data.sales) {
      const { _id, _creationTime, ...saleData } = sale;
      await ctx.db.insert("sales", saleData);
    }

    return { success: true, message: "Data imported successfully" };
  },
});

export const resetAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all data to delete
    const products = await ctx.db.query("products").collect();
    const sales = await ctx.db.query("sales").collect();
    const customers = await ctx.db.query("customers").collect();
    const categories = await ctx.db.query("categories").collect();

    // Delete all records
    for (const product of products) {
      await ctx.db.delete(product._id);
    }
    for (const sale of sales) {
      await ctx.db.delete(sale._id);
    }
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Create default categories
    await ctx.db.insert("categories", {
      name: "Casual Abayas",
      description: "Everyday wear abayas for casual occasions",
      color: "Blue",
      isActive: true
    });

    await ctx.db.insert("categories", {
      name: "Formal Abayas",
      description: "Elegant abayas for formal events and occasions",
      color: "Black",
      isActive: true
    });

    await ctx.db.insert("categories", {
      name: "Party Wear",
      description: "Stylish abayas for parties and celebrations",
      color: "Purple",
      isActive: true
    });

    return { success: true, message: "Application reset to default state successfully" };
  },
});
