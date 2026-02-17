import { describe, it, expect, beforeEach } from '@jest/globals';
import AddDeliveryAddressToOrderUseCase from './AddDeliveryAddressToOrder.js';

describe('AddDeliveryAddressToOrderUseCase', () => {
    let findOrderByIdRepository;
    let addDeliveryAddressToOrderRepository;
    let geocodingService;
    let useCase;

    beforeEach(() => {
        // Mock repositories
        findOrderByIdRepository = {
            execute: jest.fn(),
        };

        addDeliveryAddressToOrderRepository = {
            execute: jest.fn((data) => Promise.resolve(data)),
        };

        // Mock geocoding service
        geocodingService = {
            geocode: jest.fn(),
        };

        useCase = new AddDeliveryAddressToOrderUseCase(
            findOrderByIdRepository,
            addDeliveryAddressToOrderRepository,
            geocodingService,
        );
    });

    describe('execute', () => {
        it('should add delivery address to order in DRAFT', async () => {
            const orderData = {
                order_id: 'order-123',
                store_id: 'store-123',
                customer: { name: 'João', phone: '11987654321' },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: Date.now(),
                order: {
                    store_id: 'store-123',
                    customer: { name: 'João', temporary_phone: '11987654321' },
                    last_status_name: 'DRAFT',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: Date.now(),
                    statuses: [],
                },
            };

            findOrderByIdRepository.execute.mockResolvedValue(orderData);

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
            };

            geocodingService.geocode.mockResolvedValue({
                latitude: -23.55,
                longitude: -46.63,
                id: 1234567,
            });

            const result = await useCase.execute({
                orderId: 'order-123',
                address,
            });

            expect(findOrderByIdRepository.execute).toHaveBeenCalledWith(
                'order-123',
            );
            expect(geocodingService.geocode).toHaveBeenCalledWith(address);
            expect(result.order.delivery_address).toBeDefined();
            expect(result.order.delivery_address.street_name).toBe(
                'Rua das Flores',
            );
            expect(result.order.delivery_address.coordinates).toEqual({
                latitude: -23.55,
                longitude: -46.63,
                id: 1234567,
            });
        });

        it('should use provided coordinates if given', async () => {
            const orderData = {
                order_id: 'order-123',
                store_id: 'store-123',
                customer: { name: 'João', phone: '11987654321' },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: Date.now(),
                order: {
                    store_id: 'store-123',
                    customer: { name: 'João', temporary_phone: '11987654321' },
                    last_status_name: 'DRAFT',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: Date.now(),
                    statuses: [],
                },
            };

            findOrderByIdRepository.execute.mockResolvedValue(orderData);

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
                coordinates: {
                    latitude: -20.0,
                    longitude: -40.0,
                    id: 9999999,
                },
            };

            const result = await useCase.execute({
                orderId: 'order-123',
                address,
            });

            // Não deve chamar geocoding se coordinates foi fornecido
            expect(geocodingService.geocode).not.toHaveBeenCalled();
            expect(result.order.delivery_address.coordinates).toEqual({
                latitude: -20.0,
                longitude: -40.0,
                id: 9999999,
            });
        });

        it('should set coordinates to null if geocoding fails', async () => {
            const orderData = {
                order_id: 'order-123',
                store_id: 'store-123',
                customer: { name: 'João', phone: '11987654321' },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: Date.now(),
                order: {
                    store_id: 'store-123',
                    customer: { name: 'João', temporary_phone: '11987654321' },
                    last_status_name: 'DRAFT',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: Date.now(),
                    statuses: [],
                },
            };

            findOrderByIdRepository.execute.mockResolvedValue(orderData);

            geocodingService.geocode.mockRejectedValue(
                new Error('Low confidence geocoding result'),
            );

            const address = {
                street_name: 'Rua Inexistente',
                street_number: '999999',
                city: 'Cidade Fantasma',
                state: 'XX',
                postal_code: '99999-999',
                country: 'ZZ',
            };

            const result = await useCase.execute({
                orderId: 'order-123',
                address,
            });

            expect(geocodingService.geocode).toHaveBeenCalledWith(address);
            expect(result.order.delivery_address.coordinates).toBeNull();
            expect(result.order.delivery_address.street_name).toBe(
                'Rua Inexistente',
            );
        });

        it('should throw error when order not found', async () => {
            findOrderByIdRepository.execute.mockResolvedValue(null);

            const address = {
                street_name: 'Rua',
                street_number: '123',
                city: 'Cidade',
                state: 'Estado',
                postal_code: '12345-678',
                country: 'BR',
            };

            await expect(
                useCase.execute({ orderId: 'invalid-id', address }),
            ).rejects.toThrow('Order not found');
        });

        it('should throw error when order is not in DRAFT', async () => {
            const orderData = {
                order_id: 'order-123',
                store_id: 'store-123',
                customer: { name: 'João', phone: '11987654321' },
                last_status_name: 'RECEIVED',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: Date.now(),
                order: {
                    store_id: 'store-123',
                    customer: { name: 'João', temporary_phone: '11987654321' },
                    last_status_name: 'RECEIVED',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: Date.now(),
                    statuses: [],
                },
            };

            findOrderByIdRepository.execute.mockResolvedValue(orderData);

            const address = {
                street_name: 'Rua',
                street_number: '123',
                city: 'Cidade',
                state: 'Estado',
                postal_code: '12345-678',
                country: 'BR',
            };

            await expect(
                useCase.execute({ orderId: 'order-123', address }),
            ).rejects.toThrow(
                'Cannot add delivery address to order that is not in DRAFT status',
            );
        });

        it('should work without geocoding service', async () => {
            // UseCase sem geocoding service
            const useCaseWithoutGeocoding =
                new AddDeliveryAddressToOrderUseCase(
                    findOrderByIdRepository,
                    addDeliveryAddressToOrderRepository,
                    null, // Sem geocoding service
                );

            const orderData = {
                order_id: 'order-123',
                store_id: 'store-123',
                customer: { name: 'João', phone: '11987654321' },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: Date.now(),
                order: {
                    store_id: 'store-123',
                    customer: { name: 'João', temporary_phone: '11987654321' },
                    last_status_name: 'DRAFT',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: Date.now(),
                    statuses: [],
                },
            };

            findOrderByIdRepository.execute.mockResolvedValue(orderData);

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
            };

            const result = await useCaseWithoutGeocoding.execute({
                orderId: 'order-123',
                address,
            });

            expect(result.order.delivery_address).toBeDefined();
            expect(result.order.delivery_address.street_name).toBe(
                'Rua das Flores',
            );
            // Sem geocoding, coordinates não é definido (será null)
            expect(result.order.delivery_address.coordinates).toBeNull();
        });

        it('should ignore zeroed coordinates and geocode', async () => {
            const orderData = {
                order_id: 'order-123',
                store_id: 'store-123',
                customer: { name: 'João', phone: '11987654321' },
                last_status_name: 'DRAFT',
                items: [],
                payments: [],
                delivery_address: null,
                created_at: Date.now(),
                order: {
                    store_id: 'store-123',
                    customer: { name: 'João', temporary_phone: '11987654321' },
                    last_status_name: 'DRAFT',
                    items: [],
                    payments: [],
                    delivery_address: null,
                    created_at: Date.now(),
                    statuses: [],
                },
            };

            findOrderByIdRepository.execute.mockResolvedValue(orderData);

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
                coordinates: {
                    latitude: 0,
                    longitude: 0,
                    id: 0,
                },
            };

            geocodingService.geocode.mockResolvedValue({
                latitude: -23.55,
                longitude: -46.63,
                id: 7654321,
            });

            const result = await useCase.execute({
                orderId: 'order-123',
                address,
            });

            // Deve chamar geocoding mesmo com coordinates zerado
            expect(geocodingService.geocode).toHaveBeenCalledWith(address);
            expect(result.order.delivery_address.coordinates).toEqual({
                latitude: -23.55,
                longitude: -46.63,
                id: 7654321,
            });
        });
    });
});
