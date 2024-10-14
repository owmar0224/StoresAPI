const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verification_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'admins',
});

module.exports = Admin;