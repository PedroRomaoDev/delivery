import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class AddItemToOrderRepository {
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

            // Lê os pedidos existentes
            const data = await fs.readFile(dataPath, 'utf-8');
            const orders = JSON.parse(data);

            // Encontra o índice do pedido
            const orderIndex = orders.findIndex(
                (o) => o.order_id === orderData.order_id,
            );

            if (orderIndex === -1) {
                throw new Error('Order not found');
            }

            // Atualiza o pedido
            orders[orderIndex] = orderData;

            // Salva de volta no arquivo
            await fs.writeFile(
                dataPath,
                JSON.stringify(orders, null, 2),
                'utf-8',
            );

            return orderData;
        } catch (error) {
            // Preserva erros de negócio
            if (error.message === 'Order not found') {
                throw error;
            }
            throw new Error(
                `Erro ao adicionar item ao pedido: ${error.message}`,
            );
        }
    }
}

export default AddItemToOrderRepository;
