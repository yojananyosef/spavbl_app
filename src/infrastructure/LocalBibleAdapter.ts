import type { Book, Chapter, SearchResult } from "../core/entities";
import type { BibleProviderPort } from "../core/ports";

/**
 * BookData (Interface)
 * Represents the complete structure of a Bible book JSON file.
 */
interface BookData {
	id: string;
	name: string;
	chapters: Chapter[];
}

/**
 * Simple IndexedDB Cache Manager
 * A zero-dependency local cache store utilizing IndexedDB.
 * Minimizes network requests and memory overhead by persisting book chunks locally.
 */
class IndexedDBCache {
	private dbName = "spavbl_bible_cache_v2";
	private storeName = "books";
	private db: IDBDatabase | null = null;

	async init(): Promise<void> {
		// Clean up old cached database to release storage
		try {
			indexedDB.deleteDatabase("spavbl_bible_cache");
		} catch {
			// Silently fail if cleanup fails
		}

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName);
				}
			};
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};
			request.onerror = () => reject(request.error);
		});
	}

	async get<T>(key: string): Promise<T | null> {
		if (!this.db) await this.init();
		return new Promise((resolve) => {
			if (!this.db) return resolve(null);
			const transaction = this.db.transaction(this.storeName, "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.get(key);
			request.onsuccess = () => resolve((request.result as T) || null);
			request.onerror = () => resolve(null);
		});
	}

	async set<T>(key: string, value: T): Promise<void> {
		if (!this.db) await this.init();
		return new Promise((resolve) => {
			if (!this.db) return resolve();
			const transaction = this.db.transaction(this.storeName, "readwrite");
			const store = transaction.objectStore(this.storeName);
			store.put(value, key);
			transaction.oncomplete = () => resolve();
		});
	}
}

/**
 * LocalBibleAdapter (Adapter)
 * Implements BibleProviderPort by dynamically loading individual books.
 * Utilizes a 2-tier loading cache (In-memory Map + IndexedDB persistent cache).
 * Optimizes initial load times by fetching tiny chunks (eg. 150KB for Genesis instead of 6.1MB).
 */
export class LocalBibleAdapter implements BibleProviderPort {
	private memoryCache = new Map<string, BookData>();
	private dbCache = new IndexedDBCache();
	private booksMetadata: Book[] | null = null;
	private metadataPromise: Promise<Book[]> | null = null;

	constructor() {
		this.dbCache
			.init()
			.catch((err) =>
				console.warn(
					"IndexedDB cache failed to initialize, running memory-only:",
					err,
				),
			);
	}

	/**
	 * Retrieves the list of all books from books.json (only 3.6KB!).
	 */
	async getBooks(): Promise<Book[]> {
		if (this.booksMetadata) return this.booksMetadata;
		if (this.metadataPromise) return this.metadataPromise;

		this.metadataPromise = this.dbCache
			.get<Book[]>("metadata")
			.then(async (cached) => {
				if (cached) {
					this.booksMetadata = cached;
					return cached;
				}

				// Fetch from public folder if not cached
				const response = await fetch("/bible/books.json");
				if (!response.ok)
					throw new Error("Failed to fetch books metadata index.");

				const data = (await response.json()) as {
					id: string;
					name: string;
					chaptersCount: number;
				}[];

				const mappedBooks = data.map((b) => ({
					id: b.id,
					name: b.name,
					chaptersCount: b.chaptersCount,
				}));

				await this.dbCache.set("metadata", mappedBooks);
				this.booksMetadata = mappedBooks;
				return mappedBooks;
			});

		return this.metadataPromise;
	}

	/**
	 * Lazy-loads an individual book file from public/bible/{bookId}.json.
	 * Leverages Memory cache -> IndexedDB cache -> HTTP Fetch.
	 */
	private async loadBook(bookId: string): Promise<BookData> {
		const uppercaseId = bookId.toUpperCase();

		// 1. Memory Cache
		if (this.memoryCache.has(uppercaseId)) {
			return this.memoryCache.get(uppercaseId) as BookData;
		}

		// 2. IndexedDB Cache
		const cached = await this.dbCache.get<BookData>(`book_${uppercaseId}`);
		if (cached) {
			this.memoryCache.set(uppercaseId, cached);
			return cached;
		}

		// 3. HTTP Fetch (Lazy-load 2KB to 290KB file!)
		const response = await fetch(`/bible/${uppercaseId}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load book data for "${uppercaseId}"`);
		}
		const data = (await response.json()) as BookData;

		// Save in caches
		this.memoryCache.set(uppercaseId, data);
		await this.dbCache.set(`book_${uppercaseId}`, data);

		return data;
	}

	async getChapter(bookId: string, chapterNumber: number): Promise<Chapter> {
		const bookData = await this.loadBook(bookId);
		const chapter = bookData.chapters.find((c) => c.chapter === chapterNumber);

		if (!chapter) {
			throw new Error(
				`Chapter ${chapterNumber} of Book "${bookData.name}" not found.`,
			);
		}

		return chapter;
	}

	/**
	 * Performs client-side search across all currently cached books.
	 * Note: In production full-stack, this would query Convex vector/full-text search.
	 */
	async search(query: string): Promise<SearchResult[]> {
		const results: SearchResult[] = [];
		const normalizedQuery = query.toLowerCase().trim();
		if (normalizedQuery.length < 2) return results;

		// Search across currently loaded memory cache books
		for (const [bookId, bookData] of this.memoryCache.entries()) {
			for (const chapter of bookData.chapters) {
				for (const verse of chapter.verses) {
					if (verse.text.toLowerCase().includes(normalizedQuery)) {
						results.push({
							bookId: bookId,
							bookName: bookData.name,
							chapter: chapter.chapter,
							verseNumber: verse.number,
							text: verse.text,
						});
						if (results.length >= 100) return results;
					}
				}
			}
		}
		return results;
	}
}
