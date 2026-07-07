// 1. useContext සහ useMemo මෙතනට එක් කළා
import React, { useState, useEffect, useContext, useMemo } from 'react'; 
import { getMyReports } from '../../api/reportService';
import { getProjects } from '../../api/projectService'; // Projects fetch කිරීමට මෙය අවශ්‍ය වේ
import MemberSidebar from '../../components/MemberSidebar';
// 2. AuthContext එක import කළා
import { AuthContext } from '../../context/AuthContext'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, FileCheck } from 'lucide-react';

const MemberDashboard = () => {
    // AuthContext එක දැන් වැඩ කරනු ඇත
    const { user } = useContext(AuthContext); 
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]); // Projects සඳහා state එකක් එක් කළා
    const [stats, setStats] = useState({ totalReports: 0, totalHours: 0 });

    useEffect(() => {
        const load = async () => {
            // Reports සහ Projects යන දෙකම fetch කිරීම
            const [reportsData, projectsData] = await Promise.all([
                getMyReports(),
                getProjects()
            ]);
            
            setReports(reportsData);
            setProjects(projectsData);
            
            const hours = reportsData.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
            setStats({ totalReports: reportsData.length, totalHours: hours });
        };
        load();
    }, []);

    // 3. assignedProjects logic එක (දැන් projects සහ user යන දෙකම ඇති නිසා වැඩ කරයි)
    const assignedProjects = useMemo(() => {
        if (!user || !user._id || !projects) return [];
        
        return projects.filter(project => 
            project.members?.some(member => 
                (typeof member === 'string' ? member === user._id : member._id === user._id)
            )
        );
    }, [projects, user]);

    const chartData = reports.slice(0, 8).reverse().map(r => ({
        week: new Date(r.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        hours: r.hoursWorked || 0
    }));

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <MemberSidebar />
            <div className="ml-64 p-8 w-full">
                <h1 className="text-2xl font-bold mb-8 text-slate-800">Overall Progress</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                        <div><p className="text-slate-400 text-xs font-bold uppercase">Total Hours</p><h3 className="text-3xl font-bold text-slate-800">{stats.totalHours}h</h3></div>
                        <Clock size={32} className="text-blue-100" />
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                        <div><p className="text-slate-400 text-xs font-bold uppercase">Reports Submitted</p><h3 className="text-3xl font-bold text-slate-800">{stats.totalReports}</h3></div>
                        <FileCheck size={32} className="text-green-100" />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="font-bold mb-6 flex items-center gap-2 text-slate-800"><TrendingUp size={20} className="text-blue-500"/> Work Hours Trend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;