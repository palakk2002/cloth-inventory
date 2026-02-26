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
    receive: async (dispatchId, receiveData) => {
        const response = await api.put(`/dispatch/${dispatchId}/receive`, receiveData);
        return response.data;
    }
};

export default dispatchService;
