export interface Footnote {
	id: string;
	mark: string;
	text: string;
}

export interface Verse {
	number: number;
	text: string;
	footnotes?: Footnote[];
}

export interface Chapter {
	chapter: number;
	verses: Verse[];
}

export interface Book {
	id: string; // e.g., "GEN"
	name: string; // e.g., "Génesis"
	chaptersCount: number; // e.g., 50
}

export interface Note {
	id?: string;
	bookId: string;
	chapter: number;
	verse: number;
	content: string;
	updatedAt: number;
}

export interface Highlight {
	id?: string;
	bookId: string;
	chapter: number;
	verse: number;
	color: string; // e.g., "hsl(45, 100%, 50%)" (gold)
}

export interface ReadingHistory {
	bookId: string;
	chapter: number;
	timestamp: number;
}

export interface SearchResult {
	bookId: string;
	bookName: string;
	chapter: number;
	verseNumber: number;
	text: string;
}
