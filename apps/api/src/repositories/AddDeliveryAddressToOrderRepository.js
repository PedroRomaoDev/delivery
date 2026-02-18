import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class AddDeliveryAddressToOrderRepository {
    constructor(dataPath = null) {
        this.dataPath = dataPath;
    }

    _getDataPath() {
        if (this.dataPath) {
            return this.dataPath;
        }
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return path.join(__dirname, '../data/pedidos.json');
    }

    async execute(orderData) {
        try {
            const dataPath = this._getDataPath();

            const data = await fs.readFile(dataPath, 'utf-8');
            const orders = JSON.parse(data);

            const orderIndex = orders.findIndex(
                (o) => o.order_id === orderData.order_id,
            );

            if (orderIndex === -1) {
                throw new Error('Order not found');
            }

            orders[orderIndex] = orderData;

            await fs.writeFile(
                dataPath,
                JSON.stringify(orders, null, 2),
                'utf-8',
            );

            return orderData;
        } catch (error) {
            if (error.message === 'Order not found') {
                throw error;
            }

            throw new Error('Failed to add delivery address to order');
        }
    }
}

export default AddDeliveryAddressToOrderRepository;
