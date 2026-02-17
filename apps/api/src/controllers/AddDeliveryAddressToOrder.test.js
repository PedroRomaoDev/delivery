import { describe, it, expect, beforeEach } from '@jest/globals';
import AddDeliveryAddressToOrderController from './AddDeliveryAddressToOrder.js';

describe('AddDeliveryAddressToOrderController', () => {
    let controller;
    let addDeliveryAddressToOrderUseCase;
    let request;
    let reply;

    beforeEach(() => {
        // Mock UseCase
        addDeliveryAddressToOrderUseCase = {
            execute: jest.fn(),
        };

        controller = new AddDeliveryAddressToOrderController(
            addDeliveryAddressToOrderUseCase,
        );

        // Mock reply object
        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        // Base request object
        request = {
            params: { id: '550e8400-e29b-41d4-a716-446655440000' },
            body: {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
            },
        };
    });

    describe('handle', () => {
        it('should add delivery address successfully', async () => {
            const mockOrderData = {
                order_id: '550e8400-e29b-41d4-a716-446655440000',
                store_id: '660e8400-e29b-41d4-a716-446655440000',
                order: {
                    delivery_address: {
                        street_name: 'Rua das Flores',
                        street_number: '123',
                        city: 'São Paulo',
                        state: 'SP',
                        postal_code: '01234-567',
                        country: 'BR',
                        neighborhood: null,
                        reference: null,
                        coordinates: {
                            latitude: -23.55,
                            longitude: -46.63,
                            id: 1234567,
                        },
                    },
                },
            };

            addDeliveryAddressToOrderUseCase.execute.mockResolvedValue(
                mockOrderData,
            );

            await controller.handle(request, reply);

            expect(
                addDeliveryAddressToOrderUseCase.execute,
            ).toHaveBeenCalledWith({
                orderId: '550e8400-e29b-41d4-a716-446655440000',
                address: {
                    street_name: 'Rua das Flores',
                    street_number: '123',
                    city: 'São Paulo',
                    state: 'SP',
                    postal_code: '01234-567',
                    country: 'BR',
                },
            });

            expect(reply.status).toHaveBeenCalledWith(200);
            expect(reply.send).toHaveBeenCalledWith(mockOrderData);
        });

        it('should return 400 when orderId param is invalid', async () => {
            request.params = { id: '' }; // ID vazio

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when orderId param is missing', async () => {
            request.params = {}; // Sem ID

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when street_name is missing', async () => {
            delete request.body.street_name;

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when street_number is missing', async () => {
            delete request.body.street_number;

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when city is missing', async () => {
            delete request.body.city;

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when state is missing', async () => {
            delete request.body.state;

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when postal_code is missing', async () => {
            delete request.body.postal_code;

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should return 400 when country is missing', async () => {
            delete request.body.country;

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.any(String),
                }),
            );
        });

        it('should accept optional neighborhood field', async () => {
            request.body.neighborhood = 'Bela Vista';

            const mockOrderData = {
                order_id: '550e8400-e29b-41d4-a716-446655440000',
                store_id: '660e8400-e29b-41d4-a716-446655440000',
                order: {
                    delivery_address: {
                        ...request.body,
                        reference: null,
                        coordinates: null,
                    },
                },
            };

            addDeliveryAddressToOrderUseCase.execute.mockResolvedValue(
                mockOrderData,
            );

            await controller.handle(request, reply);

            expect(
                addDeliveryAddressToOrderUseCase.execute,
            ).toHaveBeenCalledWith({
                orderId: '550e8400-e29b-41d4-a716-446655440000',
                address: expect.objectContaining({
                    neighborhood: 'Bela Vista',
                }),
            });

            expect(reply.status).toHaveBeenCalledWith(200);
        });

        it('should accept optional reference field', async () => {
            request.body.reference = 'Próximo ao parque';

            const mockOrderData = {
                order_id: '550e8400-e29b-41d4-a716-446655440000',
                store_id: '660e8400-e29b-41d4-a716-446655440000',
                order: {
                    delivery_address: {
                        ...request.body,
                        neighborhood: null,
                        coordinates: null,
                    },
                },
            };

            addDeliveryAddressToOrderUseCase.execute.mockResolvedValue(
                mockOrderData,
            );

            await controller.handle(request, reply);

            expect(
                addDeliveryAddressToOrderUseCase.execute,
            ).toHaveBeenCalledWith({
                orderId: '550e8400-e29b-41d4-a716-446655440000',
                address: expect.objectContaining({
                    reference: 'Próximo ao parque',
                }),
            });

            expect(reply.status).toHaveBeenCalledWith(200);
        });

        it('should accept optional coordinates field', async () => {
            request.body.coordinates = {
                latitude: -20.0,
                longitude: -40.0,
                id: 9999999,
            };

            const mockOrderData = {
                order_id: '550e8400-e29b-41d4-a716-446655440000',
                store_id: '660e8400-e29b-41d4-a716-446655440000',
                order: {
                    delivery_address: {
                        ...request.body,
                        neighborhood: null,
                        reference: null,
                    },
                },
            };

            addDeliveryAddressToOrderUseCase.execute.mockResolvedValue(
                mockOrderData,
            );

            await controller.handle(request, reply);

            expect(
                addDeliveryAddressToOrderUseCase.execute,
            ).toHaveBeenCalledWith({
                orderId: '550e8400-e29b-41d4-a716-446655440000',
                address: expect.objectContaining({
                    coordinates: {
                        latitude: -20.0,
                        longitude: -40.0,
                        id: 9999999,
                    },
                }),
            });

            expect(reply.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 when order is not found', async () => {
            addDeliveryAddressToOrderUseCase.execute.mockRejectedValue(
                new Error('Order not found'),
            );

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith({
                message: 'Order not found',
            });
        });

        it('should return 400 when order is not in DRAFT status', async () => {
            addDeliveryAddressToOrderUseCase.execute.mockRejectedValue(
                new Error(
                    'Cannot set delivery address to order that is not in DRAFT status',
                ),
            );

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith({
                message:
                    'Cannot set delivery address to order that is not in DRAFT status',
            });
        });

        it('should return 400 when address is incomplete', async () => {
            addDeliveryAddressToOrderUseCase.execute.mockRejectedValue(
                new Error(
                    'Address must have street_name, street_number, city, state, postal_code and country',
                ),
            );

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith({
                message:
                    'Address must have street_name, street_number, city, state, postal_code and country',
            });
        });

        it('should return 400 when order has no payment', async () => {
            addDeliveryAddressToOrderUseCase.execute.mockRejectedValue(
                new Error(
                    'Order must have payment before adding delivery address',
                ),
            );

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith({
                message:
                    'Order must have payment before adding delivery address',
            });
        });

        it('should return 500 when unexpected error occurs', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            addDeliveryAddressToOrderUseCase.execute.mockRejectedValue(
                new Error('Unexpected database error'),
            );

            await controller.handle(request, reply);

            expect(reply.status).toHaveBeenCalledWith(500);
            expect(reply.send).toHaveBeenCalledWith({
                message: 'Internal server error',
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error in AddDeliveryAddressToOrderController:',
                expect.any(Error),
            );

            consoleErrorSpy.mockRestore();
        });
    });
});
