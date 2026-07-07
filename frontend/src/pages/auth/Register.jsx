import { useState } from 'react';
import API from "../../api/axios";
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Team Member' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData); // Backend එකේ route එක බලන්න
            alert("Registration Successful!");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Error during registration");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-xl w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Register</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-3 border rounded-lg" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Join as:</label>
                        <select className="w-full p-3 border rounded-lg bg-white" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                            <option value="member">Team Member</option>
                            <option value="manager">Manager / Admin</option>
                        </select>
                    </div>

                    <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">Register</button>
                </div>
                <p className="mt-4 text-center text-sm">Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login</Link></p>
            </form>
        </div>
    );
};

export default Register;