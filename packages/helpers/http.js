export const serverError = () => ({
    statusCode: 500,
    body: {
        message: 'Internal server error',
    },
});

export const ok = (body) => ({
    statusCode: 200,
    body,
});

export const created = (body) => ({
    statusCode: 201,
    body,
});

export const badRequest = (message) => ({
    statusCode: 400,
    body: {
        message,
    },
});

export const validationError = (errors) => {
    const fields = errors.map((err) => err.field).join(', ');
    const message =
        errors.length === 1
            ? `Validation error in field: ${fields}`
            : `Validation error in fields: ${fields}`;

    return {
        statusCode: 400,
        body: {
            message,
            errors,
        },
    };
};
