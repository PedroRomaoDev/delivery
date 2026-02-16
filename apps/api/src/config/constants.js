// Store ID padrão para todas as operações
export const DEFAULT_STORE_ID = '98765432-abcd-ef00-1234-567890abcdef';

// Nome da loja padrão
export const DEFAULT_STORE_NAME = 'COCO BAMBU CHIQUE CHIQUE';

// Formas de pagamento aceitas
export const PAYMENT_ORIGINS = {
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    CASH: 'CASH',
    PIX: 'PIX',
    VR: 'VR',
};

// Outras constantes relacionadas a pedidos
export const ORDER_STATUSES = {
    DRAFT: 'DRAFT',
    RECEIVED: 'RECEIVED',
    CONFIRMED: 'CONFIRMED',
    DISPATCHED: 'DISPATCHED',
    DELIVERED: 'DELIVERED',
    CANCELED: 'CANCELED',
};
