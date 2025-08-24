import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Log } from '../types/menu';

interface CreateLogData {
  menuId: string;
  faculty: string;
  visibility: 'public' | 'private';
}

export function useLogs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create log mutation
  const createLog = useMutation({
    mutationFn: async (data: CreateLogData): Promise<Log> => {
      if (!user) throw new Error('User not authenticated');

      const logData = {
        userId: user.uid,
        menuId: data.menuId,
        faculty: data.faculty,
        visibility: data.visibility,
        at: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'logs'), logData);
      return { id: docRef.id, ...logData };
    },
    onSuccess: () => {
      // Invalidate and refetch logs
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['userLogs'] });
    },
  });

  return {
    createLog,
  };
}

// Hook for getting user's logs
export function useUserLogs(limit?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userLogs', user?.uid, limit],
    queryFn: async (): Promise<Log[]> => {
      if (!user) return [];

      const logsRef = collection(db, 'logs');
      let q = query(
        logsRef,
        where('userId', '==', user.uid),
        orderBy('at', 'desc')
      );

      const snapshot = await getDocs(q);
      let logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Log[];

      if (limit) {
        logs = logs.slice(0, limit);
      }

      return logs;
    },
    enabled: !!user,
  });
}

// Hook for getting today's public logs (for board)
export function useTodayLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['todayLogs'],
    queryFn: async (): Promise<Log[]> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();

      const logsRef = collection(db, 'logs');
      const q = query(
        logsRef,
        where('visibility', '==', 'public'),
        where('at', '>=', todayStart),
        orderBy('at', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Log[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
