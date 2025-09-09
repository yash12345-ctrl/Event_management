const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    registrationId: {
        type: String,
        required: true,
        ref: 'Registration' 
    },
    fullName: {
        type: String,
        required: true
    },
    checkedInAt: {
        type: Date,
        default: Date.now 
    }
});

attendanceSchema.index({ registrationId: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

