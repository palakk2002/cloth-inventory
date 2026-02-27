import api from './api';

const storeInventoryService = {
    getShopStock: async (shopId) => {
        const response = await api.get('/store-inventory', { params: { storeId: shopId } });
        return response.data;
    }
};

export default storeInventoryService;
