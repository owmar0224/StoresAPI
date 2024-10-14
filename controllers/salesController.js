const Sales = require('../models/salesModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Store = require('../models/storeModel');
const moment = require('moment');

const createSale = async (req, res) => {
    const { sales } = req.body;

    if (!Array.isArray(sales) || sales.length === 0) {
        return res.status(400).json({ message: 'Validation error: sales array is required.' });
    }

    try {
        const totalSales = [];
        let grandTotal = 0;

        for (const sale of sales) {
            const { product_id, quantity } = sale;

            if (!product_id || !quantity) {
                return res.status(400).json({ message: 'Validation error: product_id and quantity are required for each sale.' });
            }

            const product = await Product.findByPk(product_id);
            if (!product) {
                return res.status(404).json({ message: `Product with id ${product_id} not found` });
            }

            if (product.stock_level < quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product_id}` });
            }

            const total_price = product.price * quantity;

            const newSale = await Sales.create({ product_id, quantity, total_price });
            totalSales.push(formatSale(newSale));
            grandTotal += total_price;

            product.stock_level -= quantity;
            await product.save();
        }

        res.status(201).json({ 
            message: 'Sales created successfully', 
            sales: totalSales, 
            grandTotal 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getSales = async (req, res) => {
    const ownerId = req.user.id;
    try {
        const sales = await Sales.findAll({
            include: {
                model: Product,
                as: 'product',
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                      model: Store,
                      as: 'store',
                      where: { owner_id: ownerId},
                    },
                },
            },
        });

        const formattedSales = sales.map(formatSale);
        res.json({ sales: formattedSales });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getSaleById = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;
    try {
        const sale = await Sales.findByPk(id, {
            include: {
                model: Product,
                as: 'product',
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                      model: Store,
                      as: 'store',
                      where: { owner_id: ownerId},
                    },
                },
            },
        });

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json(formatSale(sale));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getSalesByStoreId = async (req, res) => {
    const ownerId = req.user.id;
    const { store_id } = req.params;

    try {
        const sales = await Sales.findAll({
            include: {
                model: Product,
                as: 'product',
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                        model: Store,
                        as: 'store',
                        where: { id: store_id, owner_id: ownerId },
                    },
                },
            },
        });

        if (!sales || sales.length === 0) {
            return res.status(404).json({ message: 'No sales found for this store' });
        }

        const formattedSales = sales.map(formatSale);
        res.json({ sales: formattedSales });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getSalesByProductId = async (req, res) => {
    const ownerId = req.user.id;
    const { product_id } = req.params;

    try {
        const sales = await Sales.findAll({
            where: { product_id },
            include: {
                model: Product,
                as: 'product',
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                        model: Store,
                        as: 'store',
                        where: { owner_id: ownerId },
                    },
                },
            },
        });

        if (!sales || sales.length === 0) {
            return res.status(404).json({ message: 'No sales found for this product' });
        }

        const formattedSales = sales.map(formatSale);
        res.json({ sales: formattedSales });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSale = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { product_id, quantity, status } = req.body;

    try {
        const sale = await Sales.findByPk(id, {
            include: {
                model: Product,
                as: 'product',
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                        model: Store,
                        as: 'store',
                        where: { owner_id: ownerId },
                    },
                },
            },
        });

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        const oldProductId = sale.product_id;
        const oldQuantity = sale.quantity;

        const oldProduct = await Product.findByPk(oldProductId);
        const newProduct = product_id ? await Product.findByPk(product_id) : null;

        if (oldProductId === product_id) {
            if (quantity !== undefined) {
                const quantityDifference = quantity - oldQuantity;
                oldProduct.stock_level -= quantityDifference;
                sale.quantity = quantity;
                sale.total_price = oldProduct.price * quantity;
            }
        } else {
            if (oldProduct) {
                oldProduct.stock_level += oldQuantity;
                await oldProduct.save();
            }
            if (newProduct) {
                newProduct.stock_level -= quantity;
                sale.product_id = product_id;
                sale.quantity = quantity;
                sale.total_price = newProduct.price * quantity;
            }
        }

        if (oldProduct) await oldProduct.save();
        if (newProduct) await newProduct.save();
        await sale.save();

        res.json({ message: 'Sale updated successfully', sale: formatSale(sale) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSale = async (req, res) => {
    const ownerId = req.user.id;
    const { id } = req.params;

    try {
        const sale = await Sales.findByPk(id, {
            include: {
                model: Product,
                as: 'product',
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                        model: Store,
                        as: 'store',
                        where: { owner_id: ownerId },
                    },
                },
            },
        });

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        const product = await Product.findByPk(sale.product_id);
        if (product) {
            product.stock_level += sale.quantity;
            await product.save();
        }

        await sale.destroy();
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const formatSale = (sale) => {
    return {
        id: sale.id,
        productId: sale.product_id,
        quantity: sale.quantity,
        totalPrice: sale.total_price,
        saleDate: moment(sale.sale_date).format('YYYY-MM-DD HH:mm'),
        status: sale.status,
    };
};

module.exports = {
    createSale,
    getSales,
    getSaleById,
    getSalesByStoreId,
    getSalesByProductId,
    updateSale,
    deleteSale,
};