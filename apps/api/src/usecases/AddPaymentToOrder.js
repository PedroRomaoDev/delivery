import Order from '../aggregates/Order.js';

class AddPaymentToOrderUseCase {
    constructor(findOrderByIdRepository, addPaymentToOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.addPaymentToOrderRepository = addPaymentToOrderRepository;
    }

    async execute({ orderId, origin, prepaid }) {
        // Valida os parâmetros
        if (!orderId || !origin) {
            throw new Error('orderId and origin are required');
        }

        // Busca o pedido existente
        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        // Hidrata o Aggregate Order
        const order = Order.hydrate(orderData);

        // Valida se o pedido está em DRAFT
        if (!order.isDraft()) {
            throw new Error(
                'Cannot add payments to order that is not in DRAFT status',
            );
        }

        // Calcula o valor do pagamento baseado no total dos items
        const value = order.getTotalItems();

        if (value <= 0) {
            throw new Error('Order must have items before adding payment');
        }

        // Adiciona o pagamento via Aggregate (aplica regras de negócio)
        order.addPayment({
            origin,
            value,
            prepaid,
        });

        // Serializa de volta para o formato JSON
        const updatedOrderData = order.toJSON();

        // Persiste via Repository
        const savedOrder =
            await this.addPaymentToOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default AddPaymentToOrderUseCase;
