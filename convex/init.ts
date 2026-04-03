import { mutation } from "./_generated/server";
import { TableNames } from "./_generated/dataModel";

/**
 * Nuclear reset: wipes ALL auth-related tables so you can re-register from scratch.
 * Run via: npx convex run init:resetAuth
 */
export const resetAuth = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "authAccounts",
      "authSessions",
      "authRefreshTokens",
      "authVerificationCodes",
      "authVerifiers",
      "authRateLimits",
      "users",
    ] as const;

    let totalDeleted = 0;
    for (const table of tables) {
      try {
        const docs = await ctx.db.query(table as TableNames).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
      } catch {
        // Table might not exist yet, skip
      }
    }
    return { deleted: totalDeleted, message: "All auth state cleared. Register fresh at /login" };
  },
});
