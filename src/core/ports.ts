import type {
	Book,
	Chapter,
	Highlight,
	Note,
	ReadingHistory,
	SearchResult,
} from "./entities";

/**
 * BibleProviderPort (Port)
 * Defines the contract for fetching Bible translations, books, and chapters.
 * Adheres to Dependency Inversion (SOLID DIP): business logic depends on this abstraction,
 * not on the concrete filesystem or network operations.
 */
export interface BibleProviderPort {
	/**
	 * Retrieves the list of all books in the Bible.
	 */
	getBooks(): Promise<Book[]>;

	/**
	 * Retrieves the details of a specific chapter, including its verses and footnotes.
	 */
	getChapter(bookId: string, chapter: number): Promise<Chapter>;

	/**
	 * Performs an instant full-text search across all books and chapters.
	 */
	search(query: string): Promise<SearchResult[]>;
}

/**
 * StudyStoragePort (Port)
 * Defines the contract for storing user study assets (notes, highlights, and history).
 * Can be implemented locally (offline-first via IndexedDB/LocalStorage) or remotely (Convex Cloud Sync).
 */
export interface StudyStoragePort {
	getNotes(bookId: string, chapter: number): Promise<Note[]>;
	saveNote(note: Note): Promise<void>;
	deleteNote(bookId: string, chapter: number, verse: number): Promise<void>;

	getHighlights(bookId: string, chapter: number): Promise<Highlight[]>;
	saveHighlight(highlight: Highlight): Promise<void>;
	deleteHighlight(
		bookId: string,
		chapter: number,
		verse: number,
	): Promise<void>;

	getReadingHistory(): Promise<ReadingHistory | null>;
	saveReadingHistory(history: ReadingHistory): Promise<void>;
}
