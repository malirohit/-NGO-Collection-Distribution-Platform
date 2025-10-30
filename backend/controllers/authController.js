import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signup = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, role, category, location, description } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const logoUrl = req.file ? req.file.path : undefined;

        // Prepare user data
        const userData = {
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role
        };

        if (role === 'ngo') {
            userData.category = category;
            userData.location = location;
            userData.description = description;
            userData.logoUrl = logoUrl;
        }

        // Create user
        const user = await userModel.create(userData);

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            category: user.category,
            location: user.location,
            description: user.description,
            logoUrl: user.logoUrl,
        };

        res.status(201).json({ success: true, user: safeUser, token });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message || 'Something went wrong' });
    }
};

const login = async (req, res) => {


    const { email, password } = req.body;

    try {

        const user = await userModel.findOne({ email });

        if (!user) return res.status(400).json({ success: false, message: 'User Not Found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Wrong Password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            category: user.category,
            location: user.location,
            description: user.description,
            logoUrl: user.logoUrl,
        };
        res.status(200).json({
            success: true,
            message: 'Login Successful',
            user: safeUser,
            token
        });
        // The response from the backend will be wrapped like this:
        // {
        //   data: {
        //     success: true,
        //     message: "Login Successful",
        //     user: { ... },
        //     token: "..."
        //   },
        //   status: 200,
        //   statusText: "OK",
        //   headers: { ... },
        //   config: { ... }
        // }

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllNGOs = async (req, res) => {

    try {

        const ngos = await userModel.find({ role: "ngo" }).select("logoUrl name category location description")

        res.status(200).json({
            success: true,
            message: "All NGOs Fetched Successfully",
            ngos // array of NGO objects
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error fetching NGOs",
            error: error.message
        });

    }

}

export { login, signup, getAllNGOs };
