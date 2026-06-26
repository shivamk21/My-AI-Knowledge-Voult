export type Category = { id: string; name: string; colorCode?: string | null };
export type Tag = { id: string; name: string };

export type Note = {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt?: string | null;
};

export type SavedLink = {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  sourceType?: string | null;
  sourceCategory?: string | null;
  isImportant: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt?: string | null;
};

export type NoteInput = {
  title: string;
  content: string;
  categoryId?: string | null;
  tagIds: string[];
  isImportant: boolean;
};

export type LinkInput = {
  url: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  tagIds: string[];
  isImportant: boolean;
};

export type SearchFilters = {
  keyword?: string;
  categoryId?: string;
  tagId?: string;
  isImportant?: boolean;
};

export type SearchResult = { notes: Note[]; links: SavedLink[] };

export type ImportedLinkSourceType = 'Bookmark HTML' | 'Text File';

export type ImportedLink = {
  id: string;
  url: string;
  title: string;
  description: string;
  sourceType: ImportedLinkSourceType;
  category?: string;
};

export type BulkLinkImportItem = {
  url: string;
  title: string;
  description?: string | null;
  sourceType?: string | null;
  sourceCategory?: string | null;
  allowDuplicate: boolean;
};

export type BulkLinkImportResult = {
  requestedCount: number;
  createdCount: number;
  duplicateCount: number;
  failedCount: number;
  createdLinks: SavedLink[];
  issues: { url: string; reason: string }[];
};
