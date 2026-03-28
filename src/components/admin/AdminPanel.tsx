import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth, handleFirestoreError, OperationType } from '../../auth/AuthContext';
import { UserPlus, Edit2, Trash2, Shield, User, X, Check, Search, Filter, Settings, Download, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  shopLogo: string | null;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ shopLogo, onLogoUpload, onLogoRemove }) => {
  const { isAdmin, isManager } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'staff' as 'admin' | 'manager' | 'staff',
    uid: ''
  });

  useEffect(() => {
    if (!isAdmin && !isManager) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, [isAdmin, isManager]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      // Use email as doc ID for pre-authorization
      const userRef = doc(db, 'users', formData.email.toLowerCase());
      await setDoc(userRef, {
        email: formData.email.toLowerCase(),
        displayName: formData.displayName,
        role: formData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsAddingUser(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${formData.email}`);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingUser) return;

    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        role: formData.role,
        updatedAt: serverTimestamp()
      });
      setEditingUser(null);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${editingUser.id}`);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Send password reset email to ${email}?`)) return;

    setIsResettingPassword(email);
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsResettingPassword(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile? This will not delete their Auth account.')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', displayName: '', role: 'staff', uid: '' });
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin && !isManager) return <div className="p-8 text-center font-black text-red-600 uppercase">Access Denied</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            User Management
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
            {isAdmin ? 'Admin Control Panel' : 'Manager View Only'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                resetForm();
                setIsAddingUser(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shop Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-900 uppercase tracking-tighter">Shop Settings</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-3 tracking-wider">Shop Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 overflow-hidden shrink-0">
                    {shopLogo ? (
                      <img src={shopLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <LogIn className="w-8 h-8 opacity-20" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onLogoUpload}
                      className="hidden" 
                      id="admin-logo-upload" 
                    />
                    <label 
                      htmlFor="admin-logo-upload" 
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Upload Logo
                    </label>
                    {shopLogo && (
                      <button 
                        onClick={onLogoRemove}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider leading-relaxed">
                  Recommended: Square image (512x512px). This logo will appear on all print slips and headers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black uppercase">
                              {user.displayName?.[0] || user.email?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-none">{user.displayName || 'N/A'}</p>
                              <p className="text-xs font-bold text-slate-500 mt-1">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-red-100 text-red-600' :
                            user.role === 'manager' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                          {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={() => handleResetPassword(user.email)}
                                  disabled={isResettingPassword === user.email}
                                  className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reset Password"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingUser(user);
                                    setFormData({
                                      email: user.email,
                                      displayName: user.displayName || '',
                                      role: user.role,
                                      uid: user.uid
                                    });
                                  }}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {auth.currentUser?.uid !== user.uid && (
                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                            {!isAdmin && isManager && (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View Only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editingUser || isAddingUser) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                  {isAddingUser ? 'Add New User' : 'Edit User Profile'}
                </h3>
                <button 
                  onClick={() => {
                    setEditingUser(null);
                    setIsAddingUser(false);
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={isAddingUser ? handleCreateUser : handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1 tracking-wider">
                    Email {editingUser ? '(Read Only)' : ''}
                  </label>
                  <input 
                    type="email" 
                    readOnly={!!editingUser}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none transition-all ${
                      editingUser ? 'text-slate-400' : 'focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1 tracking-wider">Display Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1 tracking-wider">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold uppercase text-xs tracking-widest"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Shop Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setIsAddingUser(false);
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    {isAddingUser ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
