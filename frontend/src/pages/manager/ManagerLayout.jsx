import ManagerSidebar from '../../components/ManagerSidebar';

const ManagerLayout = ({ children }) => {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <ManagerSidebar />
            <main className="ml-64 p-10 w-full">
                {children}
            </main>
        </div>
    );
};

export default ManagerLayout;