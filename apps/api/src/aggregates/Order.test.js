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
            expect(order.statuses).toHaveLength(1);
            expect(order.statuses[0].name).toBe('DRAFT');
            expect(order.statuses[0].origin).toBe('CUSTOMER');
            expect(order.statuses[0].created_at).toBeDefined();
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
            expect(json.order.statuses).toHaveLength(1);
            expect(json.order.statuses[0].name).toBe('DRAFT');
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

    describe('updateItem', () => {
        it('should update item quantity in DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({
                code: 123,
                quantity: 2,
                price: 50.0,
                name: 'Pizza',
            });

            const updatedItem = order.updateItem(123, { quantity: 5 });

            expect(updatedItem.code).toBe(123);
            expect(updatedItem.quantity).toBe(5);
            expect(updatedItem.total_price).toBe(250.0);
            expect(updatedItem.name).toBe('Pizza');
        });

        it('should update item observations', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({
                code: 456,
                quantity: 1,
                price: 30.0,
                observations: 'Sem cebola',
            });

            const updatedItem = order.updateItem(456, {
                observations: 'Com bastante queijo',
            });

            expect(updatedItem.observations).toBe('Com bastante queijo');
            expect(updatedItem.quantity).toBe(1); // não mudou
        });

        it('should update item name', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({
                code: 789,
                quantity: 1,
                price: 25.0,
                name: 'Product 789',
            });

            const updatedItem = order.updateItem(789, {
                name: 'Hambúrguer Especial',
            });

            expect(updatedItem.name).toBe('Hambúrguer Especial');
        });

        it('should update multiple fields at once', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({
                code: 111,
                quantity: 1,
                price: 40.0,
                name: 'Produto Original',
                observations: 'Observação original',
            });

            const updatedItem = order.updateItem(111, {
                quantity: 3,
                name: 'Produto Atualizado',
                observations: 'Nova observação',
            });

            expect(updatedItem.quantity).toBe(3);
            expect(updatedItem.total_price).toBe(120.0);
            expect(updatedItem.name).toBe('Produto Atualizado');
            expect(updatedItem.observations).toBe('Nova observação');
        });

        it('should throw error when updating item in non-DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 123, quantity: 1, price: 50.0 });
            order.status = 'RECEIVED';

            expect(() => order.updateItem(123, { quantity: 2 })).toThrow(
                'Cannot update items in order that is not in DRAFT status',
            );
        });

        it('should throw error when item is not found', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 123, quantity: 1, price: 50.0 });

            expect(() => order.updateItem(999, { quantity: 2 })).toThrow(
                'Item not found',
            );
        });

        it('should throw error when code is not provided', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() => order.updateItem(null, { quantity: 2 })).toThrow(
                'Item code is required',
            );
        });

        it('should throw error when quantity is invalid', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 123, quantity: 1, price: 50.0 });

            expect(() => order.updateItem(123, { quantity: 0 })).toThrow(
                'Quantity must be a number greater than 0',
            );

            expect(() => order.updateItem(123, { quantity: -1 })).toThrow(
                'Quantity must be a number greater than 0',
            );
        });

        it('should set observations to null when empty string is provided', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({
                code: 123,
                quantity: 1,
                price: 50.0,
                observations: 'Observação inicial',
            });

            const updatedItem = order.updateItem(123, { observations: '' });

            expect(updatedItem.observations).toBeNull();
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

        it('should replace existing payment when adding a second payment', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            // Adiciona o primeiro pagamento
            order.addPayment({
                origin: 'PIX',
                value: 100.0,
                prepaid: true,
            });

            expect(order.payments).toHaveLength(1);
            expect(order.payments[0].origin).toBe('PIX');
            expect(order.payments[0].value).toBe(100.0);

            // Adiciona um segundo pagamento (deve sobrescrever o primeiro)
            order.addPayment({
                origin: 'CREDIT_CARD',
                value: 50.0,
                prepaid: false,
            });

            // Verifica que só tem um payment e é o segundo
            expect(order.payments).toHaveLength(1);
            expect(order.payments[0].origin).toBe('CREDIT_CARD');
            expect(order.payments[0].value).toBe(50.0);
            expect(order.payments[0].prepaid).toBe(false);
        });
    });

    describe('setDeliveryAddress', () => {
        it('should set delivery address to order in DRAFT status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
                neighborhood: 'Centro',
                reference: 'Apto 45',
                coordinates: {
                    latitude: -23.55052,
                    longitude: -46.633308,
                    id: 123,
                },
            };

            const setAddress = order.setDeliveryAddress(address);

            expect(setAddress.street_name).toBe('Rua das Flores');
            expect(setAddress.street_number).toBe('123');
            expect(setAddress.city).toBe('São Paulo');
            expect(setAddress.state).toBe('SP');
            expect(setAddress.postal_code).toBe('01234-567');
            expect(setAddress.country).toBe('BR');
            expect(setAddress.neighborhood).toBe('Centro');
            expect(setAddress.reference).toBe('Apto 45');
            expect(setAddress.coordinates).toEqual({
                latitude: -23.55052,
                longitude: -46.633308,
                id: 123,
            });
            expect(order.deliveryAddress).toEqual(setAddress);
        });

        it('should set delivery address without optional fields', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
            };

            const setAddress = order.setDeliveryAddress(address);

            expect(setAddress.neighborhood).toBeNull();
            expect(setAddress.reference).toBeNull();
            expect(setAddress.coordinates).toBeNull();
        });

        it('should throw error when setting address to non-DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });
            order.status = 'RECEIVED';

            const address = {
                street_name: 'Rua das Flores',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01234-567',
                country: 'BR',
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
                order.setDeliveryAddress({ street_name: 'Rua das Flores' }),
            ).toThrow(
                'Address must have street_name, street_number, city, state, postal_code and country',
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

            expect(order.getTotalPayments()).toBe(100.0);
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
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
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
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
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
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
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
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
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
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
            });

            const missing = order.getMissingSteps();

            expect(missing).toHaveLength(1);
            expect(missing[0]).toContain('Payment total');
            expect(missing[0]).toContain('30.00');
            expect(missing[0]).toContain('50.00');
        });
    });

    describe('addStatusToHistory', () => {
        it('should add new status to history', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(order.statuses).toHaveLength(1);
            expect(order.status).toBe('DRAFT');

            order.addStatusToHistory('RECEIVED', 'STORE');

            expect(order.statuses).toHaveLength(2);
            expect(order.status).toBe('RECEIVED');
            expect(order.statuses[1].name).toBe('RECEIVED');
            expect(order.statuses[1].origin).toBe('STORE');
            expect(order.statuses[1].created_at).toBeDefined();
        });

        it('should use SYSTEM as default origin', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addStatusToHistory('CONFIRMED');

            expect(order.statuses[1].origin).toBe('SYSTEM');
        });

        it('should maintain status history in order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addStatusToHistory('RECEIVED', 'STORE');
            order.addStatusToHistory('CONFIRMED', 'STORE');
            order.addStatusToHistory('DISPATCHED', 'STORE');

            expect(order.statuses).toHaveLength(4);
            expect(order.statuses[0].name).toBe('DRAFT');
            expect(order.statuses[1].name).toBe('RECEIVED');
            expect(order.statuses[2].name).toBe('CONFIRMED');
            expect(order.statuses[3].name).toBe('DISPATCHED');
            expect(order.status).toBe('DISPATCHED');
        });
    });

    describe('receive', () => {
        it('should receive a complete order in DRAFT', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 50.0 });
            order.setDeliveryAddress({
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
            });

            order.receive();

            expect(order.status).toBe('RECEIVED');
            expect(order.statuses).toHaveLength(2);
            expect(order.statuses[1].name).toBe('RECEIVED');
            expect(order.statuses[1].origin).toBe('CUSTOMER');
        });

        it('should throw error when order is not in DRAFT', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 50.0 });
            order.addPayment({ origin: 'PIX', value: 50.0 });
            order.setDeliveryAddress({
                street_name: 'Rua A',
                street_number: '1',
                city: 'SP',
                state: 'SP',
                postal_code: '12345-678',
                country: 'BR',
            });

            order.receive();

            expect(() => order.receive()).toThrow(
                'Only orders in DRAFT status can be received',
            );
        });

        it('should throw error when order is not complete', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 50.0 });

            expect(() => order.receive()).toThrow('Order is not complete');
        });

        it('should throw error with missing steps details', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 50.0 });

            expect(() => order.receive()).toThrow('Set delivery address');
            expect(() => order.receive()).toThrow('Add at least one payment');
        });
    });

    describe('confirm', () => {
        it('should confirm a RECEIVED order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();

            order.confirm();

            expect(order.status).toBe('CONFIRMED');
            expect(order.statuses).toHaveLength(3);
            expect(order.statuses[2].name).toBe('CONFIRMED');
            expect(order.statuses[2].origin).toBe('STORE');
        });

        it('should throw error when order is not in RECEIVED status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() => order.confirm()).toThrow(
                'Only orders in RECEIVED status can be confirmed',
            );
        });
    });

    describe('dispatch', () => {
        it('should dispatch a CONFIRMED order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();
            order.confirm();

            order.dispatch();

            expect(order.status).toBe('DISPATCHED');
            expect(order.statuses).toHaveLength(4);
            expect(order.statuses[3].name).toBe('DISPATCHED');
            expect(order.statuses[3].origin).toBe('STORE');
        });

        it('should throw error when order is not in CONFIRMED status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() => order.dispatch()).toThrow(
                'Only orders in CONFIRMED status can be dispatched',
            );
        });
    });

    describe('deliver', () => {
        it('should deliver a DISPATCHED order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();
            order.confirm();
            order.dispatch();

            order.deliver();

            expect(order.status).toBe('DELIVERED');
            expect(order.statuses).toHaveLength(5);
            expect(order.statuses[4].name).toBe('DELIVERED');
            expect(order.statuses[4].origin).toBe('STORE');
        });

        it('should throw error when order is not in DISPATCHED status', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            expect(() => order.deliver()).toThrow(
                'Only orders in DISPATCHED status can be delivered',
            );
        });
    });

    describe('cancel', () => {
        it('should cancel a DRAFT order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.cancel();

            expect(order.status).toBe('CANCELED');
            expect(order.statuses).toHaveLength(2);
            expect(order.statuses[1].name).toBe('CANCELED');
            expect(order.statuses[1].origin).toBe('STORE');
        });

        it('should cancel a RECEIVED order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();

            order.cancel();

            expect(order.status).toBe('CANCELED');
            expect(order.statuses).toHaveLength(3);
            expect(order.statuses[2].name).toBe('CANCELED');
            expect(order.statuses[2].origin).toBe('STORE');
        });

        it('should cancel a CONFIRMED order', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();
            order.confirm();

            order.cancel();

            expect(order.status).toBe('CANCELED');
            expect(order.statuses).toHaveLength(4);
            expect(order.statuses[3].name).toBe('CANCELED');
            expect(order.statuses[3].origin).toBe('STORE');
        });

        it('should throw error when order is DISPATCHED', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();
            order.confirm();
            order.dispatch();

            expect(() => order.cancel()).toThrow(
                'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled',
            );
        });

        it('should throw error when order is DELIVERED', () => {
            const order = new Order('store-123', {
                name: 'João Silva',
                phone: '11987654321',
            });

            order.addItem({ code: 1, quantity: 1, price: 100.0 });
            order.addPayment({
                type: 'PIX',
                method: 'PIX',
                value: 100.0,
                origin: 'PIX',
            });
            order.setDeliveryAddress({
                street_name: 'Rua Teste',
                street_number: '123',
                city: 'São Paulo',
                state: 'SP',
                postal_code: '01000-000',
                country: 'BR',
            });
            order.receive();
            order.confirm();
            order.dispatch();
            order.deliver();

            expect(() => order.cancel()).toThrow(
                'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled',
            );
        });
    });
});
