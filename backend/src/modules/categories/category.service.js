const Category = require('../../models/category.model');

const getAll = async () => {
    return await Category.find({ isDeleted: false }).sort({ name: 1 });
};

const create = async (categoryData) => {
    return await Category.create(categoryData);
};

const deleteCategory = async (id) => {
    return await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

module.exports = {
    getAll,
    create,
    deleteCategory
};
