import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { getProjects } from '../../api/projectService';
import { getMyReports } from '../../api/reportService';
import MemberSidebar from '../../components/MemberSidebar';
import { AuthContext } from '../../context/AuthContext';
import {
    Folder, Users, X, Search, Info, Briefcase,
    LayoutGrid, ListFilter, Calendar, FileText
} from 'lucide-react';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const MyProjects = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // View Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingProject, setViewingProject] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [projectsResult, reportsResult] = await Promise.allSettled([
            getProjects(),
            getMyReports()
        ]);

        if (projectsResult.status === 'fulfilled') {
            setAllProjects(Array.isArray(projectsResult.value) ? projectsResult.value : []);
            setListError('');
        } else {
            console.error('Failed to fetch projects', projectsResult.reason);
            setListError('Could not load assigned projects.');
            setAllProjects([]);
        }

        if (reportsResult.status === 'fulfilled') {
            setReports(Array.isArray(reportsResult.value) ? reportsResult.value : []);
        } else {
            console.error('Failed to fetch reports', reportsResult.reason);
            setReports([]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Backend returns every project, so only keep the ones the current user is actually assigned to
    const projects = useMemo(() => {
        if (!user?._id) return [];
        return allProjects.filter((p) =>
            Array.isArray(p.members) && p.members.some((m) => m._id === user._id)
        );
    }, [allProjects, user]);

    // Search Filter Logic
    const filteredProjects = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return projects;
        return projects.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    }, [projects, searchQuery]);

    // Reports the current user has submitted for the project currently being viewed
    const projectReports = useMemo(() => {
        if (!viewingProject) return [];
        return reports
            .filter((r) => (r.project?._id || r.projectId) === viewingProject._id)
            .sort((a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate));
    }, [reports, viewingProject]);

    const handleViewProject = (project) => {
        setViewingProject(project);
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewingProject(null);
    };

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <MemberSidebar />
            <div className="ml-64 p-8 w-full max-w-7xl">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase className="text-blue-600" /> My Assigned Projects
                        </h2>
                        <p className="text-slate-500 text-sm">Projects you are currently working on</p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading your projects...</div>
                ) : listError ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm">
                        {listError}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                        <Folder size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No projects found.</p>
                    </div>
                ) : (
                    /* Project Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project._id}
                                onClick={() => handleViewProject(project)}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Folder size={24} />
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                        Active
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                                    {project.description || 'No description provided.'}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <Users size={14} /> {project.members?.length || 0} Team Members
                                    </div>
                                    <span className="text-blue-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Details <LayoutGrid size={12} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- VIEW DETAILS MODAL --- */}
            {viewModalOpen && viewingProject && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeViewModal}>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="bg-blue-600 p-8 text-white relative">
                            <button onClick={closeViewModal} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                                <Folder size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">{viewingProject.name}</h3>
                            <p className="text-blue-100 text-sm mt-1">Full Project Overview</p>
                        </div>

                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                            {/* Description Section */}
                            <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                    <Info size={14} /> Project Description
                                </h4>
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {viewingProject.description || "No specific description has been provided for this project."}
                                </p>
                            </section>

                            {/* Team Members Section */}
                            <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Users size={14} /> Your Teammates ({viewingProject.members?.length || 0})
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {viewingProject.members && viewingProject.members.length > 0 ? (
                                        viewingProject.members.map((m) => (
                                            <div key={m._id} className={`flex items-center gap-3 p-3 rounded-2xl border ${m._id === user?._id ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${m._id === user?._id ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {m.name} {m._id === user?._id && <span className="text-[10px] ml-2 text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">YOU</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{m.email}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No members assigned to this project.</p>
                                    )}
                                </div>
                            </section>

                            {/* Reports submitted for this project */}
                            <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <FileText size={14} /> Your Reports ({projectReports.length})
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {projectReports.length > 0 ? (
                                        projectReports.map((r) => (
                                            <div key={r._id} className="p-3 rounded-2xl border border-slate-100 bg-white">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                                                    <Calendar size={12} /> Week of {formatDate(r.weekStartDate)}
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                                    {r.tasksCompleted}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No reports submitted for this project yet.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProjects;