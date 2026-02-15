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
