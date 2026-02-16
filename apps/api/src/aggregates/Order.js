import { randomUUID } from 'node:crypto';
import { DEFAULT_STORE_NAME } from '../config/constants.js';

class Order {
    /**
     * Cria um novo pedido no estado DRAFT
     * @param {string} storeId - ID da loja
     * @param {Object} customer - Dados do cliente
     * @param {string} customer.name - Nome do cliente
     * @param {string} customer.phone - Telefone do cliente
     */
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

    /**
     * Hidrata um pedido existente a partir dos dados do JSON
     * @param {Object} data - Dados do pedido no formato snake_case
     * @returns {Order}
     */
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

        return order;
    }

    /**
     * Verifica se o pedido está em estado DRAFT
     * @returns {boolean}
     */
    isDraft() {
        return this.status === 'DRAFT';
    }

    /**
     * Adiciona um item ao pedido (apenas em DRAFT)
     * @param {Object} item - Item a ser adicionado
     * @param {number} item.code - Código do produto
     * @param {number} item.quantity - Quantidade
     * @param {number} item.price - Preço unitário
     * @param {string} [item.name] - Nome do produto
     * @param {string} [item.observations] - Observações opcionais
     */
    addItem(item) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot add items to order that is not in DRAFT status',
            );
        }

        if (!item.code || !item.quantity || !item.price) {
            throw new Error('Item must have code, quantity and price');
        }

        const totalPrice = item.price * item.quantity;

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

    /**
     * Adiciona um pagamento ao pedido (apenas em DRAFT)
     * @param {Object} payment - Pagamento a ser adicionado
     * @param {string} payment.origin - Método de pagamento (CREDIT_CARD, PIX, CASH, VR, etc.)
     * @param {number} payment.value - Valor do pagamento
     * @param {boolean} [payment.prepaid=true] - Se o pagamento foi pré-pago
     */
    addPayment(payment) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot add payments to order that is not in DRAFT status',
            );
        }

        if (this.payments.length > 0) {
            throw new Error(
                'Order already has a payment. Only one payment is allowed per order',
            );
        }

        if (!payment.origin || !payment.value) {
            throw new Error('Payment must have origin and value');
        }

        const newPayment = {
            prepaid: payment.prepaid !== undefined ? payment.prepaid : true,
            value: payment.value,
            origin: payment.origin,
        };

        this.payments.push(newPayment);
        return newPayment;
    }

    /**
     * Define o endereço de entrega (apenas em DRAFT)
     * @param {Object} address - Endereço de entrega
     * @param {string} address.street - Rua
     * @param {string} address.number - Número
     * @param {string} address.city - Cidade
     * @param {string} address.state - Estado
     * @param {string} address.zipCode - CEP
     * @param {string} [address.complement] - Complemento opcional
     */
    setDeliveryAddress(address) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot set delivery address to order that is not in DRAFT status',
            );
        }

        if (
            !address ||
            !address.street ||
            !address.number ||
            !address.city ||
            !address.state ||
            !address.zipCode
        ) {
            throw new Error(
                'Address must have street, number, city, state and zipCode',
            );
        }

        this.deliveryAddress = {
            street: address.street,
            number: address.number,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            complement: address.complement || null,
        };

        return this.deliveryAddress;
    }

    /**
     * Calcula o valor total dos items
     * @returns {number}
     */
    getTotalItems() {
        return this.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }

    /**
     * Calcula o valor total dos pagamentos
     * @returns {number}
     */
    getTotalPayments() {
        return this.payments.reduce((total, payment) => {
            return total + payment.value;
        }, 0);
    }

    /**
     * Verifica se o pedido está completo e pronto para ser recebido
     * @returns {boolean}
     */
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

    /**
     * Retorna os passos que faltam para completar o pedido
     * @returns {string[]}
     */
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

    /**
     * Retorna uma representação simples do pedido para serialização
     * @returns {Object}
     */
    toJSON() {
        return {
            store_id: this.storeId,
            order_id: this.id,
            order: {
                customer: {
                    temporary_phone: this.customer.phone,
                    name: this.customer.name,
                },
                last_status_name: this.status,
                store: {
                    name: DEFAULT_STORE_NAME,
                    id: this.storeId,
                },
                items: this.items,
                payments: this.payments,
                delivery_address: this.deliveryAddress,
                created_at: new Date(this.createdAt).getTime(),
                total_price: this.getTotalItems(),
            },
        };
    }
}

export default Order;
