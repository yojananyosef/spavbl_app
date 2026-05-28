import { useCallback, useEffect, useState } from "react";
import type {
	Book,
	Chapter,
	Footnote,
	Highlight,
	Note,
	SearchResult,
} from "../../core/entities";
import { bibleProvider, studyStorage } from "../../infrastructure/dependencies";

/**
 * useBible (Custom Hook - Feature Domain Controller)
 * Orchestrates all domain operations for Bible reading, searching, highlighting,
 * and note-taking. Implements SOLID Single Responsibility by encapsulating state
 * and coordinating infrastructure adapters through core ports.
 */
export function useBible() {
	// Navigation State
	const [books, setBooks] = useState<Book[]>([]);
	const [activeBookId, setActiveBookId] = useState<string>("GEN");
	const [activeBookName, setActiveBookName] = useState<string>("Génesis");
	const [activeChapterNum, setActiveChapterNum] = useState<number>(1);
	const [chapter, setChapter] = useState<Chapter | null>(null);

	// Study State (Notes & Highlights)
	const [notes, setNotes] = useState<Note[]>([]);
	const [highlights, setHighlights] = useState<Highlight[]>([]);
	const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
	const [activeFootnote, setActiveFootnote] = useState<Footnote | null>(null);

	// Search State
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

	// UI State
	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// 1. Initial Load: Books and Dark Mode Preferences
	useEffect(() => {
		// Load books
		bibleProvider
			.getBooks()
			.then((data) => {
				setBooks(data);
			})
			.catch((err) => console.error("Error loading books:", err));

		// Load Dark Mode Preference
		const savedTheme = localStorage.getItem("spavbl_theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
			setIsDarkMode(true);
			document.documentElement.classList.add("dark");
		} else {
			setIsDarkMode(false);
			document.documentElement.classList.remove("dark");
		}

		// Load last read chapter from history
		studyStorage
			.getReadingHistory()
			.then((history) => {
				if (history) {
					setActiveBookId(history.bookId);
					setActiveChapterNum(history.chapter);
				}
			})
			.catch((err) => console.error("Error loading history:", err));
	}, []);

	// 2. Dynamic Data Fetching: Load active chapter text, highlights, and notes
	const loadChapterData = useCallback(
		async (bookId: string, chapterNum: number) => {
			setIsLoading(true);
			try {
				// 1. Fetch chapter scriptures
				const chapterData = await bibleProvider.getChapter(bookId, chapterNum);
				setChapter(chapterData);

				// 2. Fetch local/synced user study elements
				const chapterNotes = await studyStorage.getNotes(bookId, chapterNum);
				const chapterHighlights = await studyStorage.getHighlights(
					bookId,
					chapterNum,
				);

				setNotes(chapterNotes);
				setHighlights(chapterHighlights);
				setSelectedVerse(null);
				setActiveFootnote(null);

				// 3. Save to reading history
				await studyStorage.saveReadingHistory({
					bookId,
					chapter: chapterNum,
					timestamp: Date.now(),
				});
			} catch (err) {
				console.error("Error loading chapter data:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	// Reload data when book or chapter changes
	useEffect(() => {
		loadChapterData(activeBookId, activeChapterNum);

		const activeBook = books.find((b) => b.id === activeBookId);
		if (activeBook) {
			setActiveBookName(activeBook.name);
		}
	}, [activeBookId, activeChapterNum, books, loadChapterData]);

	// 3. Navigation Controls
	const changeBook = useCallback(
		(bookId: string) => {
			setActiveBookId(bookId);
			setActiveChapterNum(1);
			const book = books.find((b) => b.id === bookId);
			if (book) {
				setActiveBookName(book.name);
			}
		},
		[books],
	);

	const changeChapter = useCallback((chapterNum: number) => {
		setActiveChapterNum(chapterNum);
	}, []);

	const nextChapter = useCallback(() => {
		const activeBook = books.find((b) => b.id === activeBookId);
		if (!activeBook) return;

		if (activeChapterNum < activeBook.chaptersCount) {
			setActiveChapterNum((prev) => prev + 1);
		} else {
			// Go to next book
			const currentBookIndex = books.findIndex((b) => b.id === activeBookId);
			if (currentBookIndex >= 0 && currentBookIndex < books.length - 1) {
				const nextBook = books[currentBookIndex + 1];
				setActiveBookId(nextBook.id);
				setActiveChapterNum(1);
				setActiveBookName(nextBook.name);
			}
		}
	}, [activeBookId, activeChapterNum, books]);

	const prevChapter = useCallback(() => {
		if (activeChapterNum > 1) {
			setActiveChapterNum((prev) => prev - 1);
		} else {
			// Go to previous book's last chapter
			const currentBookIndex = books.findIndex((b) => b.id === activeBookId);
			if (currentBookIndex > 0) {
				const prevBook = books[currentBookIndex - 1];
				setActiveBookId(prevBook.id);
				setActiveChapterNum(prevBook.chaptersCount);
				setActiveBookName(prevBook.name);
			}
		}
	}, [activeBookId, activeChapterNum, books]);

	// 4. Study Modifications (Highlights & Notes Mutations)
	const addHighlight = useCallback(
		async (verse: number, color: string) => {
			const newHighlight = {
				bookId: activeBookId,
				chapter: activeChapterNum,
				verse,
				color,
			};
			await studyStorage.saveHighlight(newHighlight);

			// Refresh highlights state
			const updatedHighlights = await studyStorage.getHighlights(
				activeBookId,
				activeChapterNum,
			);
			setHighlights(updatedHighlights);
			setSelectedVerse(null);
		},
		[activeBookId, activeChapterNum],
	);

	const removeHighlight = useCallback(
		async (verse: number) => {
			await studyStorage.deleteHighlight(activeBookId, activeChapterNum, verse);

			// Refresh highlights state
			const updatedHighlights = await studyStorage.getHighlights(
				activeBookId,
				activeChapterNum,
			);
			setHighlights(updatedHighlights);
			setSelectedVerse(null);
		},
		[activeBookId, activeChapterNum],
	);

	const saveNote = useCallback(
		async (verse: number, content: string) => {
			if (!content.trim()) {
				await studyStorage.deleteNote(activeBookId, activeChapterNum, verse);
			} else {
				const newNote = {
					bookId: activeBookId,
					chapter: activeChapterNum,
					verse,
					content,
					updatedAt: Date.now(),
				};
				await studyStorage.saveNote(newNote);
			}

			// Refresh notes state
			const updatedNotes = await studyStorage.getNotes(
				activeBookId,
				activeChapterNum,
			);
			setNotes(updatedNotes);
			setSelectedVerse(null);
		},
		[activeBookId, activeChapterNum],
	);

	// 5. Search Logic
	const performSearch = useCallback(async (query: string) => {
		setSearchQuery(query);
		if (query.trim().length < 2) {
			setSearchResults([]);
			return;
		}

		try {
			const results = await bibleProvider.search(query);
			setSearchResults(results);
		} catch (err) {
			console.error("Search failed:", err);
		}
	}, []);

	// 6. UI Controls
	const toggleDarkMode = useCallback(() => {
		setIsDarkMode((prev) => {
			const newVal = !prev;
			if (newVal) {
				document.documentElement.classList.add("dark");
				localStorage.setItem("spavbl_theme", "dark");
			} else {
				document.documentElement.classList.remove("dark");
				localStorage.setItem("spavbl_theme", "light");
			}
			return newVal;
		});
	}, []);

	const toggleSidebar = useCallback(() => {
		setIsSidebarOpen((prev) => !prev);
	}, []);

	return {
		// Navigation Data
		books,
		activeBookId,
		activeBookName,
		activeChapterNum,
		chapter,
		isLoading,

		// Study Data
		notes,
		highlights,
		selectedVerse,
		activeFootnote,
		setSelectedVerse,
		setActiveFootnote,

		// Search Data
		searchQuery,
		searchResults,
		isSearchOpen,
		setIsSearchOpen,
		performSearch,

		// UI Configuration
		isSidebarOpen,
		isDarkMode,
		toggleSidebar,
		toggleDarkMode,

		// Navigation Functions
		changeBook,
		changeChapter,
		nextChapter,
		prevChapter,

		// Mutations
		addHighlight,
		removeHighlight,
		saveNote,
	};
}
