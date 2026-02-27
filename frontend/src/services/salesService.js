import api from './api';

const salesService = {
    getAll: async (shopId) => {
        const params = shopId ? { storeId: shopId } : {};
        const response = await api.get('/sales', { params });
        return response.data;
    },
    createBill: async (billData) => {
        const response = await api.post('/sales', billData);
        return response.data;
    }
};

export default salesService;
