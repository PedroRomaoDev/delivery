import Order from './Order.js';

describe('Order Aggregate', () => {
    describe('constructor', () => {
        it('should create a new order in DRAFT status', () => {
            const storeId = 'store-123';
            const customer = {
                name: 'João Silva',
                phone: '11987654321',
            };

            const order = new Order(storeId, customer);

            expect(order.id).toBeDefined();
            expect(order.storeId).toBe(storeId);
            expect(order.customer).toEqual(customer);
            expect(order.status).toBe('DRAFT');
            expect(order.items).toEqual([]);
            expect(order.payments).toEqual([]);
            expect(order.deliveryAddress).toBeNull();
            expect(order.createdAt).toBeDefined();
        });

        it('should generate unique ID for each order', () => {
            const storeId = 'store-123';
            const customer = { name: 'João Silva', phone: '11987654321' };

            const order1 = new Order(storeId, customer);
            const order2 = new Order(storeId, customer);

            expect(order1.id).not.toBe(order2.id);
        });

        it('should throw error if storeId is missing', () => {
            const customer = { name: 'João Silva', phone: '11987654321' };

            expect(() => new Order(null, customer)).toThrow(
                'storeId is required and must be a string',
            );
        });

        it('should throw error if storeId is not a string', () => {
            const customer = { name: 'João Silva', phone: '11987654321' };

            expect(() => new Order(123, customer)).toThrow(
                'storeId is required and must be a string',
            );
        });

        it('should throw error if customer is missing', () => {
            expect(() => new Order('store-123', null)).toThrow(
                'customer is required and must be an object',
            );
        });

        it('should throw error if customer.name is missing', () => {
            const customer = { phone: '11987654321' };

            expect(() => new Order('store-123', customer)).toThrow(
                'customer.name is required and must be a string',
            );
        });

        it('should throw error if customer.phone is missing', () => {
            const customer = { name: 'João Silva' };

            expect(() => new Order('store-123', customer)).toThrow(
                'customer.phone is required and must be a string',
            );
        });
    });

    describe('isDraft', () => {
        it('should return true when order status is DRAFT', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(order.isDraft()).toBe(true);
        });
    });

    describe('toJSON', () => {
        it('should return order data as plain object', () => {
            const storeId = 'store-123';
            const customer = { name: 'João Silva', phone: '11987654321' };
            const order = new Order(storeId, customer);

            const json = order.toJSON();

            expect(json.store_id).toBe(storeId);
            expect(json.order_id).toBe(order.id);
            expect(json.order.customer.temporary_phone).toBe('11987654321');
            expect(json.order.customer.name).toBe('João Silva');
            expect(json.order.last_status_name).toBe('DRAFT');
            expect(json.order.items).toEqual([]);
            expect(json.order.payments).toEqual([]);
            expect(json.order.delivery_address).toBeNull();
            expect(json.order.created_at).toBeDefined();
            expect(json.order.total_price).toBe(0);
        });
    });

    describe('addItem', () => {
        it('should add item to order in DRAFT status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const item = {
                code: 123,
                quantity: 2,
                price: 89.9,
                observations: 'Sem cebola',
                name: 'Camarão Alfredo',
            };

            const addedItem = order.addItem(item);

            expect(addedItem.code).toBe(123);
            expect(addedItem.quantity).toBe(2);
            expect(addedItem.price).toBe(89.9);
            expect(addedItem.observations).toBe('Sem cebola');
            expect(addedItem.name).toBe('Camarão Alfredo');
            expect(addedItem.total_price).toBe(179.8);
            expect(addedItem.discount).toBe(0);
            expect(addedItem.condiments).toEqual([]);
            expect(order.items).toHaveLength(1);
        });

        it('should add item without observations', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const item = {
                code: 123,
                quantity: 1,
                price: 50.0,
            };

            const addedItem = order.addItem(item);

            expect(addedItem.observations).toBeNull();
            expect(addedItem.name).toBe('Product 123');
        });

        it('should throw error when adding item to non-DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.status = 'RECEIVED'; // Simulando mudança de status

            const item = { code: 123, quantity: 1, price: 50.0 };

            expect(() => order.addItem(item)).toThrow(
                'Cannot add items to order that is not in DRAFT status',
            );
        });

        it('should throw error when item is missing required fields', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() => order.addItem({ code: 123 })).toThrow(
                'Item must have code, quantity and price',
            );
        });
    });

    describe('addPayment', () => {
        it('should add payment to order in DRAFT status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const payment = {
                origin: 'CREDIT_CARD',
                value: 179.8,
                prepaid: true,
            };

            const addedPayment = order.addPayment(payment);

            expect(addedPayment.prepaid).toBe(true);
            expect(addedPayment.origin).toBe('CREDIT_CARD');
            expect(addedPayment.value).toBe(179.8);
            expect(order.payments).toHaveLength(1);
        });

        it('should throw error when adding payment to non-DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.status = 'RECEIVED';

            const payment = { origin: 'PIX', value: 100.0 };

            expect(() => order.addPayment(payment)).toThrow(
                'Cannot add payments to order that is not in DRAFT status',
            );
        });

        it('should throw error when payment is missing required fields', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() => order.addPayment({ origin: 'PIX' })).toThrow(
                'Payment must have origin and value',
            );
        });
    });

    describe('setDeliveryAddress', () => {
        it('should set delivery address to order in DRAFT status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const address = {
                street: 'Rua das Flores',
                number: '123',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567',
                complement: 'Apto 45',
            };

            const setAddress = order.setDeliveryAddress(address);

            expect(setAddress.street).toBe('Rua das Flores');
            expect(setAddress.number).toBe('123');
            expect(setAddress.city).toBe('São Paulo');
            expect(setAddress.state).toBe('SP');
            expect(setAddress.zipCode).toBe('01234-567');
            expect(setAddress.complement).toBe('Apto 45');
            expect(order.deliveryAddress).toEqual(setAddress);
        });

        it('should set delivery address without complement', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const address = {
                street: 'Rua das Flores',
                number: '123',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567',
            };

            const setAddress = order.setDeliveryAddress(address);

            expect(setAddress.complement).toBeNull();
        });

        it('should throw error when setting address to non-DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.status = 'RECEIVED';

            const address = {
                street: 'Rua das Flores',
                number: '123',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567',
            };

            expect(() => order.setDeliveryAddress(address)).toThrow(
                'Cannot set delivery address to order that is not in DRAFT status',
            );
        });

        it('should throw error when address is missing required fields', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() =>
                order.setDeliveryAddress({ street: 'Rua das Flores' }),
            ).toThrow(
                'Address must have street, number, city, state and zipCode',
            );
        });
    });

    describe('getTotalItems', () => {
        it('should return 0 when there are no items', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(order.getTotalItems()).toBe(0);
        });

        it('should calculate total of items correctly', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 2, price: 50.0 });
            order.addItem({ code: 2, quantity: 1, price: 30.0 });

            expect(order.getTotalItems()).toBe(130.0);
        });
    });

    describe('getTotalPayments', () => {
        it('should return 0 when there are no payments', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(order.getTotalPayments()).toBe(0);
        });

        it('should calculate total of payments correctly', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addPayment({ origin: 'CREDIT_CARD', value: 100.0 });
            order.addPayment({ origin: 'PIX', value: 30.0 });

            expect(order.getTotalPayments()).toBe(130.0);
        });
    });

    describe('isComplete', () => {
        it('should return false when order has no items', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(order.isComplete()).toBe(false);
        });

        it('should return false when order has no delivery address', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 50.0 });

            expect(order.isComplete()).toBe(false);
        });

        it('should return false when order has no payments', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.setDeliveryAddress({
                street: 'Rua A',
                number: '1',
                city: 'SP',
                state: 'SP',
                zipCode: '12345-678',
            });

            expect(order.isComplete()).toBe(false);
        });

        it('should return false when payments do not match items total', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 30.0 });
            order.setDeliveryAddress({
                street: 'Rua A',
                number: '1',
                city: 'SP',
                state: 'SP',
                zipCode: '12345-678',
            });

            expect(order.isComplete()).toBe(false);
        });

        it('should return true when order is complete', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 50.0 });
            order.setDeliveryAddress({
                street: 'Rua A',
                number: '1',
                city: 'SP',
                state: 'SP',
                zipCode: '12345-678',
            });

            expect(order.isComplete()).toBe(true);
        });
    });

    describe('getMissingSteps', () => {
        it('should return all missing steps for empty order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const missing = order.getMissingSteps();

            expect(missing).toContain('Add at least one item');
            expect(missing).toContain('Set delivery address');
            expect(missing).toContain('Add at least one payment');
        });

        it('should return empty array when order is complete', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 50.0 });
            order.setDeliveryAddress({
                street: 'Rua A',
                number: '1',
                city: 'SP',
                state: 'SP',
                zipCode: '12345-678',
            });

            expect(order.getMissingSteps()).toEqual([]);
        });

        it('should return payment mismatch message when totals do not match', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 30.0 });
            order.setDeliveryAddress({
                street: 'Rua A',
                number: '1',
                city: 'SP',
                state: 'SP',
                zipCode: '12345-678',
            });

            const missing = order.getMissingSteps();

            expect(missing).toHaveLength(1);
            expect(missing[0]).toContain('Payment total');
            expect(missing[0]).toContain('30.00');
            expect(missing[0]).toContain('50.00');
        });
    });
});
