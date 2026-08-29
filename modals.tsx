{editSecurityModal.isOpen && createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
      <button onClick={() => setEditSecurityModal({...editSecurityModal, isOpen: false})} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
        <Shield className="w-7 h-7 text-amber-500" />
        تعديل بيانات الأمان
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
          <input type="text" value={editSecurityModal.password} onChange={e => setEditSecurityModal({...editSecurityModal, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رمز الأمان (PIN)</label>
          <input type="text" value={editSecurityModal.pin} onChange={e => setEditSecurityModal({...editSecurityModal, pin: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
        </div>
        <button onClick={() => {
           const users = getSafeFakeUsers();
           const index = users.findIndex((u: any) => u.email === editSecurityModal.userEmail);
           if (index > -1) {
             users[index].password = editSecurityModal.password;
             users[index].pin = editSecurityModal.pin;
             localStorage.setItem('fake_users', JSON.stringify(users));
             if (editSecurityModal.userId) {
               updateUserDB(editSecurityModal.userId, { password: editSecurityModal.password, pin: editSecurityModal.pin }).catch(()=>{});
             }
             showNotification('success', 'تم تعديل بيانات الأمان بنجاح');
             setEditSecurityModal({ isOpen: false, userEmail: '', userId: '' });
           }
        }} className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30">
           حفظ التعديلات
        </button>
      </div>
    </div>
  </div>, document.body
)}

{sendUserNotificationModal.isOpen && createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
      <button onClick={() => setSendUserNotificationModal({...sendUserNotificationModal, isOpen: false})} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-3">
        <Bell className="w-7 h-7 text-emerald-500" />
        إرسال إشعار
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">للمستخدم: {sendUserNotificationModal.userName}</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان الإشعار</label>
          <input type="text" value={sendUserNotificationModal.title} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نص الإشعار</label>
          <textarea value={sendUserNotificationModal.message} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, message: e.target.value})} className="w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الإشعار</label>
          <select value={sendUserNotificationModal.alertType} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, alertType: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
            <option value="normal">إشعار عادي (جرس الإشعارات)</option>
            <option value="popup">تنبيه قوي (شاشة منبثقة)</option>
          </select>
        </div>
        <button onClick={async () => {
           if (!sendUserNotificationModal.title || !sendUserNotificationModal.message) return showNotification('error', 'يرجى تعبئة الحقول');
           const newNotif = { title: sendUserNotificationModal.title, message: sendUserNotificationModal.message, date: new Date().toISOString(), read: false, type: 'personal', targetUser: sendUserNotificationModal.userEmail, alertType: sendUserNotificationModal.alertType };
           
           const api = apiModule;
           if (api.saveNotificationDB) {
             const saved = await api.saveNotificationDB(newNotif);
             if (saved) {
               showNotification('success', 'تم إرسال الإشعار بنجاح');
               setSendUserNotificationModal({ isOpen: false, userEmail: '', userId: '', userName: '', title: '', message: '', alertType: 'normal' });
             }
           }
        }} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
           إرسال الإشعار
        </button>
      </div>
    </div>
  </div>, document.body
)}
