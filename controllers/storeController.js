const Store = require('../models/storeModel');
const moment = require('moment');

const createStore = async (req, res) => {
    const { store_name, location, status } = req.body;
    try {
        const store = await Store.create({ owner_id: req.user.id, store_name, location, status });
        const responseStore = formatStoreResponse(store);
        res.status(201).json({ message: 'Store created!', store: responseStore });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getStores = async (req, res) => {
    try {
        const stores = await Store.findAll({ where: { owner_id: req.user.id } });
        const formattedStores = stores.map(store => formatStoreResponse(store));
        res.json(formattedStores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getStoreById = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, { where: { owner_id: req.user.id } });
        if (!store) return res.status(404).json({ message: 'Store not found' });
        const responseStore = formatStoreResponse(store);
        res.json(responseStore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateStore = async (req, res) => {
    const { store_name, location, status } = req.body;
    try {
        const store = await Store.findByPk(req.params.id, { where: { owner_id: req.user.id } });
        if (!store) return res.status(404).json({ message: 'Store not found' });

        store.store_name = store_name !== undefined ? store_name : store.store_name;
        store.location = location !== undefined ? location : store.location;
        store.status = status !== undefined ? status : store.status;

        await store.save();
        const responseStore = formatStoreResponse(store);
        res.json({ message: 'Store updated!', store: responseStore });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteStore = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, { where: { owner_id: req.user.id } });
        if (!store) return res.status(404).json({ message: 'Store not found' });

        await store.destroy();
        res.json({ message: 'Store deleted!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const formatStoreResponse = (store) => {
    return {
        id: store.id,
        owner_id: store.owner_id,
        store_name: store.store_name,
        location: store.location,
        status: store.status,
        createdAt: moment(store.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(store.updatedAt).format('YYYY-MM-DD HH:mm'),
    };
};

module.exports = {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore
};