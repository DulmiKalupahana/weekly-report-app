import { useState } from 'react';
import API from "../../api/axios";
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/auth/register', formData);
            alert("Registration Successful!");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Error during registration");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0B1120] rounded-2xl mb-4">
                        <UserPlus className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-text-primary">Weekly Report</h1>
                    <p className="text-sm text-text-secondary mt-1">Create your account</p>
                </div>

                <Link
                    to="/"
                    className="inline-block mb-4 text-sm text-primary-600 font-semibold hover:text-primary-700"
                >
                    ← Back to Home
                </Link>

                <form onSubmit={handleSubmit} autoComplete="off" className="p-8 bg-surface shadow-sm rounded-3xl w-full border border-border">
                    <h2 className="text-xl font-bold mb-6 text-text-primary">Register</h2>
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Name"
                                autoComplete="off"
                                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition text-text-primary"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition text-text-primary"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                autoComplete="new-password"
                                className="w-full pl-11 pr-11 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition text-text-primary"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary mb-2">Join as</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                                <select
                                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface outline-none focus:ring-2 focus:ring-primary-500 transition text-text-primary appearance-none cursor-pointer"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="member">Team Member</option>
                                    <option value="manager">Manager / Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-primary-600 text-white p-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-sm disabled:opacity-70"
                        >
                            {submitting ? 'Creating account...' : 'Register'}
                        </button>
                    </div>
                    <p className="mt-6 text-center text-sm text-text-secondary">
                        Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;