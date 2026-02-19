import Header from '../components/Header';
import Sidebar from '../components/SideBar';

const NewOrderPage = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full space-y-6 px-8 py-16">
                <Header subtitle="Criar" title="Novo Pedido" />
                <div className="text-brand-text-gray">
                    Formulário para criar novo pedido será exibido aqui
                </div>
            </div>
        </div>
    );
};

export default NewOrderPage;
