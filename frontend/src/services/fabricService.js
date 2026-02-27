import api from './api';

const fabricService = {
    getAll: async () => {
        const response = await api.get('/fabrics');
        return response.data;
    },
    create: async (fabricData) => {
        const response = await api.post('/fabrics', fabricData);
        return response.data;
    },
    update: async (id, fabricData) => {
        const response = await api.patch(`/fabrics/${id}`, fabricData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/fabrics/${id}`);
        return response.data;
    }
};

export default fabricService;
