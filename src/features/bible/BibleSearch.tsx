import { BookOpen, ExternalLink, Search } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchResult } from "../../core/entities";

interface BibleSearchProps {
	searchQuery: string;
	searchResults: SearchResult[];
	isOpen: boolean;
	onClose: () => void;
	onSearch: (query: string) => void;
	onNavigate: (bookId: string, chapterNum: number) => void;
}

/**
 * BibleSearch (Component)
 * Renders the modal search panel for full-text Bible search.
 * Uses Shadcn Dialog and ScrollArea for premium UI/UX, accessibility, and smooth scrolling.
 */
export const BibleSearch: React.FC<BibleSearchProps> = ({
	searchQuery,
	searchResults,
	isOpen,
	onClose,
	onSearch,
	onNavigate,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus search input when opening
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-full max-w-2xl bg-card text-foreground rounded-2xl shadow-2xl border border-border flex flex-col h-[70vh] overflow-hidden bg-card/95 backdrop-blur-md p-0 gap-0">
				{/* Screen reader title */}
				<DialogTitle className="sr-only">Buscar en la Biblia</DialogTitle>

				{/* Search input header */}
				<div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
					<Search className="text-muted-foreground" size={20} />
					<input
						ref={inputRef}
						type="text"
						placeholder="Buscar palabras o frases (ej. gracia, amor)..."
						value={searchQuery}
						onChange={(e) => onSearch(e.target.value)}
						className="flex-1 bg-transparent border-0 outline-none text-base font-medium placeholder:text-muted-foreground/60 focus:ring-0"
					/>
				</div>

				{/* Results Body with custom ScrollArea */}
				<ScrollArea className="flex-1 p-4">
					{searchQuery.trim().length < 2 ? (
						<div className="h-[40vh] flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground/80">
							<Search size={32} className="opacity-40 mb-1" />
							<p className="text-sm font-semibold">
								Búsqueda rápida en toda la Biblia
							</p>
							<p className="text-xs max-w-xs text-muted-foreground/60 leading-normal">
								Escriba dos o más caracteres para buscar concordancias y
								versículos al instante.
							</p>
						</div>
					) : searchResults.length === 0 ? (
						<div className="h-[40vh] flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground/80">
							<BookOpen
								size={32}
								className="opacity-40 mb-1 text-destructive"
							/>
							<p className="text-sm font-semibold">
								Sin resultados encontrados
							</p>
							<p className="text-xs max-w-xs text-muted-foreground/60 leading-normal">
								No pudimos encontrar coincidencias para "{searchQuery}". Pruebe
								con términos más cortos o sinónimos.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-2 pb-6">
							<div className="text-xxs font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">
								Concordancias encontradas ({searchResults.length})
							</div>
							{searchResults.map((result, idx) => (
								<button
									key={`${result.bookId}-${result.chapter}-${result.verseNumber}-${idx}`}
									onClick={() => {
										onNavigate(result.bookId, result.chapter);
										onClose();
									}}
									className="w-full text-left p-3.5 rounded-xl hover:bg-secondary border border-border/40 hover:border-border transition-all duration-200 group flex items-start gap-3"
								>
									{/* Icon */}
									<div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
										<BookOpen size={16} />
									</div>
									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between gap-2 mb-1">
											<span className="font-semibold text-sm leading-none text-foreground group-hover:text-primary transition-all">
												{result.bookName} {result.chapter}:{result.verseNumber}
											</span>
											<span className="text-xxs font-bold bg-secondary group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-all">
												Leer <ExternalLink size={8} />
											</span>
										</div>
										<p className="text-xs text-muted-foreground/90 font-serif leading-relaxed line-clamp-2">
											{result.text}
										</p>
									</div>
								</button>
							))}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};
export default BibleSearch;
