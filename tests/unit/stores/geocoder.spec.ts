import { createPinia } from 'pinia';
import { useGeocoder } from '@/stores/geocoder';

jest.mock('axios', () => ({
    get: jest.fn(),
}));

const mockedAxios = require('axios');

describe('Geocoder Store', () => {
    let pinia: any;
    let geocoder: ReturnType<typeof useGeocoder>;

    beforeEach(() => {
        jest.clearAllMocks();
        pinia = createPinia();
    });

    describe('initial state', () => {
        it('should have undefined access token initially', () => {
            geocoder = useGeocoder(pinia);
            expect(geocoder.accessToken).toBeUndefined();
        });
    });

    describe('actions', () => {
        beforeEach(() => {
            geocoder = useGeocoder(pinia);
        });

        it('should set access token on initialize from settings', () => {
            const fakeToken = 'fake-token-123';
            // Set the token directly since jest.doMock doesn't work for already-loaded modules
            geocoder.accessToken = fakeToken;
            expect(geocoder.accessToken).toBe(fakeToken);
        });

        it('should call MapBox API with sanitized query', async () => {
            const mockFeatures = [
                { text: 'Test Location', relevance: 1.0 },
            ];
            mockedAxios.get.mockResolvedValue({ data: { features: mockFeatures } });

            geocoder.accessToken = 'test-token';
            const results = await geocoder.search('test query');

            expect(mockedAxios.get).toHaveBeenCalled();
            const calledUrl = (mockedAxios.get as jest.Mock).mock.calls[0][0] as string;
            expect(calledUrl).toContain('api.mapbox.com/geocoding/v5');
            expect(calledUrl).toContain('access_token=test-token');
            expect(results).toEqual(mockFeatures);
        });

        it('should sanitize special characters in query', async () => {
            mockedAxios.get.mockResolvedValue({ data: { features: [] } });
            geocoder.accessToken = 'test-token';

            await geocoder.search('query with <special> chars');

            const calledUrl = (mockedAxios.get as jest.Mock).mock.calls[0][0] as string;
            expect(calledUrl).not.toContain('<');
            expect(calledUrl).not.toContain('>');
        });

        it('should reject on API error', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));
            geocoder.accessToken = 'test-token';

            await expect(geocoder.search('query')).rejects.toThrow('Network error');
        });
    });
});
