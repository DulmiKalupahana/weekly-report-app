import { useState, useEffect, useMemo } from 'react';
import { getAllReports } from '../../api/reportService';
import { getProjects } from '../../api/projectService';
import { searchMembers } from '../../api/userService';
import ManagerLayout from './ManagerLayout';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, CartesianGrid, LineChart, Line
} from 'recharts';
import { 
    Users, FileText, AlertTriangle, CheckCircle2,
    Clock, Activity, PieChart as PieIcon, BarChart3, TrendingUp
} from 'lucide-react';

const ManagerDashboard = () => {
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [reportsData, projectsData, membersData] = await Promise.all([
                    getAllReports(),
                    getProjects(),
                    searchMembers('')
                ]);
                setReports(Array.isArray(reportsData) ? reportsData : []);
                setProjects(Array.isArray(projectsData) ? projectsData : []);
                setMembers(Array.isArray(membersData) ? membersData : []);
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- 5. Summary Metrics (Total Reports, Compliance, Blockers) ---
    const metrics = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        
        // 1. Total reports submitted this week
        const reportsThisWeek = reports.filter(r => new Date(r.createdAt) >= startOfWeek).length;

        // 2. Submission compliance rate (Submitted vs Pending)
        const membersSubmittedIds = new Set(
            reports.filter(r => new Date(r.createdAt) >= startOfWeek).map(r => r.user?._id)
        );
        const totalSubmitted = membersSubmittedIds.size;
        const totalPending = Math.max(0, members.length - totalSubmitted);
        const compliance = members.length > 0 ? Math.round((totalSubmitted / members.length) * 100) : 0;

        // 3. Number of open blockers
        const openBlockers = reports.filter(r => r.blockers && r.blockers.trim() !== '').length;

        return { reportsThisWeek, compliance, openBlockers, totalPending, totalSubmitted };
    }, [reports, members]);

    // --- 5. Visual Insights (Trend, Status, Distribution) ---
    
    // 4. Tasks completed trend
    const trendData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            count: reports.filter(r => r.createdAt && r.createdAt.split('T')[0] === date).length
        }));
    }, [reports]);

    // 5. Report submission status (Pie Chart)
    const pieData = [
        { name: 'Submitted', value: metrics.totalSubmitted, color: '#10b981' },
        { name: 'Pending', value: metrics.totalPending, color: '#ef4444' }
    ];

    // 6. Workload distribution by project (Bar Chart)
    const projectDistData = useMemo(() => {
        return projects.map(p => ({
            name: p.name,
            hours: reports.filter(r => (r.project?._id || r.project) === p._id).reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0)
        })).filter(d => d.hours > 0);
    }, [projects, reports]);

    if (loading) return <ManagerLayout><div className="p-10 text-slate-400">Loading Dashboard...</div></ManagerLayout>;

    return (
        <ManagerLayout>
            <h1 className="text-2xl font-bold text-slate-800 mb-8">Dashboard & Visual Insights</h1>
            
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24}/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted This Week</p>
                        <h3 className="text-2xl font-bold">{metrics.reportsThisWeek}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 size={24}/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Rate</p>
                        <h3 className="text-2xl font-bold">{metrics.compliance}%</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle size={24}/></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Blockers</p>
                        <h3 className="text-2xl font-bold">{metrics.openBlockers}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* 4. Tasks completed trend over time */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500" /> Activity Trend (Last 7 Days)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} dot={{r: 5, fill: '#3b82f6'}} activeDot={{r: 8}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Workload distribution by project */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500" /> Workload Distribution (Total Hours)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectDistData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* 5. Report submission status (Pie Chart) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <h2 className="font-bold text-slate-800 mb-4 self-start flex items-center gap-2"><PieIcon size={20} className="text-blue-500"/> Team Compliance Status</h2>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Submitted ({metrics.totalSubmitted})</div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500"/> Pending ({metrics.totalPending})</div>
                    </div>
                </div>

                {/* 7. Recent reports / Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Recent Activity Feed</h2>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Live</span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Team Member</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-400">Project</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reports.slice(0, 6).map(r => (
                                <tr key={r._id} className="hover:bg-slate-50/50 transition">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">{r.user?.name?.charAt(0)}</div>
                                        <span className="text-xs font-bold text-slate-700">{r.user?.name || 'Unknown'}</span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500 font-medium">{r.project?.name || 'General'}</td>
                                    <td className="p-4 text-right">
                                        <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">Submitted</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ManagerLayout>
    );
};

export default ManagerDashboard;