import { LayoutDashboard, FileStack, FolderTree, User, LogOut } from 'lucide-react';import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ManagerSidebar = () => {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    const menuItems = [
        { name: 'Dashboard', path: '/manager-dashboard', icon: <LayoutDashboard size={20}/> },
        { name: 'Team Reports', path: '/manager/reports', icon: <FileStack size={20}/> },
        { name: 'Projects', path: '/manager/projects', icon: <FolderTree size={20}/> },
        { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
    ];

    return (
        <div className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 p-5 shadow-xl flex flex-col">
            <div className="mb-10 px-2">
                <h1 className="text-xl font-bold text-blue-400">Weekly Report</h1>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-semibold">Manager Portal</p>
            </div>
            
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <Link key={item.path} to={item.path}
                        className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-300'}`}>
                        {item.icon} {item.name}
                    </Link>
                ))}
            </nav>

            {/* User Info Section */}
            <div className="p-4 bg-slate-800/50 rounded-2xl mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                    {user?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
            </div>

            <button onClick={logout} className="flex items-center gap-3 p-3 w-full text-red-400 hover:bg-rose-500/10 rounded-xl transition">
                <LogOut size={20}/> Logout
            </button>
        </div>
    );
};

export default ManagerSidebar;
