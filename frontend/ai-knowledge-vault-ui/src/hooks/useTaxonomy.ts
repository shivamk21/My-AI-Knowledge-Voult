import { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';
import type { Category, Tag } from '../types';

export function useTaxonomy() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  async function reload() {
    const [categoryItems, tagItems] = await Promise.all([categoryService.getAll(), tagService.getAll()]);
    setCategories(categoryItems);
    setTags(tagItems);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  return { categories, tags, reload };
}
