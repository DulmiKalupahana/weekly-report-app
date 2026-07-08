import { useState } from 'react';
import { LayoutDashboard, FileText, Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MemberSidebar = () => {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/member-dashboard', icon: <LayoutDashboard size={20}/> },
        { name: 'My Reports', path: '/member/reports', icon: <FileText size={20}/> },
        { name: 'My Projects', path: '/member/projects', icon: <Briefcase size={20}/> },
        { name: 'Profile', path: '/profile', icon: <User size={20}/> }
    ];

    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* --- MOBILE TOP BAR --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B1120] border-b border-[#1E293B] flex items-center justify-between px-4 z-40">
                <h1 className="text-lg font-bold text-white">Weekly Report</h1>
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-slate-200 p-2 hover:bg-[#172554] rounded-lg transition"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* --- MOBILE OVERLAY BACKDROP --- */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeSidebar}
                />
            )}

            {/* --- SIDEBAR --- */}
            <div
                className={`w-64 h-screen bg-[#0B1120] fixed left-0 top-0 p-6 flex flex-col text-white shadow-xl border-r border-[#1E293B] z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                {/* Logo + Mobile Close Button */}
                <div className="mb-10 px-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">Weekly Report</h1>
                        <p className="text-xs text-slate-400 mt-1">Member Portal</p>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="md:hidden text-slate-300 hover:text-white p-1"
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item)=>(
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                location.pathname === item.path
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                                : "text-slate-300 hover:bg-[#172554] hover:text-white"
                            }`}
                        >
                            {item.icon}
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Card */}
                <div className="p-4 bg-[#111827] rounded-xl mb-4 flex items-center gap-3 border border-[#1E293B]">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
                    <LogOut size={20}/>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </>
    );
};

export default MemberSidebar;