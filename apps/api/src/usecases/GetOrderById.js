class GetOrderByIdUseCase {
    constructor(findOrderByIdRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
    }

    async execute(orderId) {
        if (!orderId) {
            throw new Error('orderId is required');
        }

        const order = await this.findOrderByIdRepository.execute(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }
}

export default GetOrderByIdUseCase;
