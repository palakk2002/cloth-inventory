import api from './api';

const categoryService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    create: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};

export default categoryService;
