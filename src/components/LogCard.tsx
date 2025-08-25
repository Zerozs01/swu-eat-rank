import React, { useState } from 'react';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
import { calcHealthScore } from '../utils/healthScore';
import HealthBadge from './HealthBadge';
import { useDeleteLog, useUpdateLog } from '../hooks/useLogs';
import { useNotification } from '../contexts/NotificationContext';
import type { Log, Menu } from '../types/menu';

interface LogCardProps {
  log: Log;
  menu: Menu;
}

export default function LogCard({ log, menu }: LogCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const healthScore = calcHealthScore(menu);
  const deleteLog = useDeleteLog();
  const updateLog = useUpdateLog();
  const { showNotification } = useNotification();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'วันนี้';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'เมื่อวาน';
    } else {
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLog.mutateAsync(log.id);
      showNotification({
        type: 'success',
        title: 'ลบสำเร็จ! ✅',
        message: 'ลบประวัติการกินเรียบร้อยแล้ว',
        duration: 3000
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting log:', error);
      showNotification({
        type: 'warning',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถลบประวัติการกินได้ กรุณาลองใหม่อีกครั้ง',
        duration: 5000
      });
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = log.visibility === 'public' ? 'private' : 'public';
    try {
      await updateLog.mutateAsync({
        logId: log.id,
        visibility: newVisibility
      });
      showNotification({
        type: 'success',
        title: 'อัปเดตสำเร็จ! ✅',
        message: `เปลี่ยนสถานะเป็น ${newVisibility === 'public' ? 'สาธารณะ' : 'ส่วนตัว'} แล้ว`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating log visibility:', error);
      showNotification({
        type: 'warning',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองใหม่อีกครั้ง',
        duration: 5000
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
            {menu.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {menu.vendor} • {LOCATIONS[menu.location]}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(log.at)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {formatTime(log.at)}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
          {CATEGORIES[menu.category]}
        </span>
        {menu.tastes.slice(0, 2).map((taste) => (
          <span
            key={taste}
            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
          >
            {TASTES[taste]}
          </span>
        ))}
        {menu.tastes.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
            +{menu.tastes.length - 2}
          </span>
        )}
      </div>

      {/* Quantity and Health Score */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">จำนวน:</span>
          <span className="font-semibold text-gray-800 dark:text-white">
            {log.quantity} จาน
          </span>
        </div>
        <HealthBadge score={healthScore} />
      </div>

      {/* Visibility Status */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">สถานะ:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            log.visibility === 'public' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {log.visibility === 'public' ? '🌐 สาธารณะ' : '🔒 ส่วนตัว'}
          </span>
        </div>
        <button
          onClick={handleToggleVisibility}
          disabled={updateLog.isPending}
          className={`px-3 py-1 text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            log.visibility === 'public'
              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
          }`}
        >
          {updateLog.isPending ? 'กำลังเปลี่ยน...' : 
           log.visibility === 'public' ? 'เปลี่ยนเป็นส่วนตัว' : 'เปลี่ยนเป็นสาธารณะ'}
        </button>
      </div>

             {/* Action Buttons */}
       <div className="flex space-x-2">
         <button
           onClick={() => setShowDetails(!showDetails)}
           className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
         >
           {showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
         </button>
         
         <button
           onClick={() => setShowDeleteConfirm(true)}
           disabled={deleteLog.isPending}
           className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {deleteLog.isPending ? 'กำลังลบ...' : '🗑️'}
         </button>
       </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            {/* Ingredients */}
            {menu.ingredients.veggies && menu.ingredients.veggies.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">ผัก:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {menu.ingredients.veggies.join(', ')}
                </span>
              </div>
            )}
            {menu.ingredients.proteins && menu.ingredients.proteins.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">โปรตีน:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {menu.ingredients.proteins.join(', ')}
                </span>
              </div>
            )}
            
            {/* Nutrition (if available) */}
            {menu.nutrition && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">แคลอรี่:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.cal || 'N/A'} cal
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">ไขมัน:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.fat || 'N/A'}g
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">น้ำตาล:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.sugar || 'N/A'}g
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">โซเดียม:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.sodium || 'N/A'}mg
                  </span>
                </div>
              </div>
            )}
                     </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
               ยืนยันการลบ
             </h3>
             <p className="text-gray-600 dark:text-gray-300 mb-6">
               คุณต้องการลบประวัติการกิน "{menu.name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
             </p>
             <div className="flex space-x-3">
               <button
                 onClick={() => setShowDeleteConfirm(false)}
                 className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
               >
                 ยกเลิก
               </button>
               <button
                 onClick={handleDelete}
                 disabled={deleteLog.isPending}
                 className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
               >
                 {deleteLog.isPending ? 'กำลังลบ...' : 'ลบ'}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
