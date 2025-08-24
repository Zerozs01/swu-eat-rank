import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Log } from '../types/menu';

interface CreateLogData {
  menuId: string;
  faculty: string;
  visibility: 'public' | 'private';
  quantity: number;
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
        quantity: data.quantity,
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
      if (!user) {
        console.log('useUserLogs: No user, returning empty array');
        return [];
      }

      console.log('useUserLogs: Fetching logs for user:', user.uid);

      const logsRef = collection(db, 'logs');
      
      try {
        // First, get all logs for the user without ordering
        let q = query(logsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        console.log('useUserLogs: Found', snapshot.docs.length, 'logs');
        
        let logs = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('useUserLogs: Log data:', { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data
          };
        }) as Log[];

        // Sort on client side
        logs.sort((a, b) => b.at - a.at);

        if (limit) {
          logs = logs.slice(0, limit);
        }

        console.log('useUserLogs: Returning', logs.length, 'logs');
        return logs;
      } catch (error) {
        console.error('useUserLogs: Error fetching logs:', error);
        throw error;
      }
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

      console.log('useTodayLogs: Fetching logs from', new Date(todayStart));

      const logsRef = collection(db, 'logs');
      
      try {
        // Get all public logs first
        let q = query(logsRef, where('visibility', '==', 'public'));
        const snapshot = await getDocs(q);
        
        // Filter by date on client side
        let logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Log[];
        
        logs = logs.filter(log => log.at >= todayStart);
        logs.sort((a, b) => b.at - a.at);
        
        console.log('useTodayLogs: Found', logs.length, 'logs for today');
        return logs;
      } catch (error) {
        console.error('useTodayLogs: Error fetching logs:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
