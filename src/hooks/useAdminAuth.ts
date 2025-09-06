import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Default admin whitelist - เฉพาะ email ที่อนุญาต
const DEFAULT_ADMIN_WHITELIST = [
  'auandmaxma@gmail.com', // Owner
  // เพิ่ม email อื่น ๆ ได้ที่นี่
];

export function useAdminAuth() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminWhitelist, setAdminWhitelist] = useState<string[]>(DEFAULT_ADMIN_WHITELIST);

  useEffect(() => {
    if (loading) {
      setAdminLoading(true);
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setIsOwner(false);
      setAdminLoading(false);
      return;
    }

    // ตรวจสอบว่า email อยู่ใน whitelist หรือไม่
    const userEmail = user.email?.toLowerCase();
    const isAuthorized = adminWhitelist.some(
      adminEmail => adminEmail.toLowerCase() === userEmail
    );
    const isOwnerUser = userEmail === 'auandmaxma@gmail.com';

    setIsAdmin(isAuthorized);
    setIsOwner(isOwnerUser);
    setAdminLoading(false);
  }, [user, loading, adminWhitelist]);

  // Load admin whitelist from Firestore
  useEffect(() => {
    const loadAdminWhitelist = async () => {
      try {
        const adminUsersRef = collection(db, 'adminUsers');
        const snapshot = await getDocs(adminUsersRef);
        
        if (!snapshot.empty) {
          const emails = snapshot.docs.map(doc => doc.id);
          setAdminWhitelist([...DEFAULT_ADMIN_WHITELIST, ...emails]);
        } else {
          // ถ้าไม่มี document ให้ใช้ default
          setAdminWhitelist(DEFAULT_ADMIN_WHITELIST);
        }
      } catch (error) {
        console.error('Error loading admin whitelist:', error);
        setAdminWhitelist(DEFAULT_ADMIN_WHITELIST);
      }
    };

    loadAdminWhitelist();
  }, []);

  return {
    isAdmin,
    isOwner,
    adminLoading,
    userEmail: user?.email,
    isAuthenticated: !!user,
    adminWhitelist
  };
}
