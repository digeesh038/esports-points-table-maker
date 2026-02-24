import { sequelize } from './config/database.js';
import './models/index.js'; // Load all model definitions

async function migrate() {
    try {
        console.log('\n════════════════════════════════════');
        console.log('  🔄  ESPORTS DB MIGRATION TOOL  ');
        console.log('════════════════════════════════════\n');

        console.log('📡 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established.\n');

        console.log('🛠  Syncing schema (alter: true — non-destructive)...');
        await sequelize.sync({ alter: true });

        console.log('\n════════════════════════════════════');
        console.log('  ✅  MIGRATION COMPLETE!  ');
        console.log('════════════════════════════════════');
        console.log('All tables and columns are up to date.\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration FAILED:\n');
        if (error.original) {
            // Sequelize-level error
            console.error('  Code   :', error.original.code);
            console.error('  Detail :', error.original.detail || error.original.message);
        } else {
            console.error(error.message || error);
        }
        console.error('\n📋 Tips:');
        console.error('  • Make sure your DATABASE_URL or DB_* env vars are correct');
        console.error('  • If running locally, ensure PostgreSQL is running');
        console.error('  • Production (Render/Railway): set DATABASE_URL in environment\n');
        process.exit(1);
    }
}

migrate();
