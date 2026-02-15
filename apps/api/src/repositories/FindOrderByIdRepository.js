import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class FindOrderByIdRepository {
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

    async execute(orderId) {
        try {
            const dataPath = this._getDataPath();
            const data = await fs.readFile(dataPath, 'utf-8');
            const orders = JSON.parse(data);

            const order = orders.find((o) => o.order_id === orderId);

            if (!order) {
                return null;
            }

            return order;
        } catch (error) {
            throw new Error(`Erro ao buscar pedido: ${error.message}`);
        }
    }
}

export default FindOrderByIdRepository;
