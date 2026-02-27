const categoryService = require('./category.service');
const { sendSuccess, sendError, sendCreated } = require('../../utils/response.handler');

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAll();
        return sendSuccess(res, { categories }, 'Categories retrieved successfully');
    } catch (err) {
        next(err);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.create(req.body);
        return sendCreated(res, { category }, 'Category created successfully');
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        return sendSuccess(res, {}, 'Category deleted successfully');
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    deleteCategory
};
