import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

try {
    if (process.env.DATABASE_URL) {
        // 🔥 Production (Render)
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
            logging: false,
        });

        console.log('🌍 Using production database');
    } else {
        // 🖥 Local development
        sequelize = new Sequelize(
            process.env.DB_NAME || 'esports_tournament',
            process.env.DB_USER || 'postgres',
            process.env.DB_PASSWORD || 'postgres',
            {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 5432,
                dialect: 'postgres',
                logging: process.env.NODE_ENV === 'development' ? console.log : false,
            }
        );

        console.log('💻 Using local database');
    }
} catch (error) {
    console.error('❌ Database initialization failed:', error.message);
}

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        throw error;
    }
};

export { sequelize, testConnection };