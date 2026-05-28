import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Highlighter,
	MessageSquare,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { Chapter, Footnote, Highlight, Note } from "../../core/entities";

interface BibleReaderProps {
	chapter: Chapter | null;
	activeBookName: string;
	activeChapterNum: number;
	isLoading: boolean;
	notes: Note[];
	highlights: Highlight[];
	selectedVerse: number | null;
	activeFootnote: Footnote | null;
	setSelectedVerse: (verse: number | null) => void;
	setActiveFootnote: (footnote: Footnote | null) => void;
	nextChapter: () => void;
	prevChapter: () => void;
	addHighlight: (verse: number, color: string) => void;
	removeHighlight: (verse: number) => void;
	saveNote: (verse: number, content: string) => void;
}

const HIGHLIGHT_COLORS = [
	{ name: "Oro", value: "rgba(246, 173, 85, 0.4)", text: "hsl(35, 90%, 50%)" },
	{
		name: "Menta",
		value: "rgba(104, 211, 145, 0.4)",
		text: "hsl(141, 50%, 40%)",
	},
	{
		name: "Celeste",
		value: "rgba(99, 179, 237, 0.4)",
		text: "hsl(203, 70%, 45%)",
	},
	{
		name: "Coral",
		value: "rgba(252, 129, 129, 0.4)",
		text: "hsl(0, 80%, 60%)",
	},
];

/**
 * BibleReader (Component)
 * The main scripture reader interface. Displays verses dynamically, supports
 * clickable popups for footnotes, highlight integrations, and study note editors.
 */
export const BibleReader: React.FC<BibleReaderProps> = ({
	chapter,
	activeBookName,
	activeChapterNum,
	isLoading,
	notes,
	highlights,
	selectedVerse,
	activeFootnote,
	setSelectedVerse,
	setActiveFootnote,
	nextChapter,
	prevChapter,
	addHighlight,
	removeHighlight,
	saveNote,
}) => {
	const [noteText, setNoteText] = useState("");

	// Map highlights and notes for quick O(1) rendering checks
	const highlightsMap = useMemo(() => {
		const map = new Map<number, string>();
		for (const h of highlights) {
			map.set(h.verse, h.color);
		}
		return map;
	}, [highlights]);

	const notesMap = useMemo(() => {
		const map = new Map<number, string>();
		for (const n of notes) {
			map.set(n.verse, n.content);
		}
		return map;
	}, [notes]);

	// Load note text into state when a verse is selected
	const handleVerseClick = (verseNumber: number) => {
		if (selectedVerse === verseNumber) {
			setSelectedVerse(null);
		} else {
			setSelectedVerse(verseNumber);
			setNoteText(notesMap.get(verseNumber) || "");
		}
		setActiveFootnote(null);
	};

	const handleSaveNoteClick = () => {
		if (selectedVerse !== null) {
			saveNote(selectedVerse, noteText);
		}
	};

	if (isLoading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-background">
				<div className="relative w-12 h-12">
					<div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
					<div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
				</div>
				<p className="mt-4 text-sm font-semibold text-muted-foreground/80">
					Cargando escrituras...
				</p>
			</div>
		);
	}

	if (!chapter) {
		return (
			<div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground">
				No se pudo cargar el capítulo. Seleccione un libro en la barra lateral.
			</div>
		);
	}

	return (
		<div className="flex-1 h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-background">
			{/* 1. Chapter Title Header */}
			<div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 glass-panel">
				<div className="flex items-center gap-2">
					<button
						onClick={prevChapter}
						className="p-1.5 rounded-lg hover:bg-secondary border border-border/40 hover:border-border transition-all"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						onClick={nextChapter}
						className="p-1.5 rounded-lg hover:bg-secondary border border-border/40 hover:border-border transition-all"
					>
						<ChevronRight size={18} />
					</button>
				</div>
				<h1 className="text-xl font-bold tracking-tight text-center font-sans">
					{activeBookName}{" "}
					<span className="text-primary font-semibold">{activeChapterNum}</span>
				</h1>
				<div className="w-16"></div> {/* Spacer for balancing title */}
			</div>

			{/* 2. Main Bible Reading Text Body */}
			<div className="flex-1 overflow-y-auto px-8 py-10 max-w-3xl mx-auto w-full no-scrollbar select-text pb-40">
				<div className="font-serif text-lg md:text-xl leading-loose tracking-wide text-foreground/90 space-y-6 text-justify">
					{/* Chapter number block styling */}
					<div className="chapter-body">
						{chapter.verses.map((verse) => {
							const highlightColor = highlightsMap.get(verse.number);
							const hasNote = notesMap.has(verse.number);
							const isSelected = selectedVerse === verse.number;

							return (
								<span
									key={verse.number}
									role="button"
									tabIndex={0}
									className={`relative inline mr-2 transition-all duration-300 rounded px-1 py-0.5 cursor-pointer hover:bg-secondary/40 ${
										isSelected ? "ring-2 ring-primary bg-primary/5" : ""
									}`}
									style={{ backgroundColor: highlightColor || undefined }}
									onClick={() => handleVerseClick(verse.number)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleVerseClick(verse.number);
										}
									}}
								>
									{/* Verse Number Identifier */}
									<sup className="text-xs font-semibold text-primary/80 mr-1 select-none font-sans">
										{verse.number}
									</sup>

									{/* Verse text content */}
									{verse.text}

									{/* Footnotes references */}
									{verse.footnotes?.map((fn) => (
										<button
											key={fn.id}
											onClick={(e) => {
												e.stopPropagation();
												setActiveFootnote(fn);
												setSelectedVerse(null);
											}}
											className="text-accent hover:text-accent-foreground mx-0.5 font-sans font-bold hover:bg-accent/10 rounded px-0.5 text-xs select-none"
										>
											{fn.mark}
										</button>
									))}

									{/* Notes indicators */}
									{hasNote && (
										<span className="inline-flex items-center align-middle ml-1 p-0.5 rounded bg-secondary text-primary select-none animate-pulse">
											<MessageSquare size={10} />
										</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			</div>

			{/* 3. Footnote overlay display panel */}
			{activeFootnote && (
				<div className="absolute bottom-6 left-6 right-6 max-w-xl mx-auto glass-panel p-4 rounded-xl border border-border shadow-lg z-20 flex items-start gap-3 animate-accordion-down">
					<div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
						<BookOpen size={16} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between mb-1.5">
							<span className="font-semibold text-xs uppercase tracking-wider text-accent">
								Nota al Pie ({activeFootnote.mark})
							</span>
							<button
								onClick={() => setActiveFootnote(null)}
								className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
							>
								<X size={12} />
							</button>
						</div>
						<p className="text-xs md:text-sm text-muted-foreground leading-normal font-sans">
							{activeFootnote.text}
						</p>
					</div>
				</div>
			)}

			{/* 4. Contextual Verse Action Drawer (Floating at the bottom) */}
			{selectedVerse !== null && (
				<div className="absolute bottom-6 left-6 right-6 max-w-2xl mx-auto glass-panel rounded-2xl border border-border shadow-2xl z-30 p-4 flex flex-col md:flex-row gap-4 justify-between animate-accordion-down">
					{/* Note Editor Area */}
					<div className="flex-1 flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<h4 className="text-xs font-bold uppercase tracking-wider text-primary">
								Estudiando Versículo {selectedVerse}
							</h4>
							<button
								onClick={() => setSelectedVerse(null)}
								className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
							>
								<X size={14} />
							</button>
						</div>

						{/* Note text field */}
						<textarea
							className="w-full h-16 bg-secondary/30 border border-border/40 rounded-xl p-2 text-xs font-medium outline-none focus:border-primary/80 focus:bg-secondary/10 resize-none transition-all placeholder:text-muted-foreground/60"
							placeholder="Escriba aquí notas de estudio, oraciones o pensamientos personales..."
							value={noteText}
							onChange={(e) => setNoteText(e.target.value)}
						/>
						<div className="flex items-center justify-end gap-2">
							{notesMap.has(selectedVerse) && (
								<button
									onClick={() => saveNote(selectedVerse, "")}
									className="px-2.5 py-1 rounded-lg text-xxs font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-1"
								>
									<Trash2 size={10} /> Eliminar Nota
								</button>
							)}
							<button
								onClick={handleSaveNoteClick}
								className="px-3 py-1 rounded-lg text-xxs font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm shadow-primary/20 transition-all flex items-center gap-1"
							>
								<Plus size={10} /> Guardar Nota
							</button>
						</div>
					</div>

					{/* Highlight Palette Selector (Vertical Divider in larger views) */}
					<div className="w-full md:w-px bg-border/60 self-stretch my-1"></div>

					{/* Highlights Palette */}
					<div className="flex flex-col gap-2 shrink-0 md:w-44">
						<h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1 px-1">
							<Highlighter size={12} /> Resaltado
						</h4>
						<div className="flex gap-1.5 px-1 py-1">
							{HIGHLIGHT_COLORS.map((color) => {
								const isSelected =
									highlightsMap.get(selectedVerse) === color.value;
								return (
									<button
										key={color.name}
										onClick={() => addHighlight(selectedVerse, color.value)}
										style={{
											backgroundColor: color.value,
											border: isSelected
												? `2px solid ${color.text}`
												: "1px solid rgba(0,0,0,0.1)",
										}}
										title={color.name}
										className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
											isSelected ? "scale-105 shadow-md shadow-black/10" : ""
										}`}
									/>
								);
							})}
							{highlightsMap.has(selectedVerse) && (
								<button
									onClick={() => removeHighlight(selectedVerse)}
									className="w-8 h-8 rounded-full border border-border hover:bg-secondary flex items-center justify-center text-destructive transition-all hover:scale-105"
									title="Borrar Resaltado"
								>
									<Trash2 size={14} />
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default BibleReader;
