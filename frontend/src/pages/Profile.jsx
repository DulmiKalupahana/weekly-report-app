import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MemberSidebar from '../components/MemberSidebar';
import ManagerSidebar from '../components/ManagerSidebar';
import { User, Mail, Shield, Edit2, Save, Lock, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Password පෙන්වීමට/සැඟවීමට
    
    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const handleFieldChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSave = () => {
        // Password එකක් ඇතුළත් කරන්නේ නම් ඒවා සමානදැයි බැලීම
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match!");
            return;
        }

        // මෙහිදී API call එකක් මගින් backend එකට දත්ත යැවිය යුතුය
        console.log("Updating Profile with:", formData);
        
        setIsEditing(false);
        // Password fields හිස් කිරීම
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            {user?.role === 'manager' ? <ManagerSidebar /> : <MemberSidebar />}
            
            <div className="ml-64 p-8 w-full flex justify-center items-start pt-10">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    <div className="bg-blue-600 h-24"></div>
                    
                    <div className="px-8 pb-10 -mt-12 flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg mb-4">
                            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold font-sans">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>

                        {!isEditing ? (
                            /* --- DISPLAY MODE --- */
                            <div className="w-full space-y-6 text-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                                    <span className="mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-full inline-block">
                                        {user?.role}
                                    </span>
                                </div>

                                <div className="space-y-4 text-left border-t border-slate-50 pt-6">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mail size={18} className="text-slate-400" />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Shield size={18} className="text-slate-400" />
                                        <span className="text-sm capitalize">Role: {user?.role}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Lock size={18} className="text-slate-400" />
                                        <span className="text-sm">Password: ••••••••</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition"
                                >
                                    <Edit2 size={16} /> Edit Profile & Password
                                </button>
                            </div>
                        ) : (
                            /* --- EDIT MODE --- */
                            <div className="w-full space-y-5">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
                                    <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-blue-600 transition">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleFieldChange} className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleFieldChange} className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-blue-600 uppercase mb-3">Change Password (Optional)</p>
                                        <div className="space-y-3">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                name="currentPassword"
                                                placeholder="Current Password" 
                                                value={formData.currentPassword}
                                                onChange={handleFieldChange}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                            />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                name="newPassword"
                                                placeholder="New Password" 
                                                value={formData.newPassword}
                                                onChange={handleFieldChange}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                            />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                name="confirmPassword"
                                                placeholder="Confirm New Password" 
                                                value={formData.confirmPassword}
                                                onChange={handleFieldChange}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                                        <Save size={18} /> Save Changes
                                    </button>
                                    <button onClick={() => { setIsEditing(false); setError(''); }} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;