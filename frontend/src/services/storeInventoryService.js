import api from './api';

const storeInventoryService = {
    getShopStock: async (shopId) => {
        const response = await api.get(`/store-inventory/${shopId}`);
        return response.data;
    },
    updateStockThreshold: async (shopId, productId, threshold) => {
        const response = await api.put(`/store-inventory/${shopId}/threshold`, { productId, threshold });
        return response.data;
    }
};

export default storeInventoryService;
