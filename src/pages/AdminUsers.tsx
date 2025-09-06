import { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Admin whitelist - เฉพาะ email ที่อนุญาต
const ADMIN_WHITELIST = [
  'auandmaxma@gmail.com', // Owner
  // เพิ่ม email อื่น ๆ ได้ที่นี่
];

export default function AdminUsers() {
  const { isOwner, adminLoading, userEmail, isAuthenticated, adminWhitelist } = useAdminAuth();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminUsers, setAdminUsers] = useState<string[]>(adminWhitelist);
  const [loading, setLoading] = useState(false);

  // Update adminUsers when adminWhitelist changes
  useEffect(() => {
    setAdminUsers(adminWhitelist);
  }, [adminWhitelist]);

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ต้องเข้าสู่ระบบ</h1>
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้า Admin</p>
        </div>
      </div>
    );
  }

  // Not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-2">คุณไม่มีสิทธิ์เข้าถึงหน้า Admin Users</p>
          <p className="text-sm text-gray-500">Email: {userEmail}</p>
        </div>
      </div>
    );
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      alert('กรุณากรอก email');
      return;
    }

    if (adminUsers.includes(newAdminEmail.toLowerCase())) {
      alert('Email นี้มีสิทธิ์ admin อยู่แล้ว');
      return;
    }

    setLoading(true);
    
    try {
      // เพิ่ม admin ใหม่ใน collection adminUsers
      const docRef = doc(db, 'adminUsers', newAdminEmail.toLowerCase());
      await setDoc(docRef, {
        email: newAdminEmail.toLowerCase(),
        addedAt: Date.now(),
        addedBy: userEmail
      });
      
      // อัปเดต local state
      const newAdminList = [...adminUsers, newAdminEmail.toLowerCase()];
      setAdminUsers(newAdminList);
      
      setNewAdminEmail('');
      alert('เพิ่ม admin สำเร็จ!');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่ม admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === 'auandmaxma@gmail.com') {
      alert('ไม่สามารถลบ Owner ได้');
      return;
    }

    if (!confirm(`ต้องการลบสิทธิ์ admin ของ ${email} หรือไม่?`)) {
      return;
    }

    setLoading(true);
    
    try {
      // ลบ admin จาก collection adminUsers
      const docRef = doc(db, 'adminUsers', email);
      await deleteDoc(docRef);
      
      // อัปเดต local state
      const newAdminList = adminUsers.filter(e => e !== email);
      setAdminUsers(newAdminList);
      
      alert('ลบสิทธิ์ admin สำเร็จ!');
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('เกิดข้อผิดพลาดในการลบ admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">จัดการ Admin Users</h1>
          <p className="text-gray-600 mt-2">
            เพิ่ม/ลบสิทธิ์ admin • ผู้ใช้: {userEmail}
          </p>
        </div>

        {/* Add Admin Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">เพิ่ม Admin ใหม่</h2>
          <form onSubmit={handleAddAdmin} className="flex gap-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="กรอก email ที่ต้องการให้สิทธิ์ admin"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'กำลังเพิ่ม...' : 'เพิ่ม Admin'}
            </button>
          </form>
        </div>

        {/* Admin Users List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Users ({adminUsers.length})</h2>
          
          <div className="space-y-3">
            {adminUsers.map((email, index) => (
              <div key={email} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{email}</p>
                    {email === 'auandmaxma@gmail.com' && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
                
                {email !== 'auandmaxma@gmail.com' && (
                  <button
                    onClick={() => handleRemoveAdmin(email)}
                    disabled={loading}
                    className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    ลบ
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">คำแนะนำ</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Admin ที่เพิ่มใหม่จะสามารถเข้าถึงหน้า Admin ได้ทันที</li>
            <li>• การเปลี่ยนแปลงจะบันทึกลง Firestore เพื่อ sync ระหว่าง devices</li>
            <li>• Owner (auandmaxma@gmail.com) ไม่สามารถลบได้</li>
            <li>• ตรวจสอบ email ให้ถูกต้องก่อนเพิ่ม</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
