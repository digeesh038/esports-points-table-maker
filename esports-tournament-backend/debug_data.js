import { Organization, Tournament, Match, Stage, User } from './src/models/index.js';

async function check() {
    process.env.SEQUELIZE_LOGGING = 'false'; // Attempt to disable logging if supported
    try {
        const matches = await Match.findAll({
            include: [{
                model: Stage,
                as: 'stage',
                include: [{
                    model: Tournament,
                    as: 'tournament',
                    include: [{
                        model: Organization,
                        as: 'organization'
                    }]
                }]
            }]
        });

        console.log('--- MATCH_DATA ---');
        for (const m of matches) {
            const org = m.stage?.tournament?.organization;
            console.log(`ID:${m.id} | TITLE:${m.customTitle || 'N/A'} | ORG_OWNER:${org?.ownerId} | ORG_NAME:${org?.name}`);
        }

        const users = await User.findAll();
        console.log('--- USER_DATA ---');
        for (const u of users) {
            console.log(`USER_ID:${u.id} | NAME:${u.name} | EMAIL:${u.email}`);
        }

        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    }
}

check();
