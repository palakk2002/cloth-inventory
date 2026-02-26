import api from './api';

const storeService = {
    getAll: async () => {
        const response = await api.get('/stores');
        return response.data;
    },
    create: async (storeData) => {
        const response = await api.post('/stores', storeData);
        return response.data;
    },
    update: async (id, storeData) => {
        const response = await api.put(`/stores/${id}`, storeData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/stores/${id}`);
        return response.data;
    }
};

export default storeService;
