import { z } from 'zod';

// Store ID padrão (mesma constante do backend)
const DEFAULT_STORE_ID = '98765432-abcd-ef00-1234-567890abcdef';

// Schema para Customer
export const customerSchema = z.object({
    name: z
        .string({
            required_error: 'Customer name is required',
            invalid_type_error: 'Customer name must be a string',
        })
        .min(1, 'Customer name cannot be empty'),
    phone: z
        .string({
            required_error: 'Customer phone is required',
            invalid_type_error: 'Customer phone must be a string',
        })
        .min(1, 'Customer phone cannot be empty'),
    email: z.string().email('Invalid email format').optional(),
});

// Schema para criar um pedido
// storeId é opcional e usa valor padrão se não fornecido
export const createOrderSchema = z.object({
    storeId: z
        .string({
            invalid_type_error: 'storeId must be a string',
        })
        .uuid('storeId must be a valid UUID')
        .optional()
        .default(DEFAULT_STORE_ID),
    customer: customerSchema,
});

// Schema para adicionar item ao pedido
export const addItemToOrderSchema = z.object({
    code: z
        .number({
            required_error: 'code is required',
            invalid_type_error: 'code must be a number',
        })
        .min(1, 'code cannot be empty'),
    quantity: z
        .number({
            required_error: 'quantity is required',
            invalid_type_error: 'quantity must be a number',
        })
        .int('quantity must be an integer')
        .positive('quantity must be a positive number'),
    name: z.string().optional().nullable(),
    observations: z.string().optional().nullable(),
});

// Schema para parâmetros de rota (orderId)
export const orderIdParamSchema = z.object({
    id: z
        .string({
            required_error: 'orderId is required',
            invalid_type_error: 'orderId must be a string',
        })
        .min(1, 'orderId cannot be empty'),
});

// Formas de pagamento aceitas
const PAYMENT_ORIGINS = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'PIX', 'VR'];

// Schema para adicionar pagamento ao pedido
export const addPaymentToOrderSchema = z.object({
    origin: z.enum(PAYMENT_ORIGINS, {
        errorMap: () => ({
            message: `Invalid payment origin. Must be one of: ${PAYMENT_ORIGINS.join(', ')}`,
        }),
    }),
    prepaid: z
        .boolean({
            invalid_type_error: 'prepaid must be a boolean (true or false)',
        })
        .optional()
        .default(true),
});

// Schema para coordinates (opcional)
const coordinatesSchema = z
    .object({
        latitude: z.number({
            required_error: 'latitude is required',
            invalid_type_error: 'latitude must be a number',
        }),
        longitude: z.number({
            required_error: 'longitude is required',
            invalid_type_error: 'longitude must be a number',
        }),
        id: z.number().optional(),
    })
    .optional()
    .nullable();

// Schema para adicionar endereço de entrega ao pedido
export const addDeliveryAddressToOrderSchema = z.object({
    street_name: z
        .string({
            required_error: 'street_name is required',
            invalid_type_error: 'street_name must be a string',
        })
        .min(1, 'street_name cannot be empty'),
    street_number: z
        .string({
            required_error: 'street_number is required',
            invalid_type_error: 'street_number must be a string',
        })
        .min(1, 'street_number cannot be empty'),
    city: z
        .string({
            required_error: 'city is required',
            invalid_type_error: 'city must be a string',
        })
        .min(1, 'city cannot be empty'),
    state: z
        .string({
            required_error: 'state is required',
            invalid_type_error: 'state must be a string',
        })
        .min(1, 'state cannot be empty'),
    postal_code: z
        .string({
            required_error: 'postal_code is required',
            invalid_type_error: 'postal_code must be a string',
        })
        .min(1, 'postal_code cannot be empty'),
    country: z
        .string({
            required_error: 'country is required',
            invalid_type_error: 'country must be a string',
        })
        .min(1, 'country cannot be empty'),
    neighborhood: z.string().optional().nullable(),
    reference: z.string().optional().nullable(),
    coordinates: coordinatesSchema,
});
