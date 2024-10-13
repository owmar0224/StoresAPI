const Category = require('../models/categoryModel');
const moment = require('moment');

const createCategory = async (req, res) => {
  const { store_id, category_name, status } = req.body;
  try {
    const newCategory = await Category.create({ store_id, category_name, status });
    res.status(201).json({ message: 'Category created successfully', category: formatCategory(newCategory) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    const formattedCategories = categories.map(formatCategory);
    res.json(formattedCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(formatCategory(category));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, status } = req.body;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.category_name = category_name !== undefined ? category_name : category.category_name;
    category.status = status !== undefined ? status : category.status;

    await category.save();
    res.json({ message: 'Category updated successfully', category: formatCategory(category) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const formatCategory = (category) => {
  return {
    id: category.id,
    storeId: category.store_id,
    name: category.category_name,
    status: category.status,
    createdAt: moment(category.createdAt).format('YYYY-MM-DD HH:mm'),
    updatedAt: moment(category.updatedAt).format('YYYY-MM-DD HH:mm'),
  };
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}