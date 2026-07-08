import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projectService';
import { searchMembers } from '../../api/userService';
import ManagerSidebar from '../../components/ManagerSidebar';
import { Plus, Edit3, Trash2, UserPlus, Folder, Users, X, Search, Loader2, Info } from 'lucide-react';

const emptyForm = { name: '', description: '' };

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [assignOnly, setAssignOnly] = useState(false);
    const [editId, setEditId] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingProject, setViewingProject] = useState(null);

    const [selectedMembers, setSelectedMembers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [memberQuery, setMemberQuery] = useState('');
    const [memberLoading, setMemberLoading] = useState(false);
    const [memberLoadError, setMemberLoadError] = useState('');

    const fetchProjects = useCallback(async () => {
        try {
            const data = await getProjects();
            setProjects(Array.isArray(data) ? data : []);
            setListError('');
        } catch (err) {
            console.error('Failed to fetch projects', err);
            setListError('Could not load projects. Please try again.');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (!modalOpen) return;

        let active = true;
        setMemberLoading(true);
        setMemberLoadError('');

        searchMembers('')
            .then((results) => {
                if (active) setAllMembers(Array.isArray(results) ? results : []);
            })
            .catch((err) => {
                console.error('Failed to load members', err);
                if (active) {
                    setAllMembers([]);
                    setMemberLoadError('Could not load team members. Check your connection and try again.');
                }
            })
            .finally(() => {
                if (active) setMemberLoading(false);
            });

        return () => { active = false; };
    }, [modalOpen]);

    const availableMembers = useMemo(() => {
        const selectedIds = new Set(selectedMembers.map((m) => m._id));
        const q = memberQuery.trim().toLowerCase();

        return allMembers.filter((u) => {
            if (selectedIds.has(u._id)) return false;
            if (!q) return true;
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        });
    }, [allMembers, memberQuery, selectedMembers]);

    const resetForm = () => {
        setForm(emptyForm);
        setFormErrors({});
        setSubmitError('');
        setIsEditing(false);
        setAssignOnly(false);
        setEditId('');
        setSelectedMembers([]);
        setMemberQuery('');
        setAllMembers([]);
        setMemberLoadError('');
    };

    const handleOpenCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (project, { assignOnlyMode = false } = {}) => {
        resetForm();
        setIsEditing(true);
        setAssignOnly(assignOnlyMode);
        setEditId(project._id);
        setForm({ name: project.name || '', description: project.description || '' });
        setSelectedMembers(Array.isArray(project.members) ? project.members : []);
        setModalOpen(true);
    };

    const handleStartEdit = (e, project) => {
        e.stopPropagation();
        openEditModal(project, { assignOnlyMode: false });
    };

    const handleAssignMembers = (e, project) => {
        if (e) e.stopPropagation();
        setViewModalOpen(false);
        openEditModal(project, { assignOnlyMode: true });
    };

    const handleViewProject = (project) => {
        setViewingProject(project);
        setViewModalOpen(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setModalOpen(false);
        resetForm();
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewingProject(null);
    };

    const handleFieldChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const addMember = (user) => {
        setSelectedMembers((prev) => [...prev, user]);
    };

    const removeMember = (userId) => {
        setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
    };

    const validate = () => {
        const errors = {};

        if (!assignOnly) {
            const name = form.name.trim();
            if (!name) {
                errors.name = 'Project name is required.';
            } else if (name.length < 2) {
                errors.name = 'Project name must be at least 2 characters.';
            } else if (name.length > 60) {
                errors.name = 'Project name must be under 60 characters.';
            } else {
                const isDuplicate = projects.some((p) =>
                    p.name.trim().toLowerCase() === name.toLowerCase() && p._id !== editId
                );
                if (isDuplicate) errors.name = 'A project with this name already exists.';
            }

            if (form.description.trim().length > 300) {
                errors.description = 'Description must be under 300 characters.';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError('');

        const payload = assignOnly
            ? { members: selectedMembers.map((m) => m._id) }
            : {
                name: form.name.trim(),
                description: form.description.trim(),
                members: selectedMembers.map((m) => m._id)
            };

        try {
            if (isEditing) await updateProject(editId, payload);
            else await createProject(payload);
            setModalOpen(false);
            resetForm();
            await fetchProjects();
        } catch (err) {
            console.error('Error saving project', err);
            setSubmitError(err.response?.data?.message || 'Error saving project.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Delete this project?')) return;
        try {
            await deleteProject(id);
            await fetchProjects();
        } catch (err) {
            console.error('Error deleting project', err);
            alert(err.response?.data?.message || 'Error deleting project.');
        }
    };

    return (
        <div className="flex bg-background min-h-screen font-sans">
            <ManagerSidebar />
            <div className="ml-0 md:ml-64 p-4 pt-20 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Project Management</h2>
                        <p className="text-text-secondary">Manage work categories and teams</p>
                    </div>
                    <button onClick={handleOpenCreate} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition shadow-lg shadow-primary-900/10 w-full sm:w-auto justify-center">
                        <Plus size={20} /> Add Project
                    </button>
                </div>

                {loading && <div className="text-sm text-text-secondary">Loading projects...</div>}
                {!loading && listError && (
                    <div className="mb-6 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                        {listError}
                    </div>
                )}
                {!loading && !listError && projects.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center text-text-secondary">
                        No projects yet. Add the first project above.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => handleViewProject(project)}
                            className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:border-primary-300 hover:shadow-md transition cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                                    <Folder size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => handleStartEdit(e, project)} className="p-2 text-text-muted hover:text-primary-500 hover:bg-primary-50 rounded-lg transition">
                                        <Edit3 size={18} />
                                    </button>
                                    <button onClick={(e) => handleDelete(e, project._id)} className="p-2 text-text-muted hover:text-danger-500 hover:bg-danger-50 rounded-lg transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-1">{project.name}</h3>
                            <p className="text-sm text-text-secondary mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-4">
                                <Users size={14} /> {project.members?.length || 0} Members Assigned
                            </div>
                            <button
                                onClick={(e) => handleAssignMembers(e, project)}
                                className="w-full py-2 bg-surface-secondary text-text-secondary text-xs font-bold uppercase tracking-wider rounded-lg border border-border hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 flex items-center justify-center gap-2 transition"
                            >
                                <UserPlus size={14} /> Assign Members
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-text-primary">
                                {assignOnly ? `Assign Members — ${form.name}` : isEditing ? 'Edit Project' : 'New Project'}
                            </h3>
                            <button onClick={closeModal} className="text-text-muted hover:text-text-primary"><X size={24} /></button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {submitError && (
                                <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-2 text-sm text-danger-600">
                                    {submitError}
                                </div>
                            )}

                            {!assignOnly && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-text-primary mb-2">Project Name</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={handleFieldChange('name')}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${formErrors.name ? 'border-danger-400' : 'border-border'}`}
                                        />
                                        {formErrors.name && <p className="mt-1 text-xs text-danger-600">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text-primary mb-2">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={handleFieldChange('description')}
                                            rows={3}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none ${formErrors.description ? 'border-danger-400' : 'border-border'}`}
                                        />
                                        {formErrors.description && <p className="mt-1 text-xs text-danger-600">{formErrors.description}</p>}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-text-primary mb-2">
                                    {assignOnly ? 'Search & select members' : 'Assign Members'}
                                </label>

                                {selectedMembers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedMembers.map((m) => (
                                            <span key={m._id} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                                {m.name} <X size={14} className="cursor-pointer" onClick={() => removeMember(m._id)} />
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-text-muted" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={memberQuery}
                                        onChange={(e) => setMemberQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400"
                                    />
                                </div>

                                <div className="mt-3 border border-border rounded-xl max-h-48 overflow-y-auto bg-surface shadow-inner">
                                    {memberLoading ? (
                                        <div className="p-4 text-center text-text-muted">
                                            <Loader2 className="animate-spin inline mr-2" size={18} /> Loading members...
                                        </div>
                                    ) : memberLoadError ? (
                                        <p className="p-4 text-center text-xs text-danger-500 font-medium">{memberLoadError}</p>
                                    ) : availableMembers.length > 0 ? (
                                        availableMembers.map((user) => (
                                            <div key={user._id} onClick={() => addMember(user)} className="flex justify-between items-center p-3 hover:bg-surface-secondary cursor-pointer transition border-b border-border-light last:border-0">
                                                <div>
                                                    <p className="text-sm font-bold text-text-primary">{user.name}</p>
                                                    <p className="text-xs text-text-muted">{user.email}</p>
                                                </div>
                                                <Plus size={18} className="text-primary-500" />
                                            </div>
                                        ))
                                    ) : memberQuery.trim() ? (
                                        <p className="p-4 text-center text-xs text-text-muted font-medium">No matching members found.</p>
                                    ) : allMembers.length === 0 ? (
                                        <p className="p-4 text-center text-xs text-text-muted font-medium">
                                            No team members available. Register team members with the "member" role first.
                                        </p>
                                    ) : (
                                        <p className="p-4 text-center text-xs text-text-muted font-medium">All members already assigned.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-surface-secondary flex gap-3">
                            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:bg-border flex items-center justify-center gap-2">
                                {submitting && <Loader2 size={18} className="animate-spin" />}
                                {assignOnly ? 'Save Members' : isEditing ? 'Save Changes' : 'Create Project'}
                            </button>
                            <button onClick={closeModal} disabled={submitting} className="px-6 py-3 font-bold text-text-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {viewModalOpen && viewingProject && (
                <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeViewModal}>
                    <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-primary-600 p-8 text-white relative">
                            <button onClick={closeViewModal} className="absolute top-6 right-6 text-white/80 hover:text-white"><X size={24} /></button>
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <Folder size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">{viewingProject.name}</h3>
                            <p className="text-primary-100 text-sm mt-1">Project Details & Team</p>
                        </div>

                        <div className="p-8 space-y-8">
                            <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                    <Info size={14} /> Description
                                </h4>
                                <p className="text-text-secondary leading-relaxed">
                                    {viewingProject.description || "No description provided for this project."}
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                        <Users size={14} /> Assigned Team Members ({viewingProject.members?.length || 0})
                                    </h4>
                                    <button
                                        onClick={(e) => handleAssignMembers(e, viewingProject)}
                                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                        <UserPlus size={14} /> Assign Members
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {viewingProject.members && viewingProject.members.length > 0 ? (
                                        viewingProject.members.map((m) => (
                                            <div key={m._id} className="flex items-center gap-3 p-3 bg-surface-secondary rounded-xl border border-border">
                                                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text-primary">{m.name}</p>
                                                    <p className="text-xs text-text-secondary">{m.email}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-text-muted italic">No members assigned yet.</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end">
                            <button onClick={closeViewModal} className="bg-text-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-900 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManager;