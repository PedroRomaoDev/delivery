import Order from '../aggregates/Order.js';
import { generateRandomPrice } from '../../../../packages/helpers/generateRandomPrice.js';

class AddItemToOrderUseCase {
    constructor(findOrderByIdRepository, addItemToOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.addItemToOrderRepository = addItemToOrderRepository;
    }

    async execute({ orderId, code, quantity, observations, name }) {
        if (!orderId || !code || quantity === undefined || quantity === null) {
            throw new Error('orderId, code and quantity are required');
        }

        if (quantity <= 0) {
            throw new Error('quantity must be greater than 0');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        if (!order.isDraft()) {
            throw new Error(
                'Cannot add items to order that is not in DRAFT status',
            );
        }

        const price = generateRandomPrice();

        order.addItem({
            code,
            quantity,
            price,
            observations,
            name,
        });

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.addItemToOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default AddItemToOrderUseCase;
