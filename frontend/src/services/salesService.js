import api from './api';

const salesService = {
    getAll: async () => {
        const response = await api.get('/sales');
        return response.data;
    },
    createBill: async (billData) => {
        const response = await api.post('/sales', billData);
        return response.data;
    },
    getShopHistory: async (shopId) => {
        const response = await api.get(`/sales/shop/${shopId}`);
        return response.data;
    }
};

export default salesService;
