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

    if (loading) {
        return (
            <div className="flex bg-background min-h-screen">
                <MemberSidebar />
                <div className="ml-0 md:ml-64 flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-text-muted">
                        <div className="w-4 h-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                        <span className="text-sm font-medium">Loading your progress…</span>
                    </div>
                </div>
            </div>
        );
    }

    const metricCards = [
        {
            label: 'Total Hours',
            value: totalHours,
            suffix: 'hrs',
            icon: Clock,
            accent: 'text-primary-600 bg-primary-50'
        },
        {
            label: 'Reports Sent',
            value: reports.length,
            suffix: '',
            icon: FileCheck,
            accent: 'text-primary-700 bg-primary-100'
        },
        {
            label: 'Active Projects',
            value: myProjectCount,
            suffix: '',
            icon: Layout,
            accent: 'text-text-primary bg-surface-secondary'
        }
    ];

    return (
        <div className="flex bg-background min-h-screen">
            <MemberSidebar />
            <div className="ml-0 md:ml-64 flex-1 p-4 pt-20 md:p-8 w-full">

                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Progress Overview</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Welcome back, <span className="text-primary-600 font-semibold">{user?.name}</span>
                        </p>
                    </div>
                    <div className="bg-surface px-4 py-2 rounded-xl border border-border text-sm text-text-secondary font-medium shadow-sm">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {metricCards.map(({ label, value, suffix, icon: Icon, accent }) => (
                        <div
                            key={label}
                            className="bg-surface p-6 rounded-2xl shadow-sm border border-border relative overflow-hidden group hover:shadow-md hover:border-primary-200 transition-all"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                                <Icon size={80} className="text-primary-900" />
                            </div>
                            <div className={`p-3 rounded-xl w-fit mb-4 ${accent}`}>
                                <Icon size={22} />
                            </div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">{label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">
                                {value}
                                {suffix && <span className="text-sm ml-1 text-text-muted font-medium">{suffix}</span>}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-border">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                        <h2 className="font-bold text-text-primary flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary-600" /> Weekly Work Trend
                        </h2>
                        <span className="text-xs font-bold text-text-muted bg-surface-secondary px-3 py-1 rounded-md">
                            Last 6 Reports
                        </span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)' }}
                                />
                                <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {chartData.length === 0 && (
                        <p className="text-center text-sm text-text-muted mt-4">
                            No reports yet — submit your first weekly report to see your trend here.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;