import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class CreateOrderRepository {
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

    async execute(order) {
        try {
            const dataPath = this._getDataPath();

            // Lê os pedidos existentes
            let orders = [];
            try {
                const data = await fs.readFile(dataPath, 'utf-8');
                orders = JSON.parse(data);
            } catch (error) {
                // Se o arquivo não existe, inicia com array vazio
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }

            // Adiciona o novo pedido
            const orderData = order.toJSON();
            orders.push(orderData);

            // Salva de volta no arquivo
            await fs.writeFile(
                dataPath,
                JSON.stringify(orders, null, 2),
                'utf-8',
            );

            return orderData;
        } catch (error) {
            throw new Error(`Erro ao criar pedido: ${error.message}`);
        }
    }
}

export default CreateOrderRepository;
