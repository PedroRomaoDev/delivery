import Header from '../components/Header';
import Sidebar from '../components/SideBar';

const OrderHistoryPage = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full space-y-6 px-8 py-16">
                <Header subtitle="Histórico" title="Histórico de Pedidos" />
                <div className="text-brand-text-gray">
                    Pedidos DELIVERED e CANCELED serão exibidos aqui
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryPage;
