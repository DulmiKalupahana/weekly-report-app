import { useState, useEffect } from 'react';
import { getAllReports } from '../../api/reportService';
import ManagerSidebar from '../../components/ManagerSidebar';
import { Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TeamReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const displayText = (value, fallback = '-') => {
        if (!value) return fallback;
        if (typeof value === 'string' || typeof value === 'number') return value;
        return value.name || value.email || value.title || fallback;
    };

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getAllReports();
                setReports(Array.isArray(data) ? data : data?.reports || []);
            } catch (err) {
                console.error("Failed to fetch all reports", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <ManagerSidebar />
            <div className="ml-64 p-8 w-full">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Team Dashboard</h2>
                        <p className="text-slate-500">Analyze report submission status across the team</p>
                    </div>
                    {/* Filtering Section as per Point 3 */}
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                            <input type="text" placeholder="Search Member..." className="pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white shadow-sm" />
                        </div>
                        <select className="p-2 border rounded-xl text-sm bg-white shadow-sm outline-none">
                            <option>Selected Week: Mar 18-24</option>
                            <option>Week: Mar 11-17</option>
                        </select>
                        <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-slate-700">
                            <Filter size={16}/> Filter
                        </button>
                    </div>
                </div>

                {/* Status Tracking Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Submitted</p><h4 className="text-xl font-bold text-slate-800">12 Members</h4></div>
                        <CheckCircle className="text-emerald-500 opacity-20" size={32}/>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Late Submission</p><h4 className="text-xl font-bold text-slate-800">2 Members</h4></div>
                        <Clock className="text-amber-500 opacity-20" size={32}/>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-l-4 border-rose-500 shadow-sm flex items-center justify-between">
                        <div><p className="text-xs font-bold text-slate-400 uppercase">Pending</p><h4 className="text-xl font-bold text-slate-800">1 Member</h4></div>
                        <AlertCircle className="text-rose-500 opacity-20" size={32}/>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading && <div className="p-4 text-sm text-slate-500">Loading reports...</div>}
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Member</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Project</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Tasks Highlights</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Blockers</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report) => (
                                <tr key={report._id || report.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-bold text-slate-800">{displayText(report.user || report.name)}</td>
                                    <td className="p-4 text-sm text-slate-600">{displayText(report.project || report.projectTag)}</td>
                                    <td className="p-4 text-sm text-slate-500 truncate max-w-[200px]">{displayText(report.tasksCompleted || report.tasks)}</td>
                                    <td className={`p-4 text-sm font-medium ${displayText(report.blockers, 'None') !== 'None' ? 'text-rose-500' : 'text-slate-400'}`}>{displayText(report.blockers, 'None')}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${report.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : report.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-bold underline">Review Full</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamReports;
