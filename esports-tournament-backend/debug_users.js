import { User } from './src/models/index.js';
import fs from 'fs';

async function check() {
    try {
        const users = await User.findAll();
        let out = '--- ALL_USERS ---\n';
        users.forEach(u => {
            out += `${u.id} | ${u.email} | ${u.name}\n`;
        });
        fs.writeFileSync('debug_users.log', out);
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('debug_users.log', e.stack);
        process.exit(1);
    }
}

check();
