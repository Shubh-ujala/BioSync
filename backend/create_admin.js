const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Fallback to local string if env is missing, but env should work
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_system';

        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        const email = 'admin@biopulse.com';
        const password = 'adminpassword123';
        const username = 'AdminUser';

        let user = await User.findOne({ email });
        if (user) {
            console.log('Admin user already exists');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                username,
                email,
                password: hashedPassword,
                role: 'admin'
            });

            await user.save();
            console.log('Admin user created successfully');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }

    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        // Force close connection to exit script
        await mongoose.connection.close();
        process.exit(0);
    }
};

createAdmin();
