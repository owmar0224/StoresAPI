const Owner = require('../models/ownerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const registerOwner = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const owner = await Owner.create({ first_name, last_name, email, password: hashedPassword });
        const responseOwner = formatOwnerResponse(owner);
        res.status(201).json({ message: 'Owner registered!', owner: responseOwner });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const loginOwner = async (req, res) => {
    const { email, password } = req.body;
    try {
        const owner = await Owner.findOne({ where: { email } });
        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: owner.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getOwners = async (req, res) => {
    try {
        const owners = await Owner.findAll();
        const formattedOwners = owners.map(owner => formatOwnerResponse(owner));
        res.json(formattedOwners);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getOwnerById = async (req, res) => {
    try {
        const owner = await Owner.findByPk(req.params.id);
        if (!owner) return res.status(404).json({ message: 'Owner not found' });
        const responseOwner = formatOwnerResponse(owner);
        res.json(responseOwner);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateOwner = async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const ownerId = req.params.id; // Get ownerId from request parameters
        const owner = await Owner.findByPk(ownerId);

        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        owner.first_name = first_name !== undefined ? first_name : owner.first_name;
        owner.last_name = last_name !== undefined ? last_name : owner.last_name;
        owner.email = email !== undefined ? email : owner.email;
        await owner.save();
        
        const responseOwner = formatOwnerResponse(owner);
        res.json({ message: 'Owner updated!', owner: responseOwner });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteOwner = async (req, res) => {
    try {
        const ownerId = req.params.id; // Get ownerId from request parameters
        const owner = await Owner.findByPk(ownerId);
        
        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        await owner.destroy();
        res.json({ message: 'Owner deleted!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const formatOwnerResponse = (owner) => {
    const formattedOwner = {
        id: owner.id,
        first_name: owner.first_name,
        last_name: owner.last_name,
        email: owner.email,
        createdAt: moment(owner.createdAt).format('YYYY-MM-DD HH:mm'),
        updatedAt: moment(owner.updatedAt).format('YYYY-MM-DD HH:mm'),
    };
    return formattedOwner;
};

module.exports = {
    registerOwner,
    loginOwner,
    getOwners,      // Move to Admin
    getOwnerById,   // Move to Admin then Replace with GetOwnerDetails
    updateOwner,
    deleteOwner
};