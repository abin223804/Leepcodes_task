import {DataTypes} from "sequelize";

const CartItemModel = (sequelize) => {
    return sequelize.define("CartItem", {
        quantity: DataTypes.INTEGER,
    });
};

export default CartItemModel;
