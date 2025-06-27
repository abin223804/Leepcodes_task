import {DataTypes} from "sequelize";

const ProductModel = (sequelize) => {
    return sequelize.define("Product", {
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        price: DataTypes.FLOAT,
        stock: DataTypes.INTEGER,
        imageUrl: DataTypes.STRING,
    });
};

export default ProductModel;
