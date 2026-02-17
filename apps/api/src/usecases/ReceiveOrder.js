import Order from '../aggregates/Order.js';

class ReceiveOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId }) {
        // Valida os parâmetros
        if (!orderId) {
            throw new Error('orderId is required');
        }

        // Busca o pedido existente
        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        // Hidrata o Aggregate Order
        const order = Order.hydrate(orderData);

        // Recebe o pedido (transição DRAFT → RECEIVED)
        // O método receive() valida se está em DRAFT e se está completo
        order.receive();

        // Serializa de volta para o formato JSON
        const updatedOrderData = order.toJSON();

        // Persiste via Repository
        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default ReceiveOrderUseCase;
