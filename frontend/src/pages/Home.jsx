import { Link } from "react-router-dom";
import { FileText, Users, BarChart3 } from "lucide-react";

const Home = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">

            {/* Navbar */}
            <nav className="w-full px-8 py-5 flex justify-between items-center bg-white border-b border-border">
                <h1 className="text-xl font-bold text-text-primary">
                    Weekly Report
                </h1>

                <div className="flex gap-3">
                    <Link
                        to="/login"
                        className="px-5 py-2 rounded-xl border border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="px-5 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
                    >
                        Register
                    </Link>
                </div>
            </nav>


            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-6">
                <div className="text-center max-w-3xl">

                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-600 mb-6">
                        <FileText className="text-white" size={38}/>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
                        Manage Your Weekly Reports
                        <br />
                        <span className="text-primary-600">
                            Easily & Efficiently
                        </span>
                    </h2>

                    <p className="mt-5 text-text-secondary text-lg">
                        A simple platform for team members and managers
                        to submit, track and analyze weekly progress reports.
                    </p>


                    <div className="mt-8 flex justify-center gap-4">

                        <Link
                            to="/register"
                            className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg"
                        >
                            Get Started
                        </Link>

                        <Link
                            to="/login"
                            className="px-8 py-3 rounded-xl border border-border bg-white text-text-primary font-bold hover:bg-surface-secondary transition"
                        >
                            Login
                        </Link>

                    </div>

                </div>
            </section>


            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-10 max-w-5xl mx-auto w-full">

                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <Users className="text-primary-600 mb-3"/>
                    <h3 className="font-bold text-text-primary">
                        Team Management
                    </h3>
                    <p className="text-sm text-text-secondary mt-2">
                        Manage team members and projects easily.
                    </p>
                </div>


                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <FileText className="text-primary-600 mb-3"/>
                    <h3 className="font-bold text-text-primary">
                        Weekly Reports
                    </h3>
                    <p className="text-sm text-text-secondary mt-2">
                        Submit and track weekly progress reports.
                    </p>
                </div>


                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <BarChart3 className="text-primary-600 mb-3"/>
                    <h3 className="font-bold text-text-primary">
                        Analytics
                    </h3>
                    <p className="text-sm text-text-secondary mt-2">
                        View insights and team performance.
                    </p>
                </div>

            </section>

        </div>
    );
};

export default Home;