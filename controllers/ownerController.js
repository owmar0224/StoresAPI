const Owner = require('../models/ownerModel');
const Store = require('../models/storeModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const loginOwner = async (req, res) => {
    const { email, password } = req.body;
    try {
        const owner = await Owner.findOne({ where: { email, status: true } });
        if (!owner) return res.status(404).json({ message: 'Owner not found or deactivated.' });

        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: owner.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
  
    try {
      const ownerId = req.user.id;
      const owner = await Owner.findByPk(ownerId);
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, owner.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      owner.password = hashedNewPassword;
      await owner.save();
  
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const getOwnerDetails = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const owner = await Owner.findByPk(ownerId, {
            attributes: { exclude: ['password'] },
        });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

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

        const formattedStores = (stores || []).map(store => ({
            id: store.id,
            name: store.store_name,
            status: store.status,
            categories: (store.category || []).map(category => ({
                id: category.id,
                name: category.category_name,
                status: category.status,
                products: (category.product || []).map(product => ({
                    id: product.id,
                    name: product.product_name,
                    stock_level: product.stock_level,
                    price: product.price,
                    status: product.status,
                })),
            })),
        }));

        const response = formatOwnerResponse(owner, formattedStores);
        res.json({ owner: response });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateOwner = async (req, res) => {
    try {
        const { first_name, last_name } = req.body;
        const ownerId = req.user.id;
        const owner = await Owner.findByPk(ownerId);

        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        owner.first_name = first_name !== undefined ? first_name : owner.first_name;
        owner.last_name = last_name !== undefined ? last_name : owner.last_name;

        await owner.save();
        const responseOwner = formatOwnerResponse(owner);
        res.json({ message: 'Owner updated!', owner: responseOwner });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deactivateOwner = async (req, res) => {
  const ownerId = req.user.id;

  try {
      const owner = await Owner.findByPk(ownerId);
      if (!owner) return res.status(404).json({ message: 'Owner not found' });

      owner.status = false;
      await owner.save();

      res.json({ message: 'Owner has been deactivated successfully.' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const formatOwnerResponse = (owner, formattedStores) => {
  const formattedOwner = {
      id: owner.id,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      status: owner.status,
      createdAt: moment(owner.createdAt).format('YYYY-MM-DD HH:mm'),
      updatedAt: moment(owner.updatedAt).format('YYYY-MM-DD HH:mm'),
      stores: formattedStores
  };
  return formattedOwner;
};

module.exports = {
    loginOwner,
    changePassword,
    getOwnerDetails,
    updateOwner,
    deactivateOwner
};