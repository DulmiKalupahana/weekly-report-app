import { useState, useEffect } from 'react';
import { getAllReports } from '../../api/reportService';
import ManagerLayout from '../../layouts/ManagerLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ManagerDashboard = () => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({ total: 0, blockers: 0 });

    useEffect(() => {
        const loadData = async () => {
            const data = await getAllReports();
            setReports(data);
            
            // Basic Metrics
            const blockersCount = data.filter(r => r.blockers && r.blockers.length > 5).length;
            setStats({ total: data.length, blockers: blockersCount });
        };
        loadData();
    }, []);

    return (
        <ManagerLayout>
            <h1 className="text-2xl font-bold mb-6">Team Overview</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Total Reports</p>
                    <h3 className="text-3xl font-bold">{stats.total}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <p className="text-gray-500 text-sm">Active Blockers</p>
                    <h3 className="text-3xl font-bold">{stats.blockers}</h3>
                </div>
            </div>

            {/* Chart (Task Distribution) */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h2 className="font-bold mb-4">Reports by Team Member</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reports}>
                            <XAxis dataKey="user.name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="hoursWorked" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Member</th>
                            <th className="p-4">Project</th>
                            <th className="p-4">Week</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(r => (
                            <tr key={r._id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{r.user?.name}</td>
                                <td className="p-4">{r.project?.name}</td>
                                <td className="p-4">{new Date(r.weekStartDate).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Submitted</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ManagerLayout>
    );
};

export default ManagerDashboard;