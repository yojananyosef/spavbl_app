import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Highlights APIs
 * Real-time CRUD mutations and reactive queries for highlighted verses.
 */

// Fetch highlights for a specific book and chapter
export const getHighlights = query({
	args: {
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("highlights")
			.withIndex("by_user_verse", (q) =>
				q
					.eq("userId", args.userId)
					.eq("bookId", args.bookId)
					.eq("chapter", args.chapter),
			)
			.collect();
	},
});

// Highlight a verse (create or update highlight color)
export const saveHighlight = mutation({
	args: {
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
		verse: v.number(),
		color: v.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("highlights")
			.withIndex("by_user_verse", (q) =>
				q
					.eq("userId", args.userId)
					.eq("bookId", args.bookId)
					.eq("chapter", args.chapter)
					.eq("verse", args.verse),
			)
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { color: args.color });
		} else {
			await ctx.db.insert("highlights", {
				userId: args.userId,
				bookId: args.bookId,
				chapter: args.chapter,
				verse: args.verse,
				color: args.color,
			});
		}
	},
});

// Remove a highlight
export const deleteHighlight = mutation({
	args: {
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
		verse: v.number(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("highlights")
			.withIndex("by_user_verse", (q) =>
				q
					.eq("userId", args.userId)
					.eq("bookId", args.bookId)
					.eq("chapter", args.chapter)
					.eq("verse", args.verse),
			)
			.unique();

		if (existing) {
			await ctx.db.delete(existing._id);
		}
	},
});
