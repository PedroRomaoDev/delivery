import Order from '../aggregates/Order.js';

class UpdateCustomerInOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId, updates }) {
        if (!orderId) {
            throw new Error('orderId is required');
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('updates is required and must be an object');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        order.updateCustomer(updates);

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default UpdateCustomerInOrderUseCase;
