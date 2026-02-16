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

    // Se houver apenas um erro, mostrar a mensagem completa dele
    // Se houver múltiplos erros, mostrar os campos
    const message =
        errors.length === 1
            ? `${errors[0].field}: ${errors[0].message}`
            : `Validation error in fields: ${fields}`;

    return {
        statusCode: 400,
        body: {
            message,
            errors,
        },
    };
};
