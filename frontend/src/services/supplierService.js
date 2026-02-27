import api from './api';

const supplierService = {
    getAll: async () => {
        const response = await api.get('/suppliers');
        return response.data;
    },
    create: async (supplierData) => {
        const response = await api.post('/suppliers', supplierData);
        return response.data;
    },
    update: async (id, supplierData) => {
        const response = await api.patch(`/suppliers/${id}`, supplierData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    }
};

export default supplierService;
