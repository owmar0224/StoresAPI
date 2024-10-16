const Store = require('../models/storeModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Sales = require('../models/salesModel');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const sequelize = require('../connection/database');

const createStore = async (req, res) => {
    const ownerId = req.user.id;
    const { store_name, location, status } = req.body;
    
    try {
        const store = await Store.create({
            owner_id: ownerId,
            store_name,
            location,
            status
        }, { returning: true });

        if (req.file) {
            const storeImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${store.id}/`);
            const tempFilePath = req.file.path;

            if (!fs.existsSync(storeImageDir)) {
                fs.mkdirSync(storeImageDir, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            const newFileName = `${store.id}-${Date.now()}${fileExtension}`;
            const finalFilePath = path.join(storeImageDir, newFileName);

            fs.renameSync(tempFilePath, finalFilePath);

            store.image = newFileName;
        }

        await store.save();

        const responseStore = formatStoreResponse(store);
        res.status(201).json({ message: 'Store created!', store: responseStore });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getStores = async (req, res) => {
    const ownerId = req.user.id;
    try {
        const stores = await Store.findAll({
            where: { owner_id: ownerId },
            include: {
                model: Category,
                as: 'category',
                include: {
                    model: Product,
                    as: 'product',
                },
            },
        });

        if (!stores || stores.length === 0) {
            return res.status(404).json({ message: 'No stores owned'});
        }

        const formattedStores = (stores || []).map(store =>
        ({
            id: store.id,
            owner_id: store.owner_id,
            store_name: store.store_name,
            location: store.location,
            image: path.join(__dirname, `../public/resources/uploads/owners/${store.owner_id}/stores/${store.id}/`, store.image),
            status: store.status,
            createdAt: moment(store.createdAt).format('YYYY-MM-DD HH:mm'),
            updatedAt: moment(store.updatedAt).format('YYYY-MM-DD HH:mm'),
            categories: (store.category || []).map(category => ({
                id: category.id,
                storeId: category.store_id,
                name: category.category_name,
                image: category.image ? path.join(__dirname, `../public/resources/uploads/owners/${store.owner_id}/stores/${category.store_id}/`, category.image) : null,
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
            })),
        })
        );

        res.json({ stores: formattedStores });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getStoreById = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, { where: { owner_id: req.user.id } });
        if (!store) return res.status(404).json({ message: 'Store not found' });
        const responseStore = formatStoreResponse(store);
        res.json({ store: responseStore });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateStore = async (req, res) => {
    const { store_name, location, status } = req.body;
    const storeId = req.params.id;
    const ownerId = req.user.id;

    try {
        const store = await Store.findByPk(storeId, { where: { owner_id: ownerId } });
        if (!store) return res.status(404).json({ message: 'Store not found' });

        store.store_name = store_name !== undefined ? store_name : store.store_name;
        store.location = location !== undefined ? location : store.location;
        store.status = status !== undefined ? status : store.status;

        const oldImage = store.image;

        if (req.file) {
            const storeImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${storeId}/`);
            const tempFilePath = req.file.path;

            if (oldImage) {
                const oldImagePath = path.join(storeImageDir, oldImage);
                
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            if (!fs.existsSync(storeImageDir)) {
                fs.mkdirSync(storeImageDir, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            const newFileName = `${storeId}-${Date.now()}${fileExtension}`;
            const finalFilePath = path.join(storeImageDir, newFileName);

            fs.renameSync(tempFilePath, finalFilePath);

            store.image = newFileName;
        }

        await store.save();

        const responseStore = formatStoreResponse(store);
        res.json({ message: 'Store updated!', store: responseStore });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteStore = async (req, res) => {
    const ownerId = req.user.id;
    const id = req.params.id;

    const transaction = await sequelize.transaction();
    try {
        const store = await Store.findByPk(id, {
            where: { owner_id: ownerId },
            transaction
        });

        if (!store) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Store not found' });
        }

        const categories = await Category.findAll({ where: { store_id: store.id }, transaction });

        for (const category of categories) {
            const products = await Product.findAll({ where: { category_id: category.id }, transaction });

            for (const product of products) {
                await Sales.destroy({ where: { product_id: product.id }, transaction });
            }

            await Product.destroy({ where: { category_id: category.id }, transaction });
        }

        await Category.destroy({ where: { store_id: store.id }, transaction });

        const storeImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/stores/${store.id}/`);
        if (fs.existsSync(storeImageDir)) {
            fs.rmSync(storeImageDir, { recursive: true, force: true });
        }

        await store.destroy({ transaction });

        await transaction.commit();
        res.json({ message: 'Store and all associated data deleted!' });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ error: error.message });
    }
};

const formatStoreResponse = (store) => {
    const formattedStore = {
        id: store.id,
        owner_id: store.owner_id,
        store_name: store.store_name,
        location: store.location,
        image: path.join(__dirname, `../public/resources/uploads/owners/${store.owner_id}/stores/${store.id}/`, store.image),
        status: store.status,
        createdAt: moment(store.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(store.updatedAt).format('YYYY-MM-DD HH:mm'),
    };
    return formattedStore;
};

module.exports = {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore
};