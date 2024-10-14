const Owner = require('../ownerModel');
const Store = require('../storeModel');
const Category = require('../categoryModel');
const Product = require('../productModel');

// Define the associations
Owner.hasMany(Store, { foreignKey: 'owner_id', as: 'store' });

Store.belongsTo(Owner, { foreignKey: 'owner_id', as: 'owner' });
Store.hasMany(Category, { foreignKey: 'store_id', as: 'category' });

Category.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'product'});

Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category'});

module.exports = {
    Owner,
    Store,
    Category,
    Product,
};