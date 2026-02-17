import GeocodingService from './GeocodingService.js';

describe('GeocodingService', () => {
    let geocodingService;

    beforeEach(() => {
        geocodingService = new GeocodingService();
        jest.clearAllMocks();
    });

    describe('geocode', () => {
        it('should geocode a valid address successfully', async () => {
            const mockResponse = [
                {
                    lat: '-15.835',
                    lon: '-48.025',
                    importance: 0.9,
                },
            ];

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                }),
            );

            const address = {
                street_name: 'Rua das Pitangueiras',
                street_number: '1050',
                city: 'Brasília',
                state: 'Distrito Federal',
                country: 'BR',
            };

            const result = await geocodingService.geocode(address);

            expect(result).toHaveProperty('latitude');
            expect(result).toHaveProperty('longitude');
            expect(result).toHaveProperty('id');
            expect(result.latitude).toBe(-15.835);
            expect(result.longitude).toBe(-48.025);
            expect(typeof result.id).toBe('number');
            expect(result.id).toBeGreaterThanOrEqual(0);
            expect(result.id).toBeLessThan(10000000);
        });

        it('should include neighborhood in geocoding query', async () => {
            const mockResponse = [
                {
                    lat: '0',
                    lon: '0',
                    importance: 0.8,
                },
            ];

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                }),
            );

            const address = {
                street_name: 'Rua A',
                street_number: '123',
                neighborhood: 'Águas Claras',
                city: 'Brasília',
                state: 'DF',
                country: 'BR',
            };

            await geocodingService.geocode(address);

            const callUrl = global.fetch.mock.calls[0][0];
            // Verifica se a URL contém "Claras" (parte do neighborhood)
            expect(callUrl).toContain('Claras');
        });

        it('should throw error when no results found', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                }),
            );

            const address = {
                street_name: 'Rua Inexistente',
                street_number: '999999',
                city: 'Cidade Fantasma',
                state: 'XX',
                country: 'ZZ',
            };

            await expect(geocodingService.geocode(address)).rejects.toThrow(
                'No geocoding results found',
            );
        });

        it('should throw error when confidence is too low', async () => {
            const mockResponse = [
                {
                    lat: '0',
                    lon: '0',
                    importance: 0.1, // Abaixo do threshold de 0.2
                },
            ];

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                }),
            );

            const address = {
                street_name: 'Rua',
                street_number: '1',
                city: 'Cidade',
                state: 'Estado',
                country: 'BR',
            };

            await expect(geocodingService.geocode(address)).rejects.toThrow(
                'Low confidence geocoding result',
            );
        });

        it('should throw error on API error response', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                }),
            );

            const address = {
                street_name: 'Rua',
                street_number: '1',
                city: 'Cidade',
                state: 'Estado',
                country: 'BR',
            };

            await expect(geocodingService.geocode(address)).rejects.toThrow(
                'Geocoding API error',
            );
        });

        it('should generate different random IDs for different calls', async () => {
            const mockResponse = [
                {
                    lat: '-15.835',
                    lon: '-48.025',
                    importance: 0.9,
                },
            ];

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                }),
            );

            const address = {
                street_name: 'Rua',
                street_number: '1',
                city: 'Cidade',
                state: 'Estado',
                country: 'BR',
            };

            const result1 = await geocodingService.geocode(address);
            const result2 = await geocodingService.geocode(address);

            // IDs devem ser diferentes (estatisticamente muito improvável serem iguais)
            expect(result1.id).not.toBe(result2.id);
        });
    });
});
