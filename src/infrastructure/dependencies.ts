import type { BibleProviderPort, StudyStoragePort } from "../core/ports";
import { LocalBibleAdapter } from "./LocalBibleAdapter";
import { LocalStudyStorageAdapter } from "./LocalStudyStorageAdapter";

/**
 * Dependency Injection Container
 * Declares the concrete implementations for our application's ports.
 * Following SOLID Dependency Inversion, the rest of the application references
 * these instances via their Port interfaces, allowing for easy swapping (e.g., to Convex).
 */
class DependencyContainer {
	private bibleProviderInstance: BibleProviderPort;
	private studyStorageInstance: StudyStoragePort;

	constructor() {
		this.bibleProviderInstance = new LocalBibleAdapter();
		this.studyStorageInstance = new LocalStudyStorageAdapter();
	}

	getBibleProvider(): BibleProviderPort {
		return this.bibleProviderInstance;
	}

	getStudyStorage(): StudyStoragePort {
		return this.studyStorageInstance;
	}

	/**
	 * Swap out the storage provider at runtime (e.g., when the user logs in and enables Convex sync)
	 */
	setStudyStorage(newStorage: StudyStoragePort): void {
		this.studyStorageInstance = newStorage;
	}
}

export const dependencies = new DependencyContainer();
export const bibleProvider = dependencies.getBibleProvider();
export const studyStorage = dependencies.getStudyStorage();
