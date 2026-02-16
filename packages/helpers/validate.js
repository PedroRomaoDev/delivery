import { ZodError } from 'zod';

/**
 * Valida dados usando um schema Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @param {any} data - Dados a serem validados
 * @returns {{ success: true, data: any } | { success: false, errors: Array<{field: string, message: string}> }}
 */
export function validate(schema, data) {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = (error.issues || error.errors || []).map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return {
                success: false,
                errors,
            };
        }
        // Erro inesperado, propagar
        throw error;
    }
}

/**
 * Valida assincronamente dados usando um schema Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @param {any} data - Dados a serem validados
 * @returns {Promise<{ success: true, data: any } | { success: false, errors: Array<{field: string, message: string}> }>}
 */
export async function validateAsync(schema, data) {
    try {
        const validatedData = await schema.parseAsync(data);
        return {
            success: true,
            data: validatedData,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = (error.issues || error.errors || []).map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return {
                success: false,
                errors,
            };
        }
        // Erro inesperado, propagar
        throw error;
    }
}
