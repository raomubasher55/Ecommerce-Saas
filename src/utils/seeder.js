const Product = require('../models/product')
const dotenv = require('dotenv')
const connectDatabase = require('../config/database')
const products = require('../data/product.json')

// setting env file
dotenv.config({path:"backend/config/config.env"})


connectDatabase();



const seedProducts = async ()=>{
    try{
        Product.deleteMany()
        console.log("products deleted");
        Product.insertMany(products)
        console.log("all products are added");
 
    }catch(error){
        console.log(error.message);
        process.exit()
    }
 }
 