import api from './api';

const reportService = {
    getDashboardStats: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    },
    getSalesReport: async (query) => {
        const response = await api.get('/reports/sales', { params: query });
        return response.data;
    },
    getInventoryReport: async () => {
        const response = await api.get('/reports/inventory');
        return response.data;
    }
};

export default reportService;
