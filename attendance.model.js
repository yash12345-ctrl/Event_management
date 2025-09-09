const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    // This will link the attendance record back to the original registration
    registrationId: {
        type: String,
        required: true,
        ref: 'Registration' // Creates a reference to the Registration model
    },
    fullName: {
        type: String,
        required: true
    },
    checkedInAt: {
        type: Date,
        default: Date.now // Automatically records the time of check-in
    }
});

// To prevent duplicate check-ins, this ensures a single registrationId can only be logged once.
// If you want to allow multiple check-ins per person, you can remove this index.
attendanceSchema.index({ registrationId: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

