import ManagerSidebar from '../../components/ManagerSidebar';
import AiChatWidget from '../../components/AiChatWidget';

const ManagerLayout = ({ children }) => {
    return (
        <div className="flex bg-background min-h-screen">
            <ManagerSidebar />
            <main className="ml-0 md:ml-64 p-4 pt-20 md:p-10 w-full">
                {children}
            </main>
            <AiChatWidget />
        </div>
    );
};

export default ManagerLayout;