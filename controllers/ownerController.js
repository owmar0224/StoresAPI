const Owner = require('../models/ownerModel');
const Store = require('../models/storeModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

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

        const oldImage = owner.image;

        if (req.file) {
            const ownerImageDir = path.join(__dirname, `../public/resources/uploads/owners/${ownerId}/`);
            const tempFilePath = req.file.path;

            if (oldImage) {
                const oldImagePath = path.join(ownerImageDir, oldImage);
                
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            if (!fs.existsSync(ownerImageDir)) {
                fs.mkdirSync(ownerImageDir, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            const newFileName = `${ownerId}-${Date.now()}${fileExtension}`;
            const finalFilePath = path.join(ownerImageDir, newFileName);

            fs.renameSync(tempFilePath, finalFilePath);

            owner.image = newFileName;
            
        }

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
      image: path.join(__dirname, `../public/resources/uploads/owners/${owner.id}/`, owner.image),
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