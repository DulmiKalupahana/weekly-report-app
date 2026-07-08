import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MemberSidebar from '../components/MemberSidebar';
import ManagerSidebar from '../components/ManagerSidebar';
import {
    Mail,
    ShieldCheck,
    Pencil,
    Save,
    KeyRound,
    Eye,
    EyeOff,
    X
} from 'lucide-react';


const Profile = () => {

    const { user } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        newPassword: '',
        confirmPassword: ''
    });


    const [error, setError] = useState('');



    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError('');

    };



    const handleSave = () => {

        if(formData.newPassword !== formData.confirmPassword){

            setError("Passwords do not match");
            return;

        }


        console.log(formData);

        setIsEditing(false);

    };




    return (

        <div className="min-h-screen bg-[#f8fafc] flex">


            {
                user?.role === "manager"
                ?
                <ManagerSidebar/>
                :
                <MemberSidebar/>
            }



            <div className="ml-64 w-full p-8">


                <div className="max-w-4xl mx-auto">


                    {/* Page Title */}

                    <div className="mb-8">

                        <h1 className="text-2xl font-bold text-slate-900">
                            My Profile
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage your account information and security settings
                        </p>

                    </div>




                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


                        {/* Header */}

                        <div className="h-28 bg-[#0B1120] relative">


                            <div className="absolute left-8 -bottom-12">

                                <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">

                                    {user?.name?.charAt(0)}

                                </div>

                            </div>


                        </div>




                        <div className="p-8 pt-16">



                            {!isEditing ? (


                                <>



                                <div className="flex justify-between items-start mb-8">


                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">
                                            {user?.name}
                                        </h2>


                                        <p className="text-sm text-slate-500 capitalize mt-1">
                                            {user?.role}
                                        </p>


                                    </div>



                                    <button

                                        onClick={()=>setIsEditing(true)}

                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"

                                    >

                                        <Pencil size={16}/>
                                        Edit

                                    </button>


                                </div>





                                <div className="grid md:grid-cols-2 gap-5">


                                    <div className="border border-slate-200 rounded-xl p-5 flex gap-4">


                                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">

                                            <Mail size={20}/>

                                        </div>



                                        <div>

                                            <p className="text-xs text-slate-400 uppercase font-semibold">
                                                Email
                                            </p>

                                            <p className="font-medium text-slate-800 mt-1">
                                                {user?.email}
                                            </p>

                                        </div>


                                    </div>





                                    <div className="border border-slate-200 rounded-xl p-5 flex gap-4">


                                        <div className="w-11 h-11 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">

                                            <ShieldCheck size={20}/>

                                        </div>



                                        <div>

                                            <p className="text-xs text-slate-400 uppercase font-semibold">
                                                Role
                                            </p>


                                            <p className="font-medium text-slate-800 mt-1 capitalize">
                                                {user?.role}
                                            </p>


                                        </div>


                                    </div>


                                </div>


                                </>



                            ) : (



                                <>



                                <div className="flex justify-between mb-6">

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Edit Profile
                                    </h2>


                                    <button

                                    onClick={()=>setShowPassword(!showPassword)}

                                    className="text-slate-500 hover:text-blue-600"

                                    >

                                    {
                                        showPassword
                                        ?
                                        <EyeOff size={20}/>
                                        :
                                        <Eye size={20}/>
                                    }


                                    </button>


                                </div>




                                {
                                    error &&

                                    <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-lg flex gap-2 text-sm">

                                        <X size={18}/>
                                        {error}

                                    </div>

                                }




                                <div className="space-y-5">


                                    <input

                                    name="name"

                                    value={formData.name}

                                    onChange={handleChange}

                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

                                    />



                                    <input

                                    name="email"

                                    value={formData.email}

                                    onChange={handleChange}

                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

                                    />





                                    <div className="bg-slate-50 p-5 rounded-xl">


                                        <div className="flex gap-2 items-center mb-4 text-blue-600">

                                            <KeyRound size={18}/>
                                            <span className="font-semibold text-sm">
                                                Change Password
                                            </span>

                                        </div>



                                        <div className="grid md:grid-cols-2 gap-4">


                                            <input
                                            type={showPassword?"text":"password"}
                                            name="newPassword"
                                            placeholder="New Password"
                                            onChange={handleChange}
                                            className="border rounded-lg px-4 py-3"
                                            />


                                            <input
                                            type={showPassword?"text":"password"}
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            onChange={handleChange}
                                            className="border rounded-lg px-4 py-3"
                                            />


                                        </div>


                                    </div>



                                </div>





                                <div className="flex gap-3 mt-8">


                                    <button

                                    onClick={handleSave}

                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex gap-2 items-center hover:bg-blue-700"

                                    >

                                    <Save size={18}/>
                                    Save

                                    </button>



                                    <button

                                    onClick={()=>setIsEditing(false)}

                                    className="px-6 py-3 text-slate-600"

                                    >

                                    Cancel

                                    </button>


                                </div>


                                </>


                            )}


                        </div>


                    </div>


                </div>


            </div>


        </div>

    );

};


export default Profile;