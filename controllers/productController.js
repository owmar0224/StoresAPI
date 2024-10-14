const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Store = require('../models/storeModel');
const moment = require('moment');

const createProduct = async (req, res) => {
    const ownerId = req.user.id;
    const { category_id, product_name, status } = req.body;
    
    try {
        const category = await Category.findOne({
            where: { id: category_id },
            include: {
                model: Store,
                as: 'store',
                where: { owner_id: ownerId },
            },
        });

        if (!category) {
            return res.status(403).json({ message: 'You do not have permission to create a product in this category.' });
        }

        const newProduct = await Product.create({ category_id, product_name, status });
        res.status(201).json({ message: 'Product created successfully', product: formatProduct(newProduct) });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    const ownerId = req.user.id;
    try {
        const products = await Product.findAll({
          include: {
            model: Category,
            as: 'category',
            include: {
              model: Store,
              as: 'store',
              where: { owner_id: ownerId},
            }
          }
        });
        const formattedProducts = products.map(formatProduct);
        res.json(formattedProducts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id, {
            include: {
              model: Category,
              as: 'category',
              include: {
                model: Store,
                as: 'store',
                where: { owner_id: ownerId},
              }
            }
          });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(formatProduct(product));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { category_id, product_name, status } = req.body;
    try {
        const product = await Product.findByPk(id, {
            include: {
              model: Category,
              as: 'category',
              include: {
                model: Store,
                as: 'store',
                where: { owner_id: ownerId},
              }
            }
          });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (category_id !== undefined) {
            const category = await Category.findByPk(category_id, {
                include: {
                    model: Store,
                    as: 'store',
                    where: { owner_id: ownerId },
                }
            });

            if (!category) {
                return res.status(403).json({ message: 'Unauthorized: Category does not belong to the owner' });
            }
            product.category_id = category_id;
        }

        product.product_name = product_name !== undefined ? product_name : product.product_name;
        product.status = status !== undefined ? product.status : product.status;

        await product.save();
        res.json({ message: 'Product updated successfully', product: formatProduct(product) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id, {
            include: {
              model: Category,
              as: 'category',
              include: {
                model: Store,
                as: 'store',
                where: { owner_id: ownerId},
              }
            }
          });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const formatProduct = (product) => {
    return {
        id: product.id,
        categoryId: product.category_id,
        name: product.product_name,
        status: product.status,
        createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm'),
    };
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}