import { useQuery } from '@tanstack/react-query';

import { orderQueryKeys } from '../../keys/queries';
import { api } from '../../lib/axios';

export const useGetOrder = ({ orderId, onSuccess }) => {
    return useQuery({
        queryKey: orderQueryKeys.detail(orderId),
        queryFn: async () => {
            const { data: order } = await api.get(`/orders/${orderId}`);
            if (onSuccess) {
                onSuccess(order);
            }
            return order;
        },
        enabled: !!orderId,
    });
};
