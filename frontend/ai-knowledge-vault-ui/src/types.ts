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
