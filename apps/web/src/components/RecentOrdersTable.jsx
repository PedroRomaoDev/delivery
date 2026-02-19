import { useGetOrders } from '../hooks/data/use-get-orders';

const STATUS_LABELS = {
    DRAFT: 'Rascunho',
    RECEIVED: 'Recebido',
    CONFIRMED: 'Confirmado',
    DISPATCHED: 'Despachado',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
};

const STATUS_COLORS = {
    DRAFT: 'text-brand-text-gray',
    RECEIVED: 'text-blue-600',
    CONFIRMED: 'text-brand-gold',
    DISPATCHED: 'text-purple-600',
    DELIVERED: 'text-green-600',
    CANCELED: 'text-brand-danger',
};

const RecentOrdersTable = () => {
    const { data: orders, isLoading } = useGetOrders();

    if (isLoading) {
        return (
            <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Pedidos Recentes</h3>
                <div className="text-brand-text-gray">Carregando...</div>
            </div>
        );
    }

    const recentOrders = orders?.slice(0, 10) || [];

    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-brand-dark-green">
                Pedidos Recentes
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-brand-border text-left text-sm text-brand-text-gray">
                            <th className="pb-3 font-medium">ID</th>
                            <th className="pb-3 font-medium">Cliente</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((item) => (
                            <tr
                                key={item.order_id}
                                className="border-b border-brand-border last:border-0 hover:bg-brand-background transition-colors"
                            >
                                <td className="py-3 text-sm font-mono text-brand-text-gray">
                                    {item.order_id.slice(0, 8)}
                                </td>
                                <td className="py-3 text-sm">
                                    {item.order?.customer?.name || 'N/A'}
                                </td>
                                <td className="py-3 text-sm">
                                    <span
                                        className={`font-medium ${STATUS_COLORS[item.order?.last_status_name] || 'text-gray-600'}`}
                                    >
                                        {STATUS_LABELS[
                                            item.order?.last_status_name
                                        ] || item.order?.last_status_name}
                                    </span>
                                </td>
                                <td className="py-3 text-right text-sm font-semibold">
                                    R${' '}
                                    {item.order?.total_price?.toFixed(2) ||
                                        '0.00'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {recentOrders.length === 0 && (
                    <div className="py-8 text-center text-brand-text-gray">
                        Nenhum pedido encontrado
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentOrdersTable;
