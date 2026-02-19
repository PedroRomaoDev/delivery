import Header from '../components/Header';
import Sidebar from '../components/SideBar';

const OrdersPage = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full space-y-6 px-8 py-16">
                <Header subtitle="Pedidos" title="Todos os Pedidos" />
                <div className="text-brand-text-gray">
                    Lista de todos os pedidos será exibida aqui
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
