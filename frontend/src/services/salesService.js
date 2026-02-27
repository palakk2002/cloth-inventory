import api from './api';

const salesService = {
    getAll: async (shopId) => {
        const params = shopId ? { storeId: shopId } : {};
        const response = await api.get('/sales', { params });
        return response.data;
    },
    getByBarcode: async (barcode) => {
        const response = await api.get(`/sales/barcode/${barcode}`);
        return response.data;
    },
    create: async (saleData) => {
        const response = await api.post('/sales', saleData);
        return response.data;
    }
};

export default salesService;
