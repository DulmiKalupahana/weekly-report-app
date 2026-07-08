import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllReports } from '../../api/reportService';
import { getProjects } from '../../api/projectService';
import ManagerSidebar from '../../components/ManagerSidebar';
import { 
    Search, Briefcase, ChevronRight, X, Loader2,
    Calendar, CheckCircle2, ListTodo, AlertCircle, Info
} from 'lucide-react';

const TeamReports = () => {
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // View Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingReport, setViewingReport] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [reportsData, projectsData] = await Promise.all([
                getAllReports(),
                getProjects()
            ]);
            const sortedReports = Array.isArray(reportsData)
                ? reportsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                : [];
            setReports(sortedReports);
            setProjects(projectsData);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtering Logic
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesMember = report.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProject = selectedProject ? (report.project?._id === selectedProject) : true;
            const reportDate = new Date(report.weekStartDate);
            
            if (filterMonth) {
                const reportMonthKey = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`;
                if (reportMonthKey !== filterMonth) return false;
            }
            const matchesFrom = dateFrom ? reportDate >= new Date(dateFrom) : true;
            const matchesTo = dateTo ? reportDate <= new Date(dateTo) : true;

            return matchesMember && matchesProject && matchesFrom && matchesTo;
        });
    }, [reports, searchQuery, selectedProject, filterMonth, dateFrom, dateTo]);

    const handleViewDetails = (report) => {
        setViewingReport(report);
        setViewModalOpen(true);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedProject('');
        setFilterMonth('');
        setDateFrom('');
        setDateTo('');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <ManagerSidebar />
            <div className="ml-64 p-8 w-full max-w-7xl">
                
                {/* Header & Filter Controls */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Team Reports</h2>
                            <p className="text-slate-500 text-sm">Review and filter all submitted weekly reports</p>
                        </div>
                        {(searchQuery || selectedProject || filterMonth || dateFrom || dateTo) && (
                            <button onClick={clearFilters} className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:bg-rose-50 px-3 py-1 rounded-lg transition">
                                <X size={14}/> Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Filter Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input type="text" placeholder="Search by member..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none" title="Filter by Month" />
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none" title="From Date" />
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none" title="To Date" />
                    </div>
                </div>

                {/* Report Table */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400">
                            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                            Loading all team reports...
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Team Member</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Project & Week</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tasks Highlights</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Blockers</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredReports.length > 0 ? filteredReports.map((report) => (
                                    <tr key={report._id} onClick={() => handleViewDetails(report)} className="hover:bg-blue-50/20 transition cursor-pointer group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                                    {report.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{report.user?.name}</p>
                                                    <p className="text-[10px] text-slate-400">{report.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                <Briefcase size={12} className="text-blue-500"/> {report.project?.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">Week: {formatDate(report.weekStartDate)}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-xs text-slate-600 line-clamp-1 max-w-[200px]">
                                                {report.tasksCompleted}
                                            </p>
                                        </td>
                                        <td className="p-5 text-center">
                                            {report.blockers ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                                                    <AlertCircle size={10}/> Yes
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300">None</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <ChevronRight size={18} className="inline text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"/>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-slate-400 italic">No reports found matching your selection.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* --- VIEW MODAL --- */}
            {viewModalOpen && viewingReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewModalOpen(false)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="bg-blue-600 p-8 text-white relative">
                            <button onClick={() => setViewModalOpen(false)} className="absolute top-6 right-6 hover:text-blue-200 transition-colors"><X size={24}/></button>
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <Info size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">{viewingReport.user?.name}'s Report</h3>
                            <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                                <Calendar size={12}/> Week of {formatDate(viewingReport.weekStartDate)}
                            </p>
                        </div>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                            <section>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Tasks Completed</h4>
                                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-wrap">{viewingReport.tasksCompleted}</p>
                            </section>
                            <section>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2"><ListTodo size={14} className="text-blue-500"/> Planned for Next Week</h4>
                                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-wrap">{viewingReport.tasksPlannedNextWeek}</p>
                            </section>
                            {viewingReport.blockers && (
                                <section>
                                    <h4 className="text-[10px] font-black uppercase text-rose-400 mb-2 flex items-center gap-2"><AlertCircle size={14}/> Blockers / Challenges</h4>
                                    <p className="text-sm text-rose-700 bg-rose-50 p-4 rounded-2xl border border-rose-100 leading-relaxed">{viewingReport.blockers}</p>
                                </section>
                            )}
                            <div className="flex gap-4 pt-2">
                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-1">Hours Worked</h4>
                                    <p className="text-lg font-bold text-slate-800">{viewingReport.hoursWorked || 0}h</p>
                                </div>
                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-1">Project</h4>
                                    <p className="text-xs font-bold text-blue-600 truncate">{viewingReport.project?.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-slate-50 flex justify-end">
                            <button onClick={() => setViewModalOpen(false)} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-black transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamReports;