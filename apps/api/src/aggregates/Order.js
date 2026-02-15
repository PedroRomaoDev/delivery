import { randomUUID } from 'node:crypto';

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
     * Verifica se o pedido está em estado DRAFT
     * @returns {boolean}
     */
    isDraft() {
        return this.status === 'DRAFT';
    }

    /**
     * Adiciona um item ao pedido (apenas em DRAFT)
     * @param {Object} item - Item a ser adicionado
     * @param {number} item.productId - ID do produto
     * @param {number} item.quantity - Quantidade
     * @param {number} item.price - Preço unitário
     * @param {string} [item.observations] - Observações opcionais
     */
    addItem(item) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot add items to order that is not in DRAFT status',
            );
        }

        if (!item.productId || !item.quantity || !item.price) {
            throw new Error('Item must have productId, quantity and price');
        }

        const newItem = {
            id: randomUUID(),
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            observations: item.observations || null,
        };

        this.items.push(newItem);
        return newItem;
    }

    /**
     * Adiciona um pagamento ao pedido (apenas em DRAFT)
     * @param {Object} payment - Pagamento a ser adicionado
     * @param {string} payment.method - Método de pagamento (CREDIT_CARD, DEBIT_CARD, PIX, CASH)
     * @param {number} payment.value - Valor do pagamento
     */
    addPayment(payment) {
        if (!this.isDraft()) {
            throw new Error(
                'Cannot add payments to order that is not in DRAFT status',
            );
        }

        if (!payment.method || !payment.value) {
            throw new Error('Payment must have method and value');
        }

        const newPayment = {
            id: randomUUID(),
            method: payment.method,
            value: payment.value,
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
