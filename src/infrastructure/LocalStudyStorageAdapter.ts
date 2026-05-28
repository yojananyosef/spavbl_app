import type { Highlight, Note, ReadingHistory } from "../core/entities";
import type { StudyStoragePort } from "../core/ports";

/**
 * LocalStudyStorageAdapter (Adapter)
 * Implements StudyStoragePort using the browser's localStorage.
 * Provides instant read/write capabilities for notes, highlights, and history
 * without requiring any cloud server or network connectivity.
 */
export class LocalStudyStorageAdapter implements StudyStoragePort {
	private notesKey = "spavbl_notes";
	private highlightsKey = "spavbl_highlights";
	private historyKey = "spavbl_reading_history";

	private getItems<T>(key: string): T[] {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : [];
	}

	private saveItems<T>(key: string, items: T[]): void {
		localStorage.setItem(key, JSON.stringify(items));
	}

	async getNotes(bookId: string, chapter: number): Promise<Note[]> {
		const all = this.getItems<Note>(this.notesKey);
		return all.filter((n) => n.bookId === bookId && n.chapter === chapter);
	}

	async saveNote(note: Note): Promise<void> {
		const all = this.getItems<Note>(this.notesKey);
		const existingIndex = all.findIndex(
			(n) =>
				n.bookId === note.bookId &&
				n.chapter === note.chapter &&
				n.verse === note.verse,
		);

		const updatedNote = { ...note, updatedAt: Date.now() };

		if (existingIndex >= 0) {
			all[existingIndex] = updatedNote;
		} else {
			all.push(updatedNote);
		}
		this.saveItems(this.notesKey, all);
	}

	async deleteNote(
		bookId: string,
		chapter: number,
		verse: number,
	): Promise<void> {
		const all = this.getItems<Note>(this.notesKey);
		const filtered = all.filter(
			(n) =>
				!(n.bookId === bookId && n.chapter === chapter && n.verse === verse),
		);
		this.saveItems(this.notesKey, filtered);
	}

	async getHighlights(bookId: string, chapter: number): Promise<Highlight[]> {
		const all = this.getItems<Highlight>(this.highlightsKey);
		return all.filter((h) => h.bookId === bookId && h.chapter === chapter);
	}

	async saveHighlight(highlight: Highlight): Promise<void> {
		const all = this.getItems<Highlight>(this.highlightsKey);
		const existingIndex = all.findIndex(
			(h) =>
				h.bookId === highlight.bookId &&
				h.chapter === highlight.chapter &&
				h.verse === highlight.verse,
		);

		if (existingIndex >= 0) {
			all[existingIndex] = highlight;
		} else {
			all.push(highlight);
		}
		this.saveItems(this.highlightsKey, all);
	}

	async deleteHighlight(
		bookId: string,
		chapter: number,
		verse: number,
	): Promise<void> {
		const all = this.getItems<Highlight>(this.highlightsKey);
		const filtered = all.filter(
			(h) =>
				!(h.bookId === bookId && h.chapter === chapter && h.verse === verse),
		);
		this.saveItems(this.highlightsKey, filtered);
	}

	async getReadingHistory(): Promise<ReadingHistory | null> {
		const data = localStorage.getItem(this.historyKey);
		return data ? JSON.parse(data) : null;
	}

	async saveReadingHistory(history: ReadingHistory): Promise<void> {
		localStorage.setItem(this.historyKey, JSON.stringify(history));
	}
}
