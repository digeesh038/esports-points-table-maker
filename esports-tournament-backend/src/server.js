import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { testConnection, sequelize } from './config/database.js';
import websocketService from './services/websocketService.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
websocketService.initialize(server);

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Starting Esports Tournament API Server...\n');

        // 1. Test database connection
        await testConnection();

        // 2a. Pre-sync: add 'none' to payment_method ENUMs outside transaction
        //     PostgreSQL requires ALTER TYPE ADD VALUE to run outside a transaction block.
        const enumFixes = [
            `DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_enum
                    WHERE enumlabel = 'none'
                    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_teams_payment_method')
                ) THEN
                    ALTER TYPE enum_teams_payment_method ADD VALUE 'none';
                END IF;
            EXCEPTION WHEN undefined_object THEN null;
            END $$;`,
            `DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_enum
                    WHERE enumlabel = 'none'
                    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_tournaments_payment_method')
                ) THEN
                    ALTER TYPE enum_tournaments_payment_method ADD VALUE 'none';
                END IF;
            EXCEPTION WHEN undefined_object THEN null;
            END $$;`,
        ];
        for (const sql of enumFixes) {
            try {
                await sequelize.query(sql);
            } catch (e) {
                console.warn('⚠️  Enum pre-fix skipped (may already exist):', e.message);
            }
        }
        console.log('✅ Enum types checked/updated\n');

        // 2b. Sync database tables
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synced successfully\n');


        // 3. Start HTTP server
        server.listen(PORT, () => {
            console.log('════════════════════════════════════════════════');
            console.log('🎮 ESPORTS TOURNAMENT API SERVER');
            console.log('════════════════════════════════════════════════');
            console.log(`📡 Server running on port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log(`💚 Health Check: http://localhost:${PORT}/health`);
            console.log(`🔌 WebSocket: Ready`);
            console.log('════════════════════════════════════════════════\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received: Shutting down gracefully...`);

    server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
            await sequelize.close();
            console.log('✅ Database connection closed');
        } catch (error) {
            console.error('❌ Error closing database:', error.message);
        }

        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();
