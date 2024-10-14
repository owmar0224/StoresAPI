const Admin = require('../../models/adminModel');
const Owner = require('../../models/ownerModel');
const Store = require('../../models/storeModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const registerAdmin = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verification_code = crypto.randomBytes(20).toString('hex');
        
        const admin = await Admin.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            status: false,
            verification_code
        });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: 'Admin Registration Verification',
            text: `Please verify your account using this code: ${verification_code}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
        }
        
        res.status(201).json({ message: 'Admin registered successfully. Please check your email for the verification code.', admin: { id: admin.id, email: admin.email } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const resendVerification = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(404).json({ error: 'No admin found with this email.' });
        }

        const verification_code = crypto.randomBytes(20).toString('hex');
        
        admin.verification_code = verification_code;
        await admin.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: 'Resend Verification Email',
            text: `Please verify your account using this code: ${verification_code}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
        }

        res.status(200).json({ message: 'Verification email has been resent. Please check your email.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
};

const verifyAdmin = async (req, res) => {
    const { email, verification_code } = req.body;
    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        
        if (admin.verification_code !== verification_code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        admin.status = true;
        admin.verification_code = null;
        await admin.save();

        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        if (!admin.status) return res.status(403).json({ message: 'Account not verified. Please verify your email.'});

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(404).json({ error: 'No admin found with this email.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        admin.reset_token = resetToken;
        await admin.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please use the following token to reset your password: ${resetToken}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send token email. Please try again later.' });
        }

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const admin = await Admin.findOne({ where: { reset_token: token } });

        if (!admin) {
            return res.status(404).json({ error: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        admin.reset_token = null;
        await admin.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    try {
        const admin = await Admin.findByPk(adminId);

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedNewPassword;
        await admin.save();

        res.status(200).json({ message: 'Password has been changed successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
};

const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        const formattedAdmins = admins.map(formatAdminResponse);
        res.json(formattedAdmins);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        const responseAdmin = formatAdminResponse(admin);
        res.json(responseAdmin);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const admin = await Admin.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        admin.first_name = first_name !== undefined ? first_name : admin.first_name;
        admin.last_name = last_name !== undefined ? last_name : admin.last_name;
        admin.email = email !== undefined ? email : admin.email;
        await admin.save();
        
        const formattedAdmin = formatAdminResponse(admin);
        res.json({ message: 'Admin updated successfully', admin: formattedAdmin });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        await admin.destroy();
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const formatAdminResponse = (admin) => {
    return {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        createdAt: moment(admin.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(admin.updatedAt).format('YYYY-MM-DD HH:mm'),
    };
};

//  OWNER RELATED ENDPOINTS FOR ADMIN
const registerOwner = async (req, res) => {
    const { first_name, last_name, email } = req.body;
    
    const generatedPassword = crypto.randomBytes(4).toString('hex');

    try {
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        const owner = await Owner.create({ first_name, last_name, email, password: hashedPassword });
        const formattedOwner = formatOwnerResponse(owner);
        
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: owner.email,
            subject: 'Owner Registration Credentials',
            text: `Welcome! Your account has been created successfully. Your credentials are as follows:\n\nEmail: ${owner.email}\nPassword: ${generatedPassword}\n\nPlease change your password upon your first login.`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send credentials email. Please try again later.' });
        }

        res.status(201).json({ message: 'Owner registered successfully. The credentials have been sent to the provided email.', owner: formattedOwner });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const resetOwnerPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const owner = await Owner.findOne({ where: { email } });
        if (!owner) {
            return res.status(404).json({ error: 'No owner found with this email.' });
        }

        const newGeneratedPassword = crypto.randomBytes(4).toString('hex');
        const hashedNewPassword = await bcrypt.hash(newGeneratedPassword, 10);

        owner.password = hashedNewPassword;
        await owner.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: owner.email,
            subject: 'Password Reset Credentials',
            text: `Your password has been reset successfully. Your new credentials are as follows:\n\nEmail: ${owner.email}\nPassword: ${newGeneratedPassword}\n\nPlease change your password upon your first login.`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send new credentials email. Please try again later.' });
        }

        res.status(200).json({ message: 'Password reset successfully. New credentials have been sent to the provided email.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
};

const getOwners = async (req, res) => {
    try {
        const owners = await Owner.findAll({
            attributes: { exclude: ['password'] },
        });

        const formattedOwners = await Promise.all(owners.map(async (owner) => {
            const stores = await Store.findAll({
                where: { owner_id: owner.id },
                include: {
                    model: Category,
                    as: 'category',
                    include: {
                        model: Product,
                        as: 'product',
                    },
                },
            });

            const formattedStores = stores.map(store => ({
                id: store.id,
                name: store.store_name,
                categories: (store.category || []).map(category => ({
                    id: category.id,
                    name: category.category_name,
                    products: (category.product || []).map(product => ({
                        id: product.id,
                        name: product.product_name,
                        stock_level: product.stock_level,
                        price: product.price,
                        status: product.status,
                    })),
                    status: category.status,
                })),
                status: store.status,
            }));

            return formatOwnerResponse(owner, formattedStores);
        }));

        res.json({ owners: formattedOwners });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getOwnerById = async (req, res) => {
    try {
        const ownerId = req.params.id;

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

const deleteOwner = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const owner = await Owner.findByPk(ownerId);
        
        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        await owner.destroy();
        res.json({ message: 'Owner deleted!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
    registerAdmin,
    verifyAdmin,
    resendVerification,
    loginAdmin,
    forgotPassword,
    resetPassword,
    changePassword,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    registerOwner,
    resetOwnerPassword,
    getOwners,
    getOwnerById,
    deleteOwner
};