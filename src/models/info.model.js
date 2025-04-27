const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema({
    email: {
         type: String,
    },
    phone: {
         type: String,
    },
    address: {
         type: String,
    }
}, {
    timestamps: true
});

infoSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Info = mongoose.model('Info', infoSchema);

module.exports = Info;