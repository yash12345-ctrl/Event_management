const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required.'],
        trim: true 
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true, 
        trim: true,
        lowercase: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'] 
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required.'],
        trim: true
    },
    institution: {
        type: String,
        required: [true, 'Institution or company is required.'],
        trim: true
    },
    registrationId: {
        type: String,
        required: true,
        unique: true 
    },
    registeredAt: {
        type: Date,
        default: Date.now 
    }
});


const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
