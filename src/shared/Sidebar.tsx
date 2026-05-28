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
		<aside className="w-80 h-[calc(100vh-4rem)] bg-card/85 backdrop-blur-md border-r border-border overflow-hidden flex flex-col transition-all duration-300 z-10 shrink-0">
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
				<div className="w-1/2 h-full border-r border-border flex flex-col overflow-hidden">
					{/* Aligned Header */}
					<div className="px-3 py-2.5 border-b border-border/40 text-xxs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5 shrink-0 select-none h-10">
						<Compass size={10} />
						Libros
					</div>
					{/* Scrollable Content */}
					<div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5">
						{books.map((book) => {
							const isActive = book.id === activeBookId;
							return (
								<button
									key={book.id}
									onClick={() => changeBook(book.id)}
									className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
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
				<div className="w-1/2 h-full bg-secondary/20 flex flex-col overflow-hidden">
					{/* Aligned Header */}
					<div className="px-3 py-2.5 border-b border-border/40 text-xxs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5 shrink-0 select-none h-10">
						<BookOpen size={10} />
						Capítulos
					</div>
					{/* Scrollable Grid */}
					<div className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
						{activeBook ? (
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
													? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[0.96]"
													: "bg-card text-foreground hover:bg-secondary hover:text-foreground border border-border/50 hover:border-border"
											}`}
										>
											{chapterNum}
										</button>
									);
								})}
							</div>
						) : (
							<div className="h-full flex items-center justify-center text-xs text-muted-foreground/75 text-center p-4 select-none">
								Seleccione un libro
							</div>
						)}
					</div>
				</div>
			</div>
		</aside>
	);
};
export default Sidebar;
