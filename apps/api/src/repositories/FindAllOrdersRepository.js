import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

class FindAllOrdersRepository {
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

    async execute() {
        try {
            const dataPath = this._getDataPath();
            const data = await fs.readFile(dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Erro ao ler pedidos: ${error.message}`);
        }
    }
}

export default FindAllOrdersRepository;
