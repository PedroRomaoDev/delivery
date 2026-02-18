import { ZodError } from 'zod';

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
        throw error;
    }
}

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
        throw error;
    }
}
