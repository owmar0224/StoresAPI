const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'owners',
            key: 'id',
        },
    },
    store_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
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
    tableName: 'stores',
});

Store.sync({ alter: true })
    .then(() => console.log('Store table synced successfully.'))
    .catch((error) => console.log('Error syncing Store table: ', error));

module.exports = Store;