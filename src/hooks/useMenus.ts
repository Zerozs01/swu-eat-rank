import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Menu, Location, Category, Taste } from '../types/menu';

interface UseMenusOptions {
  location?: Location;
  category?: Category;
  tastes?: Taste[];
  searchTerm?: string;
}

export function useMenus(options: UseMenusOptions = {}) {
  return useQuery({
    queryKey: ['menus', options],
    queryFn: async (): Promise<Menu[]> => {
      console.log('useMenus: Fetching menus with options:', options);
      
      const menusRef = collection(db, 'menus');
      let q = query(menusRef, orderBy('updatedAt', 'desc'));
      
      // Apply filters
      if (options.location) {
        q = query(q, where('location', '==', options.location));
      }
      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }
      
      const snapshot = await getDocs(q);
      let menus = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Menu[];
      
      console.log('useMenus: Found', menus.length, 'menus');
      
      // Client-side filtering for tastes and search
      if (options.tastes && options.tastes.length > 0) {
        menus = menus.filter(menu => 
          options.tastes!.some(taste => menu.tastes.includes(taste))
        );
      }
      
      if (options.searchTerm) {
        const term = options.searchTerm.toLowerCase();
        menus = menus.filter(menu => 
          menu.name.toLowerCase().includes(term) ||
          menu.vendor.toLowerCase().includes(term)
        );
      }
      
      console.log('useMenus: Returning', menus.length, 'menus after filtering');
      return menus;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
