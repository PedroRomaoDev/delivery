jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
}));

import fs from 'fs/promises';
import FindAllOrdersRepository from './FindAllOrdersRepository.js';

const mockFs = fs;

beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.info.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
});

describe('FindAllOrdersRepository', () => {
    const makeSut = () => {
        const sut = new FindAllOrdersRepository('data/pedidos.json');
        return { sut };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all orders when file is read successfully', async () => {
        const { sut } = makeSut();

        const mockOrders = [
            {
                store_id: 'store-1',
                order_id: 'order-1',
                order: { total_price: 100 },
            },
            {
                store_id: 'store-2',
                order_id: 'order-2',
                order: { total_price: 200 },
            },
        ];

        mockFs.readFile.mockResolvedValue(JSON.stringify(mockOrders));

        const result = await sut.execute();

        expect(result).not.toBeNull();
        expect(result).toBeDefined();
        expect(result).toEqual(mockOrders);
        expect(result).toHaveLength(2);
        expect(result[0].order_id).toBe('order-1');
        expect(mockFs.readFile).toHaveBeenCalledTimes(1);
        expect(mockFs.readFile).toHaveBeenCalledWith(
            expect.stringContaining('pedidos.json'),
            'utf-8',
        );
    });

    it('should return empty array when file contains empty array', async () => {
        const { sut } = makeSut();

        mockFs.readFile.mockResolvedValue('[]');

        const result = await sut.execute();

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error when file does not exist', async () => {
        const { sut } = makeSut();

        mockFs.readFile.mockRejectedValue(
            new Error('ENOENT: no such file or directory'),
        );

        await expect(sut.execute()).rejects.toThrow('Erro ao ler pedidos');
        await expect(sut.execute()).rejects.toThrow(
            'ENOENT: no such file or directory',
        );
    });

    it('should throw error when file contains invalid JSON', async () => {
        const { sut } = makeSut();

        mockFs.readFile.mockResolvedValue('{ invalid json }');

        await expect(sut.execute()).rejects.toThrow('Erro ao ler pedidos');
    });

    it('should throw error when file read fails', async () => {
        const { sut } = makeSut();

        mockFs.readFile.mockRejectedValue(new Error('Permission denied'));

        await expect(sut.execute()).rejects.toThrow('Erro ao ler pedidos');
        await expect(sut.execute()).rejects.toThrow('Permission denied');
    });
});
