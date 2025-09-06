import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Menu, Location, Category, Taste } from '../types/menu';

interface UseMenusOptions {
  location?: Location;
  category?: Category;
  tastes?: Taste[];
  searchTerm?: string;
}

export function useMenus(options: UseMenusOptions = {}) {
  const queryResult = useQuery({
    queryKey: ['menus', options],
    queryFn: async (): Promise<Menu[]> => {
      console.log('useMenus: Fetching menus with options:', options);
      
      const menusRef = collection(db, 'menus');
      const q = query(menusRef, orderBy('updatedAt', 'desc'));
      
      const snapshot = await getDocs(q);
      let menus = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Menu[];
      
      console.log('useMenus: Found', menus.length, 'menus before filtering');
      console.log('useMenus: Sample menu data:', menus.slice(0, 2));
      
      // Client-side filtering for all filters
      if (options.location) {
        menus = menus.filter(menu => menu.location === options.location);
        console.log('useMenus: After location filter:', menus.length, 'menus');
      }
      
      if (options.category) {
        menus = menus.filter(menu => menu.category === options.category);
        console.log('useMenus: After category filter:', menus.length, 'menus');
      }
      
      if (options.tastes && options.tastes.length > 0) {
        menus = menus.filter(menu => 
          options.tastes!.some(taste => menu.tastes.includes(taste))
        );
        console.log('useMenus: After tastes filter:', menus.length, 'menus');
      }
      
      if (options.searchTerm) {
        const term = options.searchTerm.toLowerCase();
        menus = menus.filter(menu => 
          menu.name.toLowerCase().includes(term) ||
          menu.vendor.toLowerCase().includes(term)
        );
        console.log('useMenus: After search filter:', menus.length, 'menus');
      }
      
      console.log('useMenus: Returning', menus.length, 'menus after all filtering');
      return menus;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...queryResult,
    menus: queryResult.data
  };
}
