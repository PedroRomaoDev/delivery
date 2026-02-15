import Order from '../aggregates/Order.js';
import { generateRandomPrice } from '../../../../packages/helpers/generateRandomPrice.js';

class AddItemToOrderUseCase {
    constructor(findOrderByIdRepository, addItemToOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.addItemToOrderRepository = addItemToOrderRepository;
    }

    async execute({ orderId, code, quantity, observations, name }) {
        // Valida os parâmetros
        if (!orderId || !code || quantity === undefined || quantity === null) {
            throw new Error('orderId, code and quantity are required');
        }

        if (quantity <= 0) {
            throw new Error('quantity must be greater than 0');
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
                'Cannot add items to order that is not in DRAFT status',
            );
        }

        // Gera preço aleatório
        const price = generateRandomPrice();

        // Adiciona o item via Aggregate (aplica regras de negócio)
        order.addItem({
            code,
            quantity,
            price,
            observations,
            name,
        });

        // Serializa de volta para o formato JSON
        const updatedOrderData = order.toJSON();

        // Persiste via repository
        const savedOrder =
            await this.addItemToOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default AddItemToOrderUseCase;
