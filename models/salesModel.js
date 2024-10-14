const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Sales = sequelize.define('Sales', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sale_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('completed', 'pending', 'canceled'),
        defaultValue: 'completed',
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'sales',
});

module.exports = Sales;