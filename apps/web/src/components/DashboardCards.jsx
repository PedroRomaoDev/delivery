import {
    ArchiveIcon,
    PackageIcon,
    PlusIcon,
    TruckIcon,
    XCircleIcon,
} from '../assets/icons';
import { useGetOrders } from '../hooks/data/use-get-orders';
import DashboardCard from './DashboardCard';

const DashboardCards = () => {
    const { data: orders, isLoading, isError, error } = useGetOrders();

    if (isLoading) {
        return (
            <div className="text-brand-text-gray">Carregando pedidos...</div>
        );
    }

    if (isError) {
        return (
            <div className="text-brand-danger">
                Erro ao carregar pedidos: {error?.message}
            </div>
        );
    }

    const draftOrders =
        orders?.filter((item) => item.order?.last_status_name === 'DRAFT')
            .length || 0;

    const activeOrders =
        orders?.filter((item) =>
            ['RECEIVED', 'CONFIRMED', 'DISPATCHED'].includes(
                item.order?.last_status_name,
            ),
        ).length || 0;

    const deliveredOrders =
        orders?.filter((item) => item.order?.last_status_name === 'DELIVERED')
            .length || 0;

    const canceledOrders =
        orders?.filter((item) => item.order?.last_status_name === 'CANCELED')
            .length || 0;

    return (
        <div className="grid grid-cols-5 gap-6">
            <DashboardCard
                icon={<PackageIcon />}
                mainText={orders?.length || 0}
                secondaryText="Pedidos totais"
            />
            <DashboardCard
                icon={<PlusIcon />}
                mainText={draftOrders}
                secondaryText="Rascunhos"
            />
            <DashboardCard
                icon={<TruckIcon />}
                mainText={activeOrders}
                secondaryText="Em andamento"
            />
            <DashboardCard
                icon={<ArchiveIcon />}
                mainText={deliveredOrders}
                secondaryText="Entregues"
            />
            <DashboardCard
                icon={<XCircleIcon />}
                mainText={canceledOrders}
                secondaryText="Cancelados"
            />
        </div>
    );
};

export default DashboardCards;
