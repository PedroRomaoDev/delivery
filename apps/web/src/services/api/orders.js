const API_BASE_URL = 'http://localhost:8080';

export const getOrders = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const getOrderById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};
