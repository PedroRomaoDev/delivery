import Order from '../aggregates/Order.js';

class AddDeliveryAddressToOrderUseCase {
    constructor(
        findOrderByIdRepository,
        addDeliveryAddressToOrderRepository,
        geocodingService = null,
    ) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.addDeliveryAddressToOrderRepository =
            addDeliveryAddressToOrderRepository;
        this.geocodingService = geocodingService;
    }

    async execute({ orderId, address }) {
        // Valida os parâmetros
        if (!orderId || !address) {
            throw new Error('orderId and address are required');
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
                'Cannot add delivery address to order that is not in DRAFT status',
            );
        }

        // Valida se o pedido tem payment antes de adicionar delivery address
        if (!order.payments || order.payments.length === 0) {
            throw new Error(
                'Order must have payment before adding delivery address',
            );
        }

        // Geocoding automático se coordinates não foi fornecido ou é inválido
        const hasValidCoordinates =
            address.coordinates &&
            typeof address.coordinates.latitude === 'number' &&
            typeof address.coordinates.longitude === 'number' &&
            (address.coordinates.latitude !== 0 ||
                address.coordinates.longitude !== 0);

        if (!hasValidCoordinates && this.geocodingService) {
            try {
                const coords = await this.geocodingService.geocode(address);
                address.coordinates = coords;
            } catch (error) {
                // Graceful degradation: se falhar, deixa coordinates como null
                console.warn('Geocoding skipped:', error.message);
                address.coordinates = null;
            }
        }

        // Adiciona o endereço de entrega via Aggregate (aplica regras de negócio)
        order.setDeliveryAddress(address);

        // Serializa de volta para o formato JSON
        const updatedOrderData = order.toJSON();

        // Persiste via Repository
        const savedOrder =
            await this.addDeliveryAddressToOrderRepository.execute(
                updatedOrderData,
            );

        return savedOrder;
    }
}

export default AddDeliveryAddressToOrderUseCase;
