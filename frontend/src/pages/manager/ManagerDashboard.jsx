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
    FileText, AlertTriangle, CheckCircle2,
    Activity, PieChart as PieIcon, BarChart3, TrendingUp
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

    const handleAddProject = async (projectName, selectedMemberIds) => {
        try {
            const newProject = {
                name: projectName,
                members: selectedMemberIds,
                status: 'Active'
            };

            const response = await createProject(newProject);
            
            setProjects([...projects, response]);
            alert("Project created with members!");
        } catch (err) {
            console.error("Error creating project", err);
        }
    };

    // Summary metrics
    const metrics = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const reportsThisWeek = reports.filter(r => new Date(r.createdAt) >= startOfWeek).length;

        const membersSubmittedIds = new Set(
            reports.filter(r => new Date(r.createdAt) >= startOfWeek).map(r => r.user?._id)
        );
        const totalSubmitted = membersSubmittedIds.size;
        const totalPending = Math.max(0, members.length - totalSubmitted);
        const compliance = members.length > 0 ? Math.round((totalSubmitted / members.length) * 100) : 0;

        const openBlockers = reports.filter(r => r.blockers && r.blockers.trim() !== '').length;

        return { reportsThisWeek, compliance, openBlockers, totalPending, totalSubmitted };
    }, [reports, members]);

    // Activity trend, last 7 days
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

    const pieData = [
        { name: 'Submitted', value: metrics.totalSubmitted, color: '#2563eb' },
        { name: 'Pending', value: metrics.totalPending, color: '#f59e0b' }
    ];

    const projectDistData = useMemo(() => {
        return projects.map(p => ({
            name: p.name,
            memberCount: p.members ? p.members.length : 0,
            hours: reports
                .filter(r => (r.project?._id || r.project) === p._id)
                .reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0)
        })).filter(d => d.hours > 0 || d.memberCount > 0);
    }, [projects, reports]);

    if (loading) {
        return (
            <ManagerLayout>
                <div className="flex items-center gap-3 text-text-muted p-10">
                    <div className="w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                    <span className="text-sm font-medium">Loading dashboard…</span>
                </div>
            </ManagerLayout>
        );
    }

    const metricCards = [
        {
            label: 'Submitted This Week',
            value: metrics.reportsThisWeek,
            icon: FileText,
            accent: 'text-primary-600 bg-primary-50'
        },
        {
            label: 'Compliance Rate',
            value: `${metrics.compliance}%`,
            icon: CheckCircle2,
            accent: 'text-primary-700 bg-primary-100'
        },
        {
            label: 'Open Blockers',
            value: metrics.openBlockers,
            icon: AlertTriangle,
            accent: metrics.openBlockers > 0 ? 'text-danger-600 bg-danger-50' : 'text-text-primary bg-surface-secondary'
        }
    ];

    return (
        <ManagerLayout>
            <h1 className="text-2xl font-bold text-text-primary mb-8">Dashboard &amp; Visual Insights</h1>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {metricCards.map(({ label, value, icon: Icon, accent }) => (
                    <div key={label} className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all">
                        <div className={`p-4 rounded-xl ${accent}`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-wide">{label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trend + distribution charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-border">
                    <h2 className="font-bold text-text-primary mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary-600" /> Activity Trend (Last 7 Days)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }} />
                                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb' }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-border">
                    <h2 className="font-bold text-text-primary mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary-600" /> Workload Distribution (Total Hours)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectDistData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {projectDistData.length === 0 && (
                        <p className="text-center text-sm text-text-muted mt-4">No logged hours yet.</p>
                    )}
                </div>
            </div>

            {/* Compliance pie + activity feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center">
                    <h2 className="font-bold text-text-primary mb-4 self-start flex items-center gap-2">
                        <PieIcon size={20} className="text-primary-600" /> Team Compliance Status
                    </h2>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600">
                            <div className="w-2 h-2 rounded-full bg-primary-600" /> Submitted ({metrics.totalSubmitted})
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                            <div className="w-2 h-2 rounded-full bg-warning-500" /> Pending ({metrics.totalPending})
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="font-bold text-text-primary flex items-center gap-2">
                            <Activity size={20} className="text-primary-600" /> Recent Activity Feed
                        </h2>
                        <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase">Live</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[420px]">
                            <thead className="bg-surface-secondary/50">
                                <tr>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted">Team Member</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted">Project</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-text-muted text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {reports.slice(0, 6).map(r => (
                                    <tr key={r._id} className="hover:bg-surface-secondary/70 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[10px]">
                                                {r.user?.name?.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-text-primary">{r.user?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="p-4 text-xs text-text-muted font-medium">{r.project?.name || 'General'}</td>
                                        <td className="p-4 text-right">
                                            <span className="text-[9px] font-black uppercase bg-success-50 text-success-600 px-2 py-1 rounded-lg border border-success-100">
                                                Submitted
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-6 text-center text-sm text-text-muted">No reports submitted yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
};

export default ManagerDashboard;