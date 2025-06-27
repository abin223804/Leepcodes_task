import {DataTypes} from "sequelize";

const CartModel = (sequelize) => {
    return sequelize.define("Cart", {});
};

export default CartModel;
