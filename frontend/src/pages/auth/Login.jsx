import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { loginUser } from '../../api/authService';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await loginUser({ email, password });

            const { token, ...userData } = data;

            login(userData, token);

            const role = userData.role?.toLowerCase();
            if (role === 'manager') {
                navigate('/manager-dashboard');
            } else {
                navigate('/member-dashboard');
            }
        } catch {
            alert("Login failed. Check credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0B1120] rounded-2xl mb-4">
                        <LogIn className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-text-primary">Weekly Report</h1>
                    <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
                </div>

                <Link
                    to="/"
                    className="inline-block mb-4 text-sm text-primary-600 font-semibold hover:text-primary-700"
                >
                    ← Back to Home
                </Link>

                <form onSubmit={handleSubmit} className="p-8 bg-surface shadow-sm rounded-3xl w-full border border-border">
                    <h2 className="text-xl font-bold mb-6 text-text-primary">Login</h2>
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition text-text-primary"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="w-full pl-11 pr-11 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition text-text-primary"
                                onChange={(e) => setPassword(e.target.value)}
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
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-primary-600 text-white p-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-sm disabled:opacity-70"
                        >
                            {submitting ? 'Signing in...' : 'Login'}
                        </button>
                    </div>
                    <p className="mt-6 text-center text-sm text-text-secondary">
                        Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;