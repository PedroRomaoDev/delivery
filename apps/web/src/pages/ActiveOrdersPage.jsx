import Header from '../components/Header';
import Sidebar from '../components/SideBar';

const ActiveOrdersPage = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full space-y-6 px-8 py-16">
                <Header subtitle="Status" title="Pedidos em Andamento" />
                <div className="text-brand-text-gray">
                    Pedidos RECEIVED, CONFIRMED e DISPATCHED serão exibidos aqui
                </div>
            </div>
        </div>
    );
};

export default ActiveOrdersPage;
