import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Notes APIs
 * Real-time CRUD mutations and reactive queries for Bible study notes.
 */

// Fetch notes for a specific user, book, and chapter
export const getNotes = query({
	args: {
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_user_book_chapter", (q) =>
				q
					.eq("userId", args.userId)
					.eq("bookId", args.bookId)
					.eq("chapter", args.chapter),
			)
			.collect();
	},
});

// Save or update a note
export const saveNote = mutation({
	args: {
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
		verse: v.number(),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		// Check if a note already exists for this verse
		const existing = await ctx.db
			.query("notes")
			.withIndex("by_user_book_chapter", (q) =>
				q
					.eq("userId", args.userId)
					.eq("bookId", args.bookId)
					.eq("chapter", args.chapter),
			)
			.filter((q) => q.eq(q.field("verse"), args.verse))
			.unique();

		if (existing) {
			// Update note content
			await ctx.db.patch(existing._id, {
				content: args.content,
				updatedAt: Date.now(),
			});
		} else {
			// Create new note
			await ctx.db.insert("notes", {
				userId: args.userId,
				bookId: args.bookId,
				chapter: args.chapter,
				verse: args.verse,
				content: args.content,
				updatedAt: Date.now(),
			});
		}
	},
});

// Delete a note
export const deleteNote = mutation({
	args: {
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
		verse: v.number(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("notes")
			.withIndex("by_user_book_chapter", (q) =>
				q
					.eq("userId", args.userId)
					.eq("bookId", args.bookId)
					.eq("chapter", args.chapter),
			)
			.filter((q) => q.eq(q.field("verse"), args.verse))
			.unique();

		if (existing) {
			await ctx.db.delete(existing._id);
		}
	},
});
