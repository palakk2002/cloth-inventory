import api from './api';

const reportService = {
    getDashboardStats: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    },
    getDailySalesReport: async (query) => {
        const response = await api.get('/reports/daily-sales', { params: query });
        return response.data;
    }
};

export default reportService;
