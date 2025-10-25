import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'ngo'], required: true },

    // Fields specific to NGO
    logoUrl: { type: String },
    category: { type: String },
    location: { type: String },
    description: { type: String }
}, { timestamps: true });

// Conditional validation: NGO fields are required only for NGOs
userSchema.pre('validate', function (next) {
    if (this.role === 'ngo') {
        if (!this.category || !this.location || !this.description) {
            return next(new Error('Missing required NGO fields'));
        }
    }
    next();
});

const userModel = mongoose.models.User ||
    mongoose.model('User', userSchema)

export default userModel