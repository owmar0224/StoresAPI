const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../connection/database');

const Owner = sequelize.define('Owner', {
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
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'owners'
});

Owner.sync({ alter: true })
    .then(() => console.log('Owner table synced successfully.'))
    .catch((error) => console.log('Error syncing Owner table: ', error));

module.exports = Owner;