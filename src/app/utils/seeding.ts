import envConfig from "../configs/env.config";
import User from "../modules/user/user.model";

export const seeding = async () => {
    try {
        const admin = await User.findOne({
            role: "admin",
            email: envConfig.admin.email,
            status: "active",
        });

        if (!admin) {
            console.log('Seeding started...');
            await User.create({
                name: {
                    firstName: envConfig.admin.firstName,
                    lastName: envConfig.admin.lastName
                },
                email: envConfig.admin.email,
                phone: envConfig.admin.phone,
                username: envConfig.admin.username,
                role: "admin",
                isEmailVerified: true,
                password: envConfig.admin.password
            });
            console.log('Admin created successfully...');
            console.log('Seeding completed...');
        }
    } catch (error) {
        console.log('Error in seeding', error);
    }
};