import api from './api';

const categoryService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data.categories || [];
    },
    create: async (categoryData) => {
        const response = await api.post('/categories', categoryData);
        return response.data.category;
    },
    update: async (id, categoryData) => {
        const response = await api.patch(`/categories/${id}`, categoryData);
        return response.data.category;
    },
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};

export default categoryService;
