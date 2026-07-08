import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { submitReport, getMyReports, updateReport, deleteReport } from '../../api/reportService';
import { getProjects } from '../../api/projectService';
import MemberSidebar from '../../components/MemberSidebar';
import { AuthContext } from '../../context/AuthContext';
import React from 'react';
import {
    Plus, Edit3, Calendar, Folder, Clock, AlertTriangle,
    CheckCircle2, ListTodo, Loader2, X, FileText, Trash2
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
    const { user } = useContext(AuthContext);
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
        <div className="flex bg-background min-h-screen font-sans">
            <MemberSidebar />
            <div className="ml-0 md:ml-64 p-4 pt-20 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Weekly Reports</h2>
                        <p className="text-text-secondary">Track your progress, week by week</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition shadow-lg shadow-primary-900/10 w-full sm:w-auto justify-center"
                    >
                        <Plus size={20} /> New Report
                    </button>
                </div>

                {/* --- FILTER SECTION --- */}
                {!loading && !listError && (
                    <div className="bg-surface border border-border rounded-2xl shadow-sm p-5 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                <ListTodo size={14} /> Filter Reports
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs font-bold text-primary-600 hover:text-primary-700">Clear filters</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Project</label>
                                <select
                                    value={filterProjectId}
                                    onChange={(e) => setFilterProjectId(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All assigned projects</option>
                                    {assignedProjects.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Month</label>
                                <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">From date</label>
                                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">To date</label>
                                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>
                )}

                {loading && <div className="text-sm text-text-secondary">Loading your reports...</div>}
                {!loading && listError && <div className="mb-6 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">{listError}</div>}
                {!loading && !listError && reports.length === 0 && <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center text-text-secondary">No reports yet.</div>}

                <div className="space-y-8">
                    {groupedReports.map((group) => (
                        <section key={group.weekStart.toISOString()}>
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <Calendar size={14} /> Week of {formatDate(group.weekStart)}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {group.items.map((report) => (
                                    <div key={report._id} onClick={() => handleViewReport(report)} className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:border-primary-300 transition cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-primary-50 p-3 rounded-xl text-primary-600"><Folder size={20} /></div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => handleEditFromCard(e, report)} className="p-2 text-text-muted hover:text-primary-500 transition"><Edit3 size={16} /></button>
                                                <button onClick={(e) => handleDeleteReport(e, report._id)} className="p-2 text-text-muted hover:text-danger-500 transition"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <h4 className="text-md font-bold text-text-primary mb-1">{report.project?.name || 'Unknown Project'}</h4>
                                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{report.tasksCompleted}</p>
                                        <div className="flex items-center gap-4 text-xs text-text-muted">
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
                <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-text-primary">{isEditing ? 'Edit Weekly Report' : 'New Weekly Report'}</h3>
                            <button onClick={closeModal} className="text-text-muted hover:text-text-primary"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                            {submitError && <div className="bg-danger-50 text-danger-600 p-3 rounded-xl text-sm">{submitError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-text-primary mb-2">Project / Category</label>
                                <select
                                    value={form.projectId}
                                    onChange={handleFieldChange('projectId')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${formErrors.projectId ? 'border-danger-400' : 'border-border'}`}
                                >
                                    <option value="">Select an assigned project...</option>
                                    {assignedProjects.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                                {assignedProjects.length === 0 && !loading && (
                                    <p className="mt-1 text-[10px] text-warning-600 font-medium">⚠️ No projects assigned. Contact manager.</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-primary mb-2">Week Start</label>
                                    <input type="date" value={form.weekStartDate} max={new Date().toISOString().split('T')[0]} onChange={handleDateChange} className="w-full px-4 py-3 border border-border rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-primary mb-2">Week End (Auto)</label>
                                    <input type="date" value={form.weekEndDate} readOnly className="w-full px-4 py-3 border border-border rounded-xl bg-surface-secondary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-primary mb-2">Tasks Completed</label>
                                <textarea value={form.tasksCompleted} onChange={handleFieldChange('tasksCompleted')} rows={3} className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-primary mb-2">Tasks Planned for Next Week</label>
                                <textarea value={form.tasksPlannedNextWeek} onChange={handleFieldChange('tasksPlannedNextWeek')} rows={3} className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-primary mb-2">Blockers / Challenges (optional)</label>
                                <textarea
                                    value={form.blockers}
                                    onChange={handleFieldChange('blockers')}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Any issues or blockers..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-primary mb-2">Hours Worked</label>
                                    <input type="text" value={form.hoursWorked} onChange={handleHoursInput} placeholder="Max 80" className="w-full px-4 py-3 border border-border rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-primary mb-2">Notes (optional)</label>
                                    <input type="text" value={form.notes} onChange={handleFieldChange('notes')} className="w-full px-4 py-3 border border-border rounded-xl" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-surface-secondary flex gap-3">
                            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:bg-border">
                                {submitting ? 'Submitting...' : isEditing ? 'Save Changes' : 'Submit Report'}
                            </button>
                            <button onClick={closeModal} className="px-6 py-3 font-bold text-text-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VIEW DETAILS MODAL --- */}
            {viewModalOpen && viewingReport && (
                <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={closeViewModal}>
                    <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-primary-600 p-8 text-white relative">
                            <button onClick={closeViewModal} className="absolute top-6 right-6 text-white/80 hover:text-white">
                                <X size={24} />
                            </button>
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <Folder size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">{viewingReport.project?.name || 'Unknown Project'}</h3>
                            <p className="text-primary-100 text-sm mt-1 flex items-center gap-2">
                                <Calendar size={14} /> {formatDate(viewingReport.weekStartDate)}
                                {viewingReport.weekEndDate ? ` – ${formatDate(viewingReport.weekEndDate)}` : ''}
                            </p>
                        </div>

                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                            <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Tasks Completed
                                </h4>
                                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">{viewingReport.tasksCompleted}</p>
                            </section>

                            <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                    <ListTodo size={14} /> Tasks Planned for Next Week
                                </h4>
                                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">{viewingReport.tasksPlannedNextWeek}</p>
                            </section>

                            {viewingReport.blockers && (
                                <section>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Blockers / Challenges
                                    </h4>
                                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">{viewingReport.blockers}</p>
                                </section>
                            )}

                            {viewingReport.notes && (
                                <section>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                        <FileText size={14} /> Notes / Links
                                    </h4>
                                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">{viewingReport.notes}</p>
                                </section>
                            )}

                            {(viewingReport.hoursWorked || viewingReport.hoursWorked === 0) && (
                                <section>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                        <Clock size={14} /> Hours Worked
                                    </h4>
                                    <p className="text-text-primary font-bold">{viewingReport.hoursWorked}h</p>
                                </section>
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-surface-secondary">
                            <button onClick={handleEditFromView} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-primary-600 hover:bg-primary-100 transition text-sm">
                                <Edit3 size={16} /> Edit Report
                            </button>
                            <button onClick={closeViewModal} className="bg-text-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-900 transition text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReports;