import {
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Highlighter,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
	setSelectedVerse,
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
	};

	const handleSaveNoteClick = () => {
		if (selectedVerse !== null) {
			saveNote(selectedVerse, noteText);
		}
	};

	if (isLoading) {
		return (
			<div className="flex-1 overflow-y-auto px-8 py-10 max-w-3xl mx-auto w-full space-y-6 select-none h-[calc(100vh-4rem)]">
				<div className="space-y-3">
					<Skeleton className="h-8 w-48 rounded-lg" />
					<Skeleton className="h-4 w-32 rounded-lg" />
				</div>
				<div className="space-y-4 pt-6">
					<Skeleton className="h-6 w-full rounded-md" />
					<Skeleton className="h-6 w-[96%] rounded-md" />
					<Skeleton className="h-6 w-[93%] rounded-md" />
					<Skeleton className="h-6 w-[88%] rounded-md" />
				</div>
				<div className="space-y-4 pt-6">
					<Skeleton className="h-6 w-full rounded-md" />
					<Skeleton className="h-6 w-[95%] rounded-md" />
					<Skeleton className="h-6 w-[91%] rounded-md" />
				</div>
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
		<div className="flex-1 h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-background animate-accordion-down">
			{/* 1. Chapter Title Header */}
			<div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-card/85 backdrop-blur-md">
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

									{/* Footnotes references with inline Popover */}
									{verse.footnotes?.map((fn) => (
										<Popover key={fn.id}>
											<PopoverTrigger asChild>
												<button
													className="text-primary hover:text-primary mx-0.5 font-sans font-bold hover:bg-primary/10 rounded px-0.5 text-xs select-none cursor-pointer"
													onClick={(e) => e.stopPropagation()}
												>
													{fn.mark}
												</button>
											</PopoverTrigger>
											<PopoverContent
												className="w-80 bg-card border border-border shadow-lg z-50 p-4 rounded-xl text-xs md:text-sm text-muted-foreground leading-normal font-sans"
												onClick={(e) => e.stopPropagation()}
											>
												<div className="flex items-center gap-1.5 mb-1.5 text-xxs font-bold uppercase tracking-wider text-primary">
													<BookOpen size={10} /> Nota al Pie ({fn.mark})
												</div>
												{fn.text}
											</PopoverContent>
										</Popover>
									))}

									{/* Notes indicators */}
									{hasNote && (
										<span className="inline-flex items-center align-middle ml-1 p-0.5 rounded bg-secondary text-primary select-none animate-pulse">
											<BookOpen size={10} />
										</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			</div>

			{/* 3. Contextual Verse Action Drawer (Floating at the bottom) */}
			{selectedVerse !== null && (
				<div className="absolute bottom-6 left-6 right-6 max-w-2xl mx-auto bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl z-30 p-4 flex flex-col md:flex-row gap-4 justify-between animate-accordion-down">
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
						<Textarea
							className="w-full h-16 bg-secondary/30 border border-border/40 rounded-xl p-2 text-xs font-medium outline-none focus:border-primary/80 focus:bg-secondary/10 resize-none transition-all placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
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
						<h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 px-1">
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
