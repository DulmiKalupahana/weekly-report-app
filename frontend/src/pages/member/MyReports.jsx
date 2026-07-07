import { useCallback, useEffect, useMemo, useState, useContext } from 'react'; // useContext එක් කළා
import { submitReport, getMyReports, updateReport, deleteReport } from '../../api/reportService';
import { getProjects } from '../../api/projectService';
import MemberSidebar from '../../components/MemberSidebar';
import { AuthContext } from '../../context/AuthContext'; // Context එක import කළා
import React from 'react';
import {
    Plus, Edit3, Calendar, Folder, Clock, AlertTriangle,
    CheckCircle2, ListTodo, Loader2, X, FileText, Info, Trash2
} from 'lucide-react';

const emptyForm = {
    projectId: '',
    weekStartDate: '',
    weekEndDate: '',
    tasksCompleted: '',
    tasksPlannedNextWeek: '',
    blockers: '',
    hoursWorked: '',
    notes: ''
};

const MAX_TASK_LEN = 1000;
const MAX_BLOCKERS_LEN = 500;
const MAX_NOTES_LEN = 300;
const MAX_HOURS = 80;

const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const MyReports = () => {
    const { user } = useContext(AuthContext); // දැනට ඉන්න User ලබා ගැනීම
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingReport, setViewingReport] = useState(null);

    const [filterProjectId, setFilterProjectId] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setListError('');
        const [reportsResult, projectsResult] = await Promise.allSettled([
            getMyReports(),
            getProjects()
        ]);
        if (reportsResult.status === 'fulfilled') {
            setReports(Array.isArray(reportsResult.value) ? reportsResult.value : []);
        }
        if (projectsResult.status === 'fulfilled') {
            setProjects(Array.isArray(projectsResult.value) ? projectsResult.value : []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // --- මෙතන තමයි assignedProjects නිර්මාණය කරන්නේ ---
    const assignedProjects = useMemo(() => {
        if (!user || !projects.length) return [];
        return projects.filter(project => 
            project.members?.some(member => {
                const memberId = typeof member === 'object' ? member._id : member;
                return memberId === user._id;
            })
        );
    }, [projects, user]);

    const filteredReports = useMemo(() => {
        const monthKey = filterMonth;
        const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
        const toDate = filterDateTo ? new Date(filterDateTo) : null;

        return reports.filter((report) => {
            const reportProjectId = report.project?._id || report.projectId || '';
            if (filterProjectId && reportProjectId !== filterProjectId) return false;
            if (!report.weekStartDate) return false;
            const weekStart = new Date(report.weekStartDate);
            if (monthKey) {
                const reportMonthKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}`;
                if (reportMonthKey !== monthKey) return false;
            }
            if (fromDate && weekStart < fromDate) return false;
            if (toDate && weekStart > toDate) return false;
            return true;
        });
    }, [reports, filterProjectId, filterMonth, filterDateFrom, filterDateTo]);

    const hasActiveFilters = Boolean(filterProjectId || filterMonth || filterDateFrom || filterDateTo);
    const clearFilters = () => {
        setFilterProjectId('');
        setFilterMonth('');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const groupedReports = useMemo(() => {
        const groups = new Map();
        filteredReports.forEach((report) => {
            const weekStart = getWeekStart(report.weekStartDate);
            const key = weekStart.toISOString();
            if (!groups.has(key)) groups.set(key, { weekStart, items: [] });
            groups.get(key).items.push(report);
        });
        return Array.from(groups.values())
            .sort((a, b) => b.weekStart - a.weekStart)
            .map((group) => ({
                ...group,
                items: group.items.sort((a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate))
            }));
    }, [filteredReports]);

    const resetForm = () => {
        setForm(emptyForm);
        setFormErrors({});
        setSubmitError('');
        setIsEditing(false);
        setEditId('');
    };

    const handleOpenCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditForm = (report) => {
        resetForm();
        setIsEditing(true);
        setEditId(report._id);
        setForm({
            projectId: report.project?._id || report.projectId || '',
            weekStartDate: report.weekStartDate ? report.weekStartDate.slice(0, 10) : '',
            weekEndDate: report.weekEndDate ? report.weekEndDate.slice(0, 10) : '',
            tasksCompleted: report.tasksCompleted || '',
            tasksPlannedNextWeek: report.tasksPlannedNextWeek || '',
            blockers: report.blockers || '',
            hoursWorked: report.hoursWorked ?? '',
            notes: report.notes || ''
        });
        setModalOpen(true);
    };

    const handleEditFromCard = (e, report) => {
        e.stopPropagation();
        openEditForm(report);
    };

    const handleDateChange = (e) => {
        const startDateStr = e.target.value;
        if (!startDateStr) return;
        const startDate = new Date(startDateStr);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        setForm((prev) => ({
            ...prev,
            weekStartDate: startDateStr,
            weekEndDate: endDate.toISOString().split('T')[0]
        }));
        setFormErrors((prev) => ({ ...prev, weekStartDate: undefined }));
    };

    const handleEditFromView = () => {
        setViewModalOpen(false);
        openEditForm(viewingReport);
    };

    const handleViewReport = (report) => {
        setViewingReport(report);
        setViewModalOpen(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setModalOpen(false);
        resetForm();
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewingReport(null);
    };

    const handleFieldChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleHoursInput = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            const numValue = parseFloat(value);
            if (value === '' || numValue <= MAX_HOURS) {
                setForm(prev => ({ ...prev, hoursWorked: value }));
                setFormErrors(prev => ({ ...prev, hoursWorked: undefined }));
            }
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.projectId) errors.projectId = 'Required';
        if (!form.weekStartDate) errors.weekStartDate = 'Required';
        if (!form.tasksCompleted.trim()) errors.tasksCompleted = 'Required';
        if (!form.tasksPlannedNextWeek.trim()) errors.tasksPlannedNextWeek = 'Required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDeleteReport = async (e, reportId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                await deleteReport(reportId);
                await fetchAll();
            } catch (err) {
                alert("Failed to delete report.");
            }
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError('');
        const payload = {
            projectId: form.projectId,
            weekStartDate: form.weekStartDate,
            weekEndDate: form.weekEndDate || undefined,
            tasksCompleted: form.tasksCompleted.trim(),
            tasksPlannedNextWeek: form.tasksPlannedNextWeek.trim(),
            blockers: form.blockers.trim(),
            hoursWorked: form.hoursWorked === '' ? undefined : Number(form.hoursWorked),
            notes: form.notes.trim()
        };
        try {
            if (isEditing) await updateReport(editId, payload);
            else await submitReport(payload);
            setModalOpen(false);
            resetForm();
            await fetchAll();
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Error saving report.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <MemberSidebar />
            <div className="ml-64 p-8 w-full max-w-5xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Weekly Reports</h2>
                        <p className="text-slate-500">Track your progress, week by week</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
                    >
                        <Plus size={20} /> New Report
                    </button>
                </div>

                {/* --- FILTER SECTION --- */}
                {!loading && !listError && (
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <ListTodo size={14} /> Filter Reports
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs font-bold text-blue-600 hover:text-blue-700">Clear filters</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Project</label>
                                <select
                                    value={filterProjectId}
                                    onChange={(e) => setFilterProjectId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All assigned projects</option>
                                    {assignedProjects.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Month</label>
                                <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">From date</label>
                                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">To date</label>
                                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>
                )}

                {loading && <div className="text-sm text-slate-500">Loading your reports...</div>}
                {!loading && listError && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{listError}</div>}
                {!loading && !listError && reports.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">No reports yet.</div>}

                <div className="space-y-8">
                    {groupedReports.map((group) => (
                        <section key={group.weekStart.toISOString()}>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <Calendar size={14} /> Week of {formatDate(group.weekStart)}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.items.map((report) => (
                                    <div key={report._id} onClick={() => handleViewReport(report)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 transition cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Folder size={20} /></div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => handleEditFromCard(e, report)} className="p-2 text-slate-400 hover:text-blue-500 transition"><Edit3 size={16} /></button>
                                                <button onClick={(e) => handleDeleteReport(e, report._id)} className="p-2 text-slate-400 hover:text-rose-500 transition"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <h4 className="text-md font-bold text-slate-800 mb-1">{report.project?.name || 'Unknown Project'}</h4>
                                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{report.tasksCompleted}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(report.weekStartDate)}</span>
                                            {report.hoursWorked && <span className="flex items-center gap-1"><Clock size={12} /> {report.hoursWorked}h</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {/* --- ADD / EDIT MODAL --- */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Weekly Report' : 'New Weekly Report'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                            {submitError && <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-sm">{submitError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Project / Category</label>
                                <select
                                    value={form.projectId}
                                    onChange={handleFieldChange('projectId')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.projectId ? 'border-rose-400' : 'border-slate-200'}`}
                                >
                                    <option value="">Select an assigned project...</option>
                                    {assignedProjects.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                                {assignedProjects.length === 0 && !loading && (
                                    <p className="mt-1 text-[10px] text-amber-600 font-medium">⚠️ No projects assigned. Contact manager.</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Week Start</label>
                                    <input type="date" value={form.weekStartDate} max={new Date().toISOString().split('T')[0]} onChange={handleDateChange} className="w-full px-4 py-3 border rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Week End (Auto)</label>
                                    <input type="date" value={form.weekEndDate} readOnly className="w-full px-4 py-3 border rounded-xl bg-slate-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tasks Completed</label>
                                <textarea value={form.tasksCompleted} onChange={handleFieldChange('tasksCompleted')} rows={3} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tasks Planned for Next Week</label>
                                <textarea value={form.tasksPlannedNextWeek} onChange={handleFieldChange('tasksPlannedNextWeek')} rows={3} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Hours Worked</label>
                                    <input type="text" value={form.hoursWorked} onChange={handleHoursInput} placeholder="Max 80" className="w-full px-4 py-3 border rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Notes (optional)</label>
                                    <input type="text" value={form.notes} onChange={handleFieldChange('notes')} className="w-full px-4 py-3 border rounded-xl" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300">
                                {submitting ? 'Submitting...' : isEditing ? 'Save Changes' : 'Submit Report'}
                            </button>
                            <button onClick={closeModal} className="px-6 py-3 font-bold text-slate-500">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Modal logic remains the same... */}
        </div>
    );
};

export default MyReports;