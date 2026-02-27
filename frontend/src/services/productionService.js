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
    moveStage: async (batchId, nextStage) => {
        const response = await api.patch(`/production/${batchId}/stage`, { stage: nextStage });
        return response.data;
    }
};

export default productionService;
