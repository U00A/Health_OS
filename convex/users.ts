import { query } from "./_generated/server";
import { v } from "convex/values";

export const current = query({
  args: { betterAuthId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.betterAuthId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) return null;
    return { ...user, role: user.role || "patient" };
  },
});
