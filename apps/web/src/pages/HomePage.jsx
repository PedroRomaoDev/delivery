import DashboardCards from '../components/DashboardCards';
import Header from '../components/Header';
import OrderStatusChart from '../components/OrderStatusChart';
import RecentOrdersTable from '../components/RecentOrdersTable';
import Sidebar from '../components/SideBar';

const HomePage = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full space-y-6 px-8 py-16">
                <Header subtitle="Dashboard" title="Dashboard" />
                <DashboardCards />

                <div className="grid grid-cols-2 gap-6">
                    <RecentOrdersTable />
                    <OrderStatusChart />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
