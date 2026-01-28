import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("storeSettings").first();
    return settings;
  },
});

export const update = mutation({
  args: {
    storeName: v.optional(v.string()),
    storeTitle: v.optional(v.string()),
    logo: v.optional(v.string()),
    favicon: v.optional(v.string()),
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
    clearLogo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get existing settings
    const existingSettings = await ctx.db.query("storeSettings").first();

    // Prepare update object
    const updateObj: any = {
      lastUpdated: Date.now(),
      updatedBy: userId,
    };

    // Update fields if provided
    if (args.storeName !== undefined) updateObj.storeName = args.storeName;
    if (args.storeTitle !== undefined) updateObj.storeTitle = args.storeTitle;
    if (args.tagline !== undefined) updateObj.tagline = args.tagline;
    if (args.description !== undefined) updateObj.description = args.description;
    if (args.theme !== undefined) updateObj.theme = args.theme;
    if (args.contact !== undefined) updateObj.contact = args.contact;
    if (args.favicon !== undefined) updateObj.favicon = args.favicon;
    if (args.logo !== undefined) updateObj.logo = args.logo;
    
    // Handle explicit logo deletion
    if (args.clearLogo) {
      updateObj.logo = undefined;
    }

    if (existingSettings) {
      // Update existing record
      await ctx.db.patch(existingSettings._id, updateObj);
      console.log("✅ Updated settings:", { storeTitle: args.storeTitle, tagline: args.tagline, hasLogo: !!args.logo });
      return existingSettings._id;
    } else {
      // Create new record with defaults
      const newRecord = {
        storeName: args.storeName || "DUBAI BORKA HOUSE",
        storeTitle: args.storeTitle || "DUBAI BORKA HOUSE",
        tagline: args.tagline || "",
        description: args.description || "",
        logo: args.logo,
        favicon: args.favicon,
        theme: args.theme,
        contact: args.contact,
        lastUpdated: Date.now(),
        updatedBy: userId,
      };
      const id = await ctx.db.insert("storeSettings", newRecord);
      console.log("✅ Created new settings:", { storeTitle: args.storeTitle, tagline: args.tagline });
      return id;
    }
  },
});
