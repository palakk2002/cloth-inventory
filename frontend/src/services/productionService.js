import api from './api';

const productionService = {
    getAll: async () => {
        const response = await api.get('/production');
        return response.data;
    },
    create: async (batchData) => {
        const response = await api.post('/production', batchData);
        return response.data;
    },
    moveStatus: async (batchId, nextStatus) => {
        const response = await api.put(`/production/${batchId}/status`, { nextStatus });
        return response.data;
    },
    complete: async (batchId, completionData) => {
        const response = await api.post(`/production/${batchId}/complete`, completionData);
        return response.data;
    }
};

export default productionService;
