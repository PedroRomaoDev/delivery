import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import { useGetOrders } from '../hooks/data/use-get-orders';

const STATUS_CONFIG = {
    DRAFT: { label: 'Rascunho', color: '#818181' },
    RECEIVED: { label: 'Recebido', color: '#3B82F6' },
    CONFIRMED: { label: 'Confirmado', color: '#C9A227' },
    DISPATCHED: { label: 'Despachado', color: '#9333EA' },
    DELIVERED: { label: 'Entregue', color: '#10B981' },
    CANCELED: { label: 'Cancelado', color: '#EF4444' },
};

const OrderStatusChart = () => {
    const { data: orders, isLoading } = useGetOrders();

    if (isLoading) {
        return (
            <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">
                    Distribuição por Status
                </h3>
                <div className="text-brand-text-gray">Carregando...</div>
            </div>
        );
    }

    const statusCounts = {};
    orders?.forEach((item) => {
        const status = item.order?.last_status_name;
        if (status) {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
    });

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_CONFIG[status]?.label || status,
        value: count,
        color: STATUS_CONFIG[status]?.color || '#9CA3AF',
    }));

    const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-brand-dark-green">
                Distribuição por Status
            </h3>
            {totalOrders > 0 ? (
                <>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${value} pedidos`, '']}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {chartData.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between rounded-lg bg-brand-background p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-brand-text-gray">
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="py-8 text-center text-brand-text-gray">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
};

export default OrderStatusChart;
