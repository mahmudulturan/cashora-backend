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
                role: "admin",
                pin: envConfig.admin.pin,
                nid: envConfig.admin.nid
            });
            console.log('Admin created successfully...');
            console.log('Seeding completed...');
        }
    } catch (error) {
        console.log('Error in seeding', error);
    }
};