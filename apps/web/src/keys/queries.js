export const orderQueryKeys = {
    all: ['orders'],
    lists: () => [...orderQueryKeys.all, 'list'],
    list: (filters) => [...orderQueryKeys.lists(), { filters }],
    details: () => [...orderQueryKeys.all, 'detail'],
    detail: (id) => [...orderQueryKeys.details(), id],
};
