import { randomUUID } from 'node:crypto';
import { DEFAULT_STORE_NAME } from '../config/constants.js';

class Order {
    constructor(storeId, customer) {
        this.#validateConstructorParams(storeId, customer);

        this.id = randomUUID();
        this.storeId = storeId;
        this.customer = {
            name: customer.name,
            phone: customer.phone,
        };
        this.status = 'DRAFT';
        this.items = [];
        this.payments = [];
        this.deliveryAddress = null;
        this.createdAt = new Date().toISOString();
        this.statuses = [
            {
                name: 'DRAFT',
                created_at: new Date().getTime(),
                origin: 'CUSTOMER',
            },
        ];
    }

    #validateConstructorParams(storeId, customer) {
        if (!storeId || typeof storeId !== 'string') {
            throw new Error('storeId is required and must be a string');
        }

        if (!customer || typeof customer !== 'object') {
            throw new Error('customer is required and must be an object');
        }

        if (!customer.name || typeof customer.name !== 'string') {
            throw new Error('customer.name is required and must be a string');
        }

        if (!customer.phone || typeof customer.phone !== 'string') {
            throw new Error('customer.phone is required and must be a string');
        }
    }

    static hydrate(data) {
        const order = Object.create(Order.prototype);

        order.id = data.order_id;
        order.storeId = data.store_id;
        order.customer = {
            name: data.order.customer.name,
            phone: data.order.customer.temporary_phone,
        };
        order.status = data.order.last_status_name;
        order.items = data.order.items || [];
        order.payments = data.order.payments || [];
        order.deliveryAddress = data.order.delivery_address;
        order.createdAt = new Date(data.order.created_at).toISOString();
        order.statuses = data.order.statuses || [];

        return order;
    }

    isDraft() {
        return this.status === 'DRAFT';
    }

    isReceived() {
        return this.status === 'RECEIVED';
    }

    isConfirmed() {
        return this.status === 'CONFIRMED';
    }

    isDispatched() {
        return this.status === 'DISPATCHED';
    }

    isCancelable() {
        return (
            this.status === 'DRAFT' ||
            this.status === 'RECEIVED' ||
            this.status === 'CONFIRMED'
        );
    }

    addItem(item) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot add items to order that is not in DRAFT status',
            );
        }

        if (!item.code || !item.quantity || !item.price) {
            throw new Error('Item must have code, quantity and price');
        }

        const totalPrice = parseFloat((item.price * item.quantity).toFixed(2));

        const newItem = {
            code: item.code,
            price: item.price,
            observations: item.observations || null,
            total_price: totalPrice,
            name: item.name || `Product ${item.code}`,
            quantity: item.quantity,
            discount: 0,
            condiments: [],
        };

        this.items.push(newItem);
        return newItem;
    }

    updateItem(code, updates) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot update items in order that is not in DRAFT status',
            );
        }

        if (!code) {
            throw new Error('Item code is required');
        }

        const itemIndex = this.items.findIndex((item) => item.code === code);

        if (itemIndex === -1) {
            throw new Error('Item not found');
        }

        const item = this.items[itemIndex];

        if (updates.quantity !== undefined) {
            if (typeof updates.quantity !== 'number' || updates.quantity < 1) {
                throw new Error('Quantity must be a number greater than 0');
            }
            item.quantity = updates.quantity;
            item.total_price = parseFloat(
                (item.price * item.quantity).toFixed(2),
            );
        }

        if (updates.observations !== undefined) {
            item.observations = updates.observations || null;
        }

        if (updates.name !== undefined) {
            item.name = updates.name || `Product ${item.code}`;
        }

        return item;
    }

    removeItem(code) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot remove items from order that is not in DRAFT status',
            );
        }

        if (!code) {
            throw new Error('Item code is required');
        }

        const itemIndex = this.items.findIndex((item) => item.code === code);

        if (itemIndex === -1) {
            throw new Error('Item not found');
        }

        const removedItem = this.items[itemIndex];
        this.items.splice(itemIndex, 1);

        return removedItem;
    }

    updateCustomer(updates) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot update customer in order that is not in DRAFT status',
            );
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('updates is required and must be an object');
        }

        if (updates.name === undefined && updates.phone === undefined) {
            throw new Error(
                'At least one field (name or phone) must be provided',
            );
        }

        if (updates.name !== undefined) {
            if (
                typeof updates.name !== 'string' ||
                updates.name.trim() === ''
            ) {
                throw new Error('name must be a non-empty string');
            }
            this.customer.name = updates.name;
        }

        if (updates.phone !== undefined) {
            if (
                typeof updates.phone !== 'string' ||
                updates.phone.trim() === ''
            ) {
                throw new Error('phone must be a non-empty string');
            }
            this.customer.phone = updates.phone;
        }

        return this.customer;
    }

    addPayment(payment) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot add payments to order that is not in DRAFT status',
            );
        }

        if (!payment.origin || !payment.value) {
            throw new Error('Payment must have origin and value');
        }

        const newPayment = {
            prepaid: payment.prepaid !== undefined ? payment.prepaid : true,
            value: parseFloat(payment.value.toFixed(2)),
            origin: payment.origin,
        };

        this.payments = [newPayment];
        return newPayment;
    }

    setDeliveryAddress(address) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot set delivery address to order that is not in DRAFT status',
            );
        }

        if (
            !address ||
            !address.street_name ||
            !address.street_number ||
            !address.city ||
            !address.state ||
            !address.postal_code ||
            !address.country
        ) {
            throw new Error(
                'Address must have street_name, street_number, city, state, postal_code and country',
            );
        }

        this.deliveryAddress = {
            street_name: address.street_name,
            street_number: address.street_number,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            neighborhood: address.neighborhood || null,
            reference: address.reference || null,
            coordinates: address.coordinates || null,
        };

        return this.deliveryAddress;
    }

    getTotalItems() {
        const total = this.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
        return parseFloat(total.toFixed(2));
    }

    getTotalPayments() {
        const total = this.payments.reduce((total, payment) => {
            return total + payment.value;
        }, 0);
        return parseFloat(total.toFixed(2));
    }

    isComplete() {
        const hasItems = this.items.length > 0;
        const hasDeliveryAddress = this.deliveryAddress !== null;
        const hasPayments = this.payments.length > 0;
        const paymentsMatchTotal =
            Math.abs(this.getTotalPayments() - this.getTotalItems()) < 0.01;

        return (
            hasItems && hasDeliveryAddress && hasPayments && paymentsMatchTotal
        );
    }

    getMissingSteps() {
        const missing = [];

        if (this.items.length === 0) {
            missing.push('Add at least one item');
        }

        if (this.deliveryAddress === null) {
            missing.push('Set delivery address');
        }

        if (this.payments.length === 0) {
            missing.push('Add at least one payment');
        }

        const totalItems = this.getTotalItems();
        const totalPayments = this.getTotalPayments();

        if (
            this.items.length > 0 &&
            this.payments.length > 0 &&
            Math.abs(totalPayments - totalItems) >= 0.01
        ) {
            missing.push(
                `Payment total (${totalPayments.toFixed(2)}) does not match items total (${totalItems.toFixed(2)})`,
            );
        }

        return missing;
    }

    addStatusToHistory(statusName, origin = 'SYSTEM') {
        this.status = statusName;
        this.statuses.push({
            name: statusName,
            created_at: new Date().getTime(),
            origin: origin,
        });
    }

    receive() {
        if (!this.isDraft()) {
            throw new Error('Only orders in DRAFT status can be received');
        }

        if (!this.isComplete()) {
            const missing = this.getMissingSteps();
            throw new Error(
                `Order is not complete. Missing: ${missing.join(', ')}`,
            );
        }

        this.addStatusToHistory('RECEIVED', 'CUSTOMER');
    }

    confirm() {
        if (!this.isReceived()) {
            throw new Error('Only orders in RECEIVED status can be confirmed');
        }

        this.addStatusToHistory('CONFIRMED', 'STORE');
    }

    dispatch() {
        if (!this.isConfirmed()) {
            throw new Error(
                'Only orders in CONFIRMED status can be dispatched',
            );
        }

        this.addStatusToHistory('DISPATCHED', 'STORE');
    }

    deliver() {
        if (!this.isDispatched()) {
            throw new Error(
                'Only orders in DISPATCHED status can be delivered',
            );
        }

        this.addStatusToHistory('DELIVERED', 'STORE');
    }

    cancel() {
        if (!this.isCancelable()) {
            throw new Error(
                'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled',
            );
        }

        this.addStatusToHistory('CANCELED', 'STORE');
    }

    toJSON() {
        return {
            store_id: this.storeId,
            order_id: this.id,
            order: {
                payments: this.payments,
                last_status_name: this.status,
                store: {
                    name: DEFAULT_STORE_NAME,
                    id: this.storeId,
                },
                total_price: this.getTotalItems(),
                items: this.items,
                created_at: new Date(this.createdAt).getTime(),
                statuses: this.statuses,
                customer: {
                    temporary_phone: this.customer.phone,
                    name: this.customer.name,
                },
                delivery_address: this.deliveryAddress,
            },
        };
    }
}

export default Order;
