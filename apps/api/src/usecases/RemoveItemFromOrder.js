import Order from '../aggregates/Order.js';

class RemoveItemFromOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId, code }) {
        // Valida os parâmetros
        if (!orderId) {
            throw new Error('orderId is required');
        }

        if (!code) {
            throw new Error('code is required');
        }

        // Busca o pedido existente
        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        // Hidrata o Aggregate Order
        const order = Order.hydrate(orderData);

        // Remove o item via Aggregate (aplica regras de negócio)
        order.removeItem(code);

        // Serializa de volta para o formato JSON
        const updatedOrderData = order.toJSON();

        // Persiste as alterações
        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default RemoveItemFromOrderUseCase;
