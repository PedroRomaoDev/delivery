import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/pedidos.json');

class FindAllOrdersRepository {
    async execute() {
        try {
            const data = await fs.readFile(dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Erro ao ler pedidos: ${error.message}`);
        }
    }
}

export default FindAllOrdersRepository;
