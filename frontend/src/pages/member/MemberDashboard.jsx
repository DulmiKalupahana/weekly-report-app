import { useState, useEffect } from 'react';
import { submitReport, getMyReports } from '../../api/reportService';
import API from '../../api/axios';

const MemberDashboard = () => {
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        projectId: '', weekStartDate: '', tasksCompleted: '', 
        tasksPlannedNextWeek: '', blockers: '', hoursWorked: 0
    });

    useEffect(() => {
        fetchData();
        // Load projects for the dropdown
        API.get('/projects').then(res => setProjects(res.data));
    }, []);

    const fetchData = async () => {
        const data = await getMyReports();
        setReports(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitReport(formData);
        alert("Report Submitted!");
        setFormData({ projectId: '', weekStartDate: '', tasksCompleted: '', tasksPlannedNextWeek: '', blockers: '', hoursWorked: 0 });
        fetchData();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Weekly Work Report</h1>
            
            {/* Report Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <select className="border p-2 rounded" required onChange={e => setFormData({...formData, projectId: e.target.value})}>
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <input type="date" className="border p-2 rounded" required onChange={e => setFormData({...formData, weekStartDate: e.target.value})} />
                </div>
                <textarea placeholder="Tasks Completed" className="w-full border p-2 rounded" required onChange={e => setFormData({...formData, tasksCompleted: e.target.value})} />
                <textarea placeholder="Tasks Planned for Next Week" className="w-full border p-2 rounded" required onChange={e => setFormData({...formData, tasksPlannedNextWeek: e.target.value})} />
                <textarea placeholder="Blockers / Challenges" className="w-full border p-2 rounded" required onChange={e => setFormData({...formData, blockers: e.target.value})} />
                <input type="number" placeholder="Hours Worked" className="border p-2 rounded w-full" onChange={e => setFormData({...formData, hoursWorked: e.target.value})} />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Submit Report</button>
            </form>

            {/* History List */}
            <h2 className="text-xl font-bold mb-4">My Report History</h2>
            <div className="space-y-4">
                {reports.map(report => (
                    <div key={report._id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between font-bold text-blue-600">
                            <span>{report.project?.name}</span>
                            <span>{new Date(report.weekStartDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-2"><b>Completed:</b> {report.tasksCompleted}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemberDashboard;