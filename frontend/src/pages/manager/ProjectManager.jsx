import { useCallback, useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projectService';
import ManagerSidebar from '../../components/ManagerSidebar';
import { Plus, Edit3, Trash2, UserPlus, Folder, Users } from 'lucide-react';

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState("");
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchProjects = useCallback(async () => {
        try {
            const data = await getProjects();
            setProjects(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            console.error("Failed to fetch projects", err);
            setError("Could not load projects. Please check the backend connection and try again.");
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        Promise.resolve().then(() => {
            if (active) fetchProjects();
        });

        return () => {
            active = false;
        };
    }, [fetchProjects]);

    const resetForm = () => {
        setNewProject("");
        setEditId("");
        setEditName("");
        setIsEditing(false);
    };

    const handleStartEdit = (project) => {
        setIsEditing(true);
        setEditId(project._id);
        setEditName(project.name);
        setNewProject(project.name);
        setError("");
    };

    const handleSubmit = async () => {
        const projectName = newProject.trim();
        if (!projectName) return;
        setSubmitting(true);
        setError("");

        try {
            if (isEditing) {
                // ✅ මෙසේ object එකක් ලෙස යවන්න: { name: projectName }
                await updateProject(editId, { name: projectName });
            } else {
                // ✅ මෙසේ object එකක් ලෙස යවන්න: { name: projectName }
                await createProject({ name: projectName });
            }
            resetForm();
            await fetchProjects(); // List එක refresh කරන්න
            alert(`Project ${isEditing ? "updated" : "added"} successfully!`);
        } catch (err) {
            console.error("Error saving project", err);
            // Error එක හරියටම බලාගන්න alert එකක් දාන්න
            alert(err.response?.data?.message || "Error saving project");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        setSubmitting(true);
        setError("");

        try {
            await deleteProject(id);
            if (id === editId) resetForm();
            await fetchProjects();
        } catch (err) {
            console.error("Error deleting project", err);
            setError("Error deleting project. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const submitDisabled = submitting
        || !newProject.trim()
        || (isEditing && newProject.trim() === editName.trim());

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <ManagerSidebar />
            <div className="ml-64 p-8 w-full">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Project Management</h2>
                        <p className="text-slate-500">Add and manage work categories for the team</p>
                    </div>
                </div>

                {/* Add/Edit Project Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Folder className="absolute left-3 top-3 text-slate-400" size={20}/>
                        <input 
                            type="text" 
                            placeholder={isEditing ? "Update Project or Category Name..." : "Enter New Project or Category Name..."}
                            className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={newProject}
                            onChange={(e) => setNewProject(e.target.value)}
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitDisabled}
                        className="bg-blue-600 disabled:bg-slate-400 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        {isEditing ? <Edit3 size={20}/> : <Plus size={20}/>}
                        {isEditing ? "Update Project" : "Add Project"}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={submitting}
                            className="bg-slate-100 disabled:bg-slate-50 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Projects List Grid */}
                {loading && <div className="text-sm text-slate-500">Loading projects...</div>}
                {!loading && error && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}
                {!loading && !error && projects.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
                        No projects yet. Add the first project above.
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                        const memberCount = Array.isArray(project.members)
                            ? project.members.length
                            : Number(project.members) || 0;

                        return (
                            <div key={project._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                        <Folder size={24}/>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(project)}
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit3 size={18}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(project._id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{project.name}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <Users size={14}/> {memberCount} Team Members Assigned
                                </p>
                                <button className="mt-5 w-full py-2 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-100 hover:bg-slate-100 flex items-center justify-center gap-2">
                                    <UserPlus size={14}/> Assign Members
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectManager;
