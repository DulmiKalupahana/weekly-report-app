import { useState, useContext } from 'react';
import { AuthContext } from '../../context/auth-context';
import { loginUser } from '../../api/authService';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser({ email, password });
            
            // Backend එකෙන් එන response එකේ user කියල key එකක් නෑ. 
            // ඒ නිසා මුළු response එකම (token එකත් එක්ක) මෙහෙම වෙන් කරගන්න.
            const { token, ...userData } = data;

            // දැන් login function එකට userData පාවිච්චි කරන්න
            login(userData, token);

            // Redirect logic එකේදී database එකේ තියෙන role එක බලන්න
            const role = userData.role?.toLowerCase();
            if (role === 'manager') {
                navigate('/manager-dashboard');
            } else {
                navigate('/member-dashboard');
            }
        } catch {
            alert("Login failed. Check credentials.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-xl w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-green-600">Login</h2>
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg outline-none" onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg outline-none" onChange={(e) => setPassword(e.target.value)} required />
                    <button className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition">Login</button>
                </div>
                <p className="mt-4 text-center text-sm">Don't have an account? <Link to="/register" className="text-green-600 font-bold">Register</Link></p>
            </form>
        </div>
    );
};

export default Login;
