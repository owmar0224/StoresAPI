const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    store_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id',
        },
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'categories',
});

Category.sync({ alter: true })
    .then(() => console.log('Category table synced successfully.'))
    .catch((error) => console.log('Error syncing Category table: ', error));

module.exports = Category;