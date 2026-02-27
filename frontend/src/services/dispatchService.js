import api from './api';

const dispatchService = {
    getAll: async () => {
        const response = await api.get('/dispatch');
        return response.data;
    },
    create: async (dispatchData) => {
        const response = await api.post('/dispatch', dispatchData);
        return response.data;
    },
    receive: async (dispatchId) => {
        const response = await api.patch(`/dispatch/${dispatchId}/status`, { status: 'RECEIVED' });
        return response.data;
    }
};

export default dispatchService;
