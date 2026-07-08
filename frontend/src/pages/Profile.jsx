import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MemberSidebar from '../components/MemberSidebar';
import ManagerSidebar from '../components/ManagerSidebar';
import { 
    User, Mail, ShieldCheck, PencilLine, Save,
    KeyRound, Eye, EyeOff, XCircle, BadgeCheck
} from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        newPassword: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const handleFieldChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSave = () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match!");
            return;
        }
        
        // API call logic here
        console.log("Updating Profile:", formData);
        setIsEditing(false);
        setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    };

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            {user?.role === 'manager' ? <ManagerSidebar /> : <MemberSidebar />}
            
            <div className="ml-64 p-8 w-full flex justify-center items-start pt-12">
                <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    
                    {/* Header Decorative Area */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <div className="w-24 h-24 bg-white rounded-3xl p-1.5 shadow-2xl rotate-3">
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-[1.2rem] flex items-center justify-center text-blue-600 text-4xl font-black -rotate-3">
                                    {user?.name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-10 pb-12 pt-16">
                        {!isEditing ? (
                            /* --- VIEW MODE --- */
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
                                        {user?.name} <BadgeCheck className="text-blue-500" size={24} />
                                    </h2>
                                    <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-[0.2em]">{user?.role}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mb-10">
                                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition hover:bg-white hover:shadow-md">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-slate-50">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-slate-700">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition hover:bg-white hover:shadow-md">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-50">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</p>
                                            <p className="text-sm font-bold text-slate-700 capitalize">{user?.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
                                >
                                    <PencilLine size={18} /> Edit Profile Info
                                </button>
                            </div>
                        ) : (
                            /* --- EDIT MODE --- */
                            <div className="animate-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-800">Update Profile</h3>
                                    <button onClick={() => setShowPassword(!showPassword)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 hover:text-blue-600 transition">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-6 flex items-center gap-2 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold">
                                        <XCircle size={16} /> {error}
                                    </div>
                                )}
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleFieldChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleFieldChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700" />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                                            <KeyRound size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Security Update</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="newPassword"
                                                placeholder="New Password"
                                                value={formData.newPassword}
                                                onChange={handleFieldChange}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                                            />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                placeholder="Confirm New Password"
                                                value={formData.confirmPassword}
                                                onChange={handleFieldChange}
                                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300">
                                        <Save size={20} /> Save Update
                                    </button>
                                    <button onClick={() => { setIsEditing(false); setError(''); }} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-700 transition">
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