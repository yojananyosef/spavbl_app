import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema Definition
 * Formats data for reactive real-time database storage.
 * Designed for user-level synchronization of notes, highlights, and history.
 */
export default defineSchema({
	// User notes table
	notes: defineTable({
		userId: v.string(), // Unique user identifier
		bookId: v.string(), // Book identifier (e.g., "1CO")
		chapter: v.number(), // Chapter number
		verse: v.number(), // Verse number
		content: v.string(), // Note markdown/text content
		updatedAt: v.number(), // Unix timestamp
	})
		.index("by_user", ["userId"])
		.index("by_user_book_chapter", ["userId", "bookId", "chapter"]),

	// Verse highlights table
	highlights: defineTable({
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
		verse: v.number(),
		color: v.string(), // HSL or hexadecimal color value
	})
		.index("by_user", ["userId"])
		.index("by_user_verse", ["userId", "bookId", "chapter", "verse"]),

	// Reading history and state table
	readingHistory: defineTable({
		userId: v.string(),
		bookId: v.string(),
		chapter: v.number(),
		timestamp: v.number(),
	}).index("by_user", ["userId"]),
});
