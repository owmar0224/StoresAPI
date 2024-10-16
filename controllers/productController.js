const Store = require('../models/storeModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Sales = require('../models/salesModel');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const sequelize = require('../connection/database');

const createProduct = async (req, res) => {
    const ownerId = req.user.id;
    const { category_id, product_name, stock_level, price, status } = req.body;

    if (!category_id || !product_name || price === undefined || price === null) {
        return res.status(400).json({ message: 'Validation error: category_id, product_name, and price are required.' });
    }

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

        const storeId = category.store.id;

        const product = await Product.create({
            category_id,
            product_name,
            stock_level,
            price,
            status
        }, { returning: true });

        if (req.file) {
            const productImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${storeId}/categories/${product.category_id}/products/${product.id}/`);
            const tempFilePath = req.file.path;

            if (!fs.existsSync(productImageDir)) {
                fs.mkdirSync(productImageDir, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            const newFileName = `${product.id}-${Date.now()}${fileExtension}`;
            const finalFilePath = path.join(productImageDir, newFileName);

            fs.renameSync(tempFilePath, finalFilePath);

            product.image = newFileName;
            await product.save();
        }

        const productWithCategory = await Product.findByPk(product.id, {
            include: {
                model: Category,
                as: 'category',
                include: {
                    model: Store,
                    as: 'store',
                },
            },
        });

        res.status(201).json({ message: 'Product created successfully', product: formatProduct(productWithCategory, ownerId) });

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
    const { category_id, product_name, status, stock_level, price } = req.body;

    try {
        const product = await Product.findByPk(id, {
            include: {
                model: Category,
                as: 'category',
                include: {
                    model: Store,
                    as: 'store',
                    where: { owner_id: ownerId },
                },
            },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let oldCategoryId = product.category_id;
        let oldCategoryDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${product.category.store.id}/categories/${oldCategoryId}/products/${product.id}/`);

        if (category_id !== undefined && category_id !== oldCategoryId) {
            const newCategory = await Category.findByPk(category_id, {
                include: {
                    model: Store,
                    as: 'store',
                    where: { owner_id: ownerId },
                },
            });

            if (!newCategory) {
                return res.status(403).json({ message: 'Unauthorized: Category does not belong to the owner' });
            }

            const newCategoryDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${newCategory.store.id}/categories/${category_id}/products/${product.id}/`);

            if (!fs.existsSync(newCategoryDir)) {
                fs.mkdirSync(newCategoryDir, { recursive: true });
            }

            if (fs.existsSync(oldCategoryDir)) {
                fs.renameSync(oldCategoryDir, newCategoryDir);
            }

            product.category_id = category_id;
        }

        product.product_name = product_name !== undefined ? product_name : product.product_name;
        product.status = status !== undefined ? status : product.status;
        product.stock_level = stock_level !== undefined ? stock_level : product.stock_level;
        product.price = price !== undefined ? price : product.price;

        const oldImage = product.image;

        if (req.file) {
            const productImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${product.category.store.id}/categories/${product.category_id}/products/${product.id}/`);
            const tempFilePath = req.file.path;

            if (oldImage) {
                const oldImagePath = path.join(productImageDir, oldImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            if (!fs.existsSync(productImageDir)) {
                fs.mkdirSync(productImageDir, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            const newFileName = `${product.id}-${Date.now()}${fileExtension}`;
            const finalFilePath = path.join(productImageDir, newFileName);

            fs.renameSync(tempFilePath, finalFilePath);

            product.image = newFileName;
        }

        await product.save();

        const updatedProduct = await Product.findByPk(product.id, {
            include: {
                model: Category,
                as: 'category',
                include: {
                    model: Store,
                    as: 'store',
                },
            },
        });

        res.json({ message: 'Product updated successfully', product: formatProduct(updatedProduct) });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const deleteProduct = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;

    const transaction = await sequelize.transaction();
    try {
        const product = await Product.findByPk(id, {
            include: {
                model: Category,
                as: 'category',
                include: {
                    model: Store,
                    as: 'store',
                    where: { owner_id: ownerId },
                },
            },
            transaction
        });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Product not found' });
        }

        await Sales.destroy({ where: { product_id: product.id }, transaction });

        const productImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${product.category.store.id}/categories/${product.category_id}/products/${product.id}/`);
        if (fs.existsSync(productImageDir)) {
            fs.rmSync(productImageDir, { recursive: true, force: true });
        }

        await product.destroy({ transaction });

        await transaction.commit();
        res.json({ message: 'Product and all associated data deleted successfully!' });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ error: error.message });
    }
};

const formatProduct = (product, ownerId) => {
    return {
      id: product.id,
      name: product.product_name,
      status: product.status,
      stockLevel: product.stock_level,
      price: product.price,
      status: product.status,
      createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm'),
      updatedAt: moment(product.updatedAt).format('YYYY-MM-DD HH:mm'),
      image: product.image ? path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${product.category.store.id}/categories/${product.category.id}/products/${product.id}`, product.image) : null,
      category: product.category ? {
        id: product.category.id,
        name: product.category.category_name,
        store: product.category.store ? {
          id: product.category.store.id,
          name: product.category.store.store_name,
          location: product.category.store.location,
        } : null
      } : null,
    };
  };
  
module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}