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
