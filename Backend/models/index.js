import { Sequelize } from 'sequelize';
import UserModel from './user.js';
import ProductModel from './product.js';
import CartModel from './cart.js';
import CartItemModel from './cartItem.js';
import dotenv from 'dotenv';
dotenv.config();


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});

const User = UserModel(sequelize);
const Product = ProductModel(sequelize);
const Cart = CartModel(sequelize);
const CartItem = CartItemModel(sequelize);

User.hasMany(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

export { sequelize, User, Product, Cart, CartItem };