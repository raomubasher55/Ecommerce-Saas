const mongoose = require('mongoose');

// DB_LOCAL_URI = mongodb+srv://raomubasher5555:Rao3937!@cluster0.07tu9yq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
 
const connectDatabase = () => {
mongoose.connect(process.env.DB_LOCAL_URI).then((con) => {
        console.log(`MongoDB connected: ${con.connection.host}`);
    }).catch(err => { 
        console.error(`Database connection error: ${err}`);
    });
} 

module.exports = connectDatabase; 