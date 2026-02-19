import {
    ArchiveIcon,
    HomeIcon,
    PackageIcon,
    PlusIcon,
    TruckIcon,
} from '../assets/icons';
import SidebarButton from './SidebarButton';

const Sidebar = () => {
    return (
        <div className="h-screen w-72 min-w-72 bg-brand-dark-green shadow-lg">
            <div className="space-y-4 px-8 py-6 border-b border-brand-gold border-opacity-30">
                <h1 className="text-xl font-semibold text-brand-gold">
                    CBLab Delivery
                </h1>
                <p className="text-brand-white text-sm">
                    Gestão de{' '}
                    <span className="text-brand-gold font-medium">
                        pedidos de delivery.
                    </span>
                </p>
            </div>

            <div className="flex flex-col gap-2 p-2">
                <SidebarButton to="/">
                    <HomeIcon />
                    Dashboard
                </SidebarButton>
                <SidebarButton to="/orders">
                    <PackageIcon />
                    Todos os Pedidos
                </SidebarButton>
                <SidebarButton to="/orders/new">
                    <PlusIcon />
                    Novo Pedido
                </SidebarButton>
                <SidebarButton to="/orders/active">
                    <TruckIcon />
                    Em Andamento
                </SidebarButton>
                <SidebarButton to="/orders/history">
                    <ArchiveIcon />
                    Histórico
                </SidebarButton>
            </div>
        </div>
    );
};

export default Sidebar;
