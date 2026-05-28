import { BookOpen, ChevronRight, Compass } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import type { Book } from "../core/entities";

interface SidebarProps {
	books: Book[];
	activeBookId: string;
	activeChapterNum: number;
	isSidebarOpen: boolean;
	changeBook: (bookId: string) => void;
	changeChapter: (chapterNum: number) => void;
}

/**
 * Sidebar (Component)
 * Renders the Bible book list navigation drawer.
 * Adheres to SOLID Single Responsibility by focusing solely on rendering navigation.
 */
export const Sidebar: React.FC<SidebarProps> = ({
	books,
	activeBookId,
	activeChapterNum,
	isSidebarOpen,
	changeBook,
	changeChapter,
}) => {
	const activeBook = useMemo(() => {
		return books.find((b) => b.id === activeBookId);
	}, [books, activeBookId]);

	if (!isSidebarOpen) return null;

	return (
		<aside className="w-80 h-[calc(100vh-4rem)] glass-panel border-r border-border overflow-hidden flex flex-col transition-all duration-300 z-10 shrink-0">
			{/* Title Header */}
			<div className="p-4 border-b border-border flex items-center gap-3">
				<div className="p-2 rounded-lg bg-primary/10 text-primary">
					<BookOpen size={20} />
				</div>
				<div>
					<h2 className="font-semibold text-lg leading-tight tracking-tight">
						Versión Biblia Libre
					</h2>
					<p className="text-xs text-muted-foreground font-medium">
						Jonathan Gallagher y Shelly Barrios
					</p>
				</div>
			</div>

			{/* Book & Chapter Nav Containers */}
			<div className="flex-1 flex overflow-hidden">
				{/* Books List (Left column in sidebar) */}
				<div className="w-1/2 overflow-y-auto border-r border-border no-scrollbar">
					<div className="p-2 text-xxs font-bold uppercase tracking-wider text-muted-foreground/60 px-3 py-2 flex items-center gap-1.5">
						<Compass size={10} />
						Libros
					</div>
					<div className="flex flex-col gap-0.5 p-1">
						{books.map((book) => {
							const isActive = book.id === activeBookId;
							return (
								<button
									key={book.id}
									onClick={() => changeBook(book.id)}
									className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
										isActive
											? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[0.98]"
											: "hover:bg-secondary text-foreground/80 hover:text-foreground"
									}`}
								>
									<span className="truncate">{book.name}</span>
									{isActive && (
										<ChevronRight size={14} className="opacity-80" />
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Chapters Grid (Right column in sidebar) */}
				<div className="w-1/2 overflow-y-auto bg-secondary/20 p-2">
					{activeBook ? (
						<div className="flex flex-col">
							<div className="text-xxs font-bold uppercase tracking-wider text-muted-foreground/60 px-2 py-1 mb-2">
								Capítulos
							</div>
							<div className="grid grid-cols-3 gap-1.5">
								{Array.from(
									{ length: activeBook.chaptersCount },
									(_, i) => i + 1,
								).map((chapterNum) => {
									const isActive = chapterNum === activeChapterNum;
									return (
										<button
											key={chapterNum}
											onClick={() => changeChapter(chapterNum)}
											className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
												isActive
													? "bg-accent text-accent-foreground shadow-sm shadow-accent/20 scale-[0.96]"
													: "bg-card text-foreground hover:bg-secondary hover:text-foreground border border-border/50 hover:border-border"
											}`}
										>
											{chapterNum}
										</button>
									);
								})}
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center text-xs text-muted-foreground/75 text-center p-4">
							Seleccione un libro
						</div>
					)}
				</div>
			</div>
		</aside>
	);
};
export default Sidebar;
