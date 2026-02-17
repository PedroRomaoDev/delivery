class GeocodingService {
    constructor(baseUrl = 'https://nominatim.openstreetmap.org') {
        this.baseUrl = baseUrl;
        this.timeout = 3000; // 3 segundos
        this.minConfidence = 0.2; // Threshold de confiança mínima (importance do Nominatim)
    }

    /**
     * Realiza geocoding de um endereço
     * @param {Object} address - Endereço a ser geocodificado
     * @param {string} address.street_name - Nome da rua
     * @param {string} address.street_number - Número do endereço
     * @param {string} address.city - Cidade
     * @param {string} address.state - Estado
     * @param {string} address.country - País (código de 2 letras)
     * @param {string} [address.neighborhood] - Bairro (opcional)
     * @returns {Promise<{latitude: number, longitude: number, id: number}>}
     * @throws {Error} Se geocoding falhar ou tiver baixa confiança
     */
    async geocode(address) {
        try {
            // Monta a query de endereço
            const addressParts = [
                address.street_number,
                address.street_name,
                address.neighborhood,
                address.city,
                address.state,
                address.country,
            ]
                .filter(Boolean)
                .join(', ');

            // Monta a URL com parâmetros
            const params = new URLSearchParams({
                q: addressParts,
                format: 'json',
                limit: '1',
                addressdetails: '1',
            });

            const url = `${this.baseUrl}/search?${params.toString()}`;

            // Fetch com timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                this.timeout,
            );

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'DeliveryApp/1.0',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `Geocoding API error: ${response.status} ${response.statusText}`,
                );
            }

            const results = await response.json();

            if (!results || results.length === 0) {
                throw new Error('No geocoding results found');
            }

            const result = results[0];

            // Valida confiança do resultado
            const importance = parseFloat(result.importance) || 0;

            if (importance < this.minConfidence) {
                throw new Error(
                    `Low confidence geocoding result: ${importance}`,
                );
            }

            // Gera ID aleatório de 7 dígitos
            const id = Math.floor(Math.random() * 10000000);

            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                id,
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Geocoding timeout');
            }
            throw error;
        }
    }
}

export default GeocodingService;
