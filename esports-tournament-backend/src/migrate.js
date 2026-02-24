import { sequelize } from './config/database.js';
import './models/index.js'; // Ensure models are loaded

async function migrate() {
    try {
        console.log('🔄 Starting manual database migration...');
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        // This will force add the columns
        await sequelize.sync({ alter: true });

        console.log('🚀 Migration successful! All columns added.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
