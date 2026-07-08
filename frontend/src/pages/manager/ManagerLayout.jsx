import ManagerSidebar from '../../components/ManagerSidebar';

const ManagerLayout = ({ children }) => {
    return (
        <div className="flex bg-background min-h-screen">
            <ManagerSidebar />
            <main className="ml-0 md:ml-64 p-4 pt-20 md:p-10 w-full">
                {children}
            </main>
        </div>
    );
};

export default ManagerLayout;