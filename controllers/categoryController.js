const Category = require('../models/categoryModel');
const Store = require('../models/storeModel');
const moment = require('moment');

const createCategory = async (req, res) => {
  const ownerId = req.user.id;
  const { store_id, category_name } = req.body;
  
  try {
      const store = await Store.findOne({
          where: { id: store_id, owner_id: ownerId },
      });

      if (!store) {
          return res.status(403).json({ message: 'You do not have permission to create a category in this store.' });
      }

      const newCategory = await Category.create({ store_id, category_name });
      res.status(201).json({ message: 'Category created successfully', category: formatCategory(newCategory) });
      
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
  const ownerId = req.user.id;
  try {
    const categories = await Category.findAll({
      include: {
        model: Store,
        as: 'store',
        where: { owner_id: ownerId },
      },
    });
    
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories found for your stores' });
    }

    const formattedCategories = categories.map(formatCategory);
    res.json(formattedCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id, {
      include: {
        model: Store,
        as: 'store',
        where: { owner_id: ownerId },
      },
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(formatCategory(category));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategoriesByStoreId = async (req, res) => {
  const ownerId = req.user.id;
  const { store_id } = req.params;
  try {
    const categories = await Category.findAll({
      where: { store_id },
      include: {
        model: Store,
        as: 'store',
        where: { owner_id: ownerId },
      },
    });
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'No categories found for this store' });
    }
    const formattedCategories = categories.map(formatCategory);
    res.json(formattedCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;
  const { category_name, status } = req.body;
  try {
    const category = await Category.findByPk(id, {
      include: {
        model: Store,
        as: 'store',
        where: { owner_id: ownerId },
      },
    });
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
  const ownerId = req.user.id;
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id, {
      include: {
        model: Store,
        as: 'store',
        where: { owner_id: ownerId },
      },
    });
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
    getCategoriesByStoreId,
    updateCategory,
    deleteCategory
}