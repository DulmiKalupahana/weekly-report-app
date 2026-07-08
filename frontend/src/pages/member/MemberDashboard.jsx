import React, { useState, useEffect, useContext, useMemo } from 'react';
import { getMyReports } from '../../api/reportService';
import { getProjects } from '../../api/projectService';
import MemberSidebar from '../../components/MemberSidebar';
import { AuthContext } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, FileCheck, Layout } from 'lucide-react';

const MemberDashboard = () => {
    const { user } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [reportsData, projectsData] = await Promise.all([
                    getMyReports(),
                    getProjects()
                ]);
                setReports(Array.isArray(reportsData) ? reportsData : []);
                setProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (err) {
                console.error("Error loading dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const myProjectCount = useMemo(() => {
        if (!user?._id) return 0;
        return projects.filter(p => 
            p.members?.some(m => (typeof m === 'string' ? m === user._id : m._id === user._id))
        ).length;
    }, [projects, user]);

    const totalHours = reports.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);

    const chartData = reports.slice(0, 6).reverse().map(r => ({
        week: new Date(r.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        hours: r.hoursWorked || 0
    }));

    if (loading) return <div className="p-10 text-slate-400">Loading your progress...</div>;

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <MemberSidebar />
            <div className="ml-64 p-8 w-full max-w-6xl">
                <header className="mb-10">
                    <h1 className="text-2xl font-bold text-slate-800">My Progress Overview</h1>
                    <p className="text-slate-500 text-sm">Hello {user?.name}, here is your work summary.</p>
                </header>
                
                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24}/></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours</p>
                            <h3 className="text-2xl font-bold text-slate-800">{totalHours}h</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><FileCheck size={24}/></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports Sent</p>
                            <h3 className="text-2xl font-bold text-slate-800">{reports.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Layout size={24}/></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Projects</p>
                            <h3 className="text-2xl font-bold text-slate-800">{myProjectCount}</h3>
                        </div>
                    </div>
                </div>

                {/* Work Trend Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500"/> Weekly Work Trend
                        </h2>
                        <span className="text-xs font-bold text-slate-400">Last 6 Reports</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}} 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                                />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;