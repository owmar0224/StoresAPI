const Store = require('../models/storeModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Sales = require('../models/salesModel');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const sequelize = require('../connection/database');

const createCategory = async (req, res) => {
  const ownerId = req.user.id;
  const { store_id, category_name, status } = req.body;

  try {
      const store = await Store.findOne({
          where: { id: store_id, owner_id: ownerId },
      });

      if (!store) {
          return res.status(403).json({ message: 'You do not have permission to create a category in this store.' });
      }

      const category = await Category.create({
          store_id,
          category_name,
          status
      }, { returning: true });

      if (req.file) {
          const categoryImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${store.id}/categories/${category.id}/`);
          const tempFilePath = req.file.path;

          if (!fs.existsSync(categoryImageDir)) {
              fs.mkdirSync(categoryImageDir, { recursive: true });
          }

          const fileExtension = path.extname(req.file.originalname).toLowerCase();
          const newFileName = `${category.id}-${Date.now()}${fileExtension}`;
          const finalFilePath = path.join(categoryImageDir, newFileName);

          fs.renameSync(tempFilePath, finalFilePath);

          category.image = newFileName;
          await category.save();
      }

      const formattedCategory = formatCategory(category, ownerId);
      res.status(201).json({ message: 'Category created successfully', category: formattedCategory });

  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
  const ownerId = req.user.id;
  try {
      const categories = await Category.findAll({
          include: [
              {
                  model: Store,
                  as: 'store',
                  where: { owner_id: ownerId },
              },
              {
                  model: Product,
                  as: 'product',
              }
          ],
      });

      if (!categories || categories.length === 0) {
          return res.status(404).json({ message: 'No categories found for your stores' });
      }

      const formattedCategories = (categories || []).map(category => ({
          id: category.id,
          storeId: category.store_id,
          name: category.category_name,
          image: category.image ? path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${category.store_id}/`, category.image) : null,
          status: category.status,
          createdAt: moment(category.createdAt).format('YYYY-MM-DD HH:mm'),
          updatedAt: moment(category.updatedAt).format('YYYY-MM-DD HH:mm'),
          products: (category.product || []).map(product => ({
              id: product.id,
              name: product.product_name,
              stock_level: product.stock_level,
              price: product.price,
              status: product.status,
              createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm'),
              updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm'),
          })),
      }));

      res.json({ categories: formattedCategories });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store',
          where: { owner_id: ownerId },
        },
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const formattedCategory = {
      id: category.id,
      storeId: category.store_id,
      name: category.category_name,
      image: category.image ? path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${category.store_id}/`, category.image) : null,
      status: category.status,
      createdAt: moment(category.createdAt).format('YYYY-MM-DD HH:mm'),
      updatedAt: moment(category.updatedAt).format('YYYY-MM-DD HH:mm'),
      products: (category.product || []).map(product => ({
        id: product.id,
        name: product.product_name,
        stock_level: product.stock_level,
        price: product.price,
        status: product.status,
        createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm'),
      })),
    };

    res.json({ category: formattedCategory });
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
      include: [
        {
          model: Store,
          as: 'store',
          where: { owner_id: ownerId },
        },
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories found for this store' });
    }

    const formattedCategories = categories.map(category => ({
      id: category.id,
      storeId: category.store_id,
      name: category.category_name,
      image: category.image ? path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${category.store_id}/`, category.image) : null,
      status: category.status,
      createdAt: moment(category.createdAt).format('YYYY-MM-DD HH:mm'),
      updatedAt: moment(category.updatedAt).format('YYYY-MM-DD HH:mm'),
      products: (category.product || []).map(product => ({
        id: product.id,
        name: product.product_name,
        stock_level: product.stock_level,
        price: product.price,
        status: product.status,
        createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm'),
      })),
    }));

    res.json({ categories: formattedCategories });
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

    const oldImage = category.image;

    if (req.file) {
      const categoryImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${category.store_id}/categories/${category.id}/`);
      const tempFilePath = req.file.path;

      if (oldImage) {
        const oldImagePath = path.join(categoryImageDir, oldImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      if (!fs.existsSync(categoryImageDir)) {
        fs.mkdirSync(categoryImageDir, { recursive: true });
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const newFileName = `${category.id}-${Date.now()}${fileExtension}`;
      const finalFilePath = path.join(categoryImageDir, newFileName);

      fs.renameSync(tempFilePath, finalFilePath);

      category.image = newFileName;
    }

    await category.save();

    res.json({ message: 'Category updated successfully', category: formatCategory(category, ownerId) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const ownerId = req.user.id;
  const id = req.params.id;

  const transaction = await sequelize.transaction();
  try {
    const category = await Category.findByPk(id, {
      include: {
        model: Store,
        as: 'store',
        where: { owner_id: ownerId },
      },
      transaction
    });

    if (!category) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.findAll({ where: { category_id: category.id }, transaction });

    for (const product of products) {
      await Sales.destroy({ where: { product_id: product.id }, transaction });
    }

    await Product.destroy({ where: { category_id: category.id }, transaction });

    const categoryImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${category.store.id}/categories/${category.id}/`);
    if (fs.existsSync(categoryImageDir)) {
      fs.rmSync(categoryImageDir, { recursive: true, force: true });
    }

    await category.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'Category and all associated data deleted successfully!' });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

const formatCategory = (category, ownerId) => {
  return {
    id: category.id,
    storeId: category.store_id,
    name: category.category_name,
    image: category.image ? path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${category.store_id}/`, category.image) : null,
    status: category.status,
    createdAt: moment(category.createdAt).format('YYYY-MM-DD HH:mm'),
    updatedAt: moment(category.updatedAt).format('YYYY-MM-DD HH:mm'),
    products: (category.product || []).map(product => ({
      id: product.id,
      name: product.product_name,
      stock_level: product.stock_level,
      price: product.price,
      status: product.status,
      createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm'),
      updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm'),
    })),
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