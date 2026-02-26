import api from './api';

const staffService = {
    getAll: async () => {
        const response = await api.get('/staff');
        return response.data;
    },
    create: async (staffData) => {
        const response = await api.post('/staff', staffData);
        return response.data;
    },
    update: async (id, staffData) => {
        const response = await api.put(`/staff/${id}`, staffData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/staff/${id}`);
        return response.data;
    }
};

export default staffService;
