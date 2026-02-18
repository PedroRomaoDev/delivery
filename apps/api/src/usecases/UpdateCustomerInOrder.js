import Order from '../aggregates/Order.js';

class UpdateCustomerInOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId, updates }) {
        // Valida os parâmetros
        if (!orderId) {
            throw new Error('orderId is required');
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('updates is required and must be an object');
        }

        // Busca o pedido existente
        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        // Hidrata o Aggregate Order
        const order = Order.hydrate(orderData);

        // Atualiza o cliente via Aggregate (aplica regras de negócio)
        order.updateCustomer(updates);

        // Serializa de volta para o formato JSON
        const updatedOrderData = order.toJSON();

        // Persiste as alterações
        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default UpdateCustomerInOrderUseCase;
