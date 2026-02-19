import { useQuery } from '@tanstack/react-query';

import { orderQueryKeys } from '../../keys/queries';
import { api } from '../../lib/axios';

export const useGetOrders = () => {
    return useQuery({
        queryKey: orderQueryKeys.lists(),
        queryFn: async () => {
            const { data } = await api.get('/orders');
            return data;
        },
    });
};
