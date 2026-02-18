import Order from '../aggregates/Order.js';

class UpdateItemInOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId, code, updates }) {
        if (!orderId) {
            throw new Error('orderId is required');
        }

        if (!code && code !== 0) {
            throw new Error('code is required');
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('updates is required and must be an object');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        order.updateItem(code, updates);

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default UpdateItemInOrderUseCase;
