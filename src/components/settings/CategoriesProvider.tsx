'use client';

import { createContext, useContext } from 'react';

export type NavCategory = { id: string; slug: string; name: string };

const Ctx = createContext<NavCategory[]>([]);

export function useNavCategories() {
  return useContext(Ctx);
}

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: NavCategory[];
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={categories}>{children}</Ctx.Provider>;
}
