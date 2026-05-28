import { BookOpen, Menu, Moon, Search, Sun } from "lucide-react";
import type React from "react";
import { BibleReader } from "./features/bible/BibleReader";
import { BibleSearch } from "./features/bible/BibleSearch";
import { useBible } from "./features/bible/useBible";
import { Sidebar } from "./shared/Sidebar";

/**
 * App (Main Dashboard Shell)
 * Assembles the screaming features of the Bible application.
 * Manages responsive routing, global theme configurations, and structural layouts.
 */
export const App: React.FC = () => {
	const {
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
		setSelectedVerse,

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
	} = useBible();

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
			{/* 1. Global Header Bar */}
			<header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card/85 backdrop-blur-md z-20">
				<div className="flex items-center gap-3">
					{/* Sidebar Toggle */}
					<button
						onClick={toggleSidebar}
						className="p-2 rounded-lg hover:bg-secondary border border-border/40 hover:border-border transition-all text-foreground/80 hover:text-foreground active:scale-95"
						title={
							isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"
						}
					>
						<Menu size={20} />
					</button>

					{/* Logo & Title */}
					<div className="flex items-center gap-2 select-none">
						<div className="p-1.5 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center">
							<BookOpen size={16} />
						</div>
						<span className="font-bold text-base tracking-tight font-sans hidden sm:inline">
							VBL Digital
						</span>
					</div>
				</div>

				{/* Action Controls */}
				<div className="flex items-center gap-2">
					{/* Search Trigger */}
					<button
						onClick={() => setIsSearchOpen(true)}
						className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 hover:border-border text-sm font-semibold transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground select-none cursor-pointer"
					>
						<Search size={16} />
						<span className="hidden md:inline">Buscar en la Biblia...</span>
					</button>

					{/* Theme Toggle */}
					<button
						onClick={toggleDarkMode}
						className="p-2.5 rounded-xl hover:bg-secondary border border-border/40 hover:border-border transition-all text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
						title={isDarkMode ? "Activar Modo Claro" : "Activar Modo Oscuro"}
					>
						{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
					</button>
				</div>
			</header>

			{/* 2. Main Layout (Sidebar + Reader) */}
			<div className="flex-1 flex overflow-hidden">
				{/* Sidebar Navigation */}
				<Sidebar
					books={books}
					activeBookId={activeBookId}
					activeChapterNum={activeChapterNum}
					isSidebarOpen={isSidebarOpen}
					changeBook={changeBook}
					changeChapter={changeChapter}
				/>

				{/* Bible Reader panel */}
				<BibleReader
					chapter={chapter}
					activeBookName={activeBookName}
					activeChapterNum={activeChapterNum}
					isLoading={isLoading}
					notes={notes}
					highlights={highlights}
					selectedVerse={selectedVerse}
					setSelectedVerse={setSelectedVerse}
					nextChapter={nextChapter}
					prevChapter={prevChapter}
					addHighlight={addHighlight}
					removeHighlight={removeHighlight}
					saveNote={saveNote}
				/>
			</div>

			{/* 3. Search Overlay Modal */}
			<BibleSearch
				searchQuery={searchQuery}
				searchResults={searchResults}
				isOpen={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
				onSearch={performSearch}
				onNavigate={changeBook}
			/>
		</div>
	);
};

export default App;
