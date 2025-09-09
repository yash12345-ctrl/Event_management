require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Registration = require('./registration.model');
const Attendance = require('./attendance.model'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully!"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });


app.get('/admin/registrations', async (req, res) => {
    try {
        const allRegistrations = await Registration.find({}).sort({ registeredAt: -1 });
        res.render('registrations', { registrations: allRegistrations });
    } catch (error) {
        res.status(500).send("Error fetching registration data.");
    }
});

app.get('/admin/attendance', async (req, res) => {
    try {
        const allAttendees = await Attendance.find({}).sort({ checkedInAt: -1 });
        res.render('attendance', { attendees: allAttendees });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).send("Error fetching attendance data.");
    }
});


app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, phone, institution } = req.body;
        if (!fullName || !email || !phone || !institution) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await Registration.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "This email address has already been registered." });
        }

        const newRegId = await generateUniqueRegId();
        const newRegistration = new Registration({
            fullName,
            email,
            phone,
            institution,
            registrationId: newRegId
        });

        const savedRegistration = await newRegistration.save();

        return res.status(201).json({
            message: "Registration successful!",
            name: savedRegistration.fullName,
            registrationId: savedRegistration.registrationId
        });
    } catch (error) {
        console.error("Error in /api/register:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
});

app.get('/api/verify/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await Registration.findOne({ registrationId: id });
        if (registration) {
            return res.status(200).json({
                id: registration.registrationId,
                name: registration.fullName,
                email: registration.email,
                phone: registration.phone,
                institution: registration.institution
            });
        } else {
            return res.status(404).json({ message: 'Invalid or unregistered pass.' });
        }
    } catch (error) {
        console.error("Error in /api/verify:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
});

app.post('/api/mark-attendance', async (req, res) => {
    try {
        const { registrationId, fullName } = req.body;

        if (!registrationId || !fullName) {
            return res.status(400).json({ message: 'Registration ID and Full Name are required.' });
        }

        const existingAttendance = await Attendance.findOne({ registrationId });
        if (existingAttendance) {
            return res.status(200).json({ message: 'Attendance already marked for this individual.' });
        }

        const newAttendance = new Attendance({
            registrationId,
            fullName
        });
        await newAttendance.save();

        console.log(`Attendance marked for ${fullName} (${registrationId})`);
        return res.status(201).json({ message: `Attendance successfully marked for ${fullName}.` });

    } catch (error) {
        console.error("Error in /api/mark-attendance:", error);
        return res.status(500).json({ message: "An internal server error occurred while marking attendance." });
    }
});

async function generateUniqueRegId() {
    let newRegId;
    let isUnique = false;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (!isUnique) {
        let part1 = '', part2 = '';
        for (let i = 0; i < 4; i++) {
            part1 += chars.charAt(Math.floor(Math.random() * chars.length));
            part2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        newRegId = `TWS-${part1}-${part2}`;
        const idExists = await Registration.findOne({ registrationId: newRegId });
        if (!idExists) { isUnique = true; }
    }
    return newRegId;
}

app.listen(PORT, () => {
    console.log('------------------------------------------');
    console.log(`🚀 Main website is available at: http://localhost:${PORT}`);
    console.log('------------------------------------------');
});
