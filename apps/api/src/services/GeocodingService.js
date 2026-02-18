class GeocodingService {
    constructor(baseUrl = 'https://nominatim.openstreetmap.org') {
        this.baseUrl = baseUrl;
        this.timeout = 3000;
        this.minConfidence = 0.2;
    }

    async geocode(address) {
        try {
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

            const params = new URLSearchParams({
                q: addressParts,
                format: 'json',
                limit: '1',
                addressdetails: '1',
            });

            const url = `${this.baseUrl}/search?${params.toString()}`;

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

            const importance = parseFloat(result.importance) || 0;

            if (importance < this.minConfidence) {
                throw new Error(
                    `Low confidence geocoding result: ${importance}`,
                );
            }

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
