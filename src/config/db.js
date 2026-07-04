const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

prisma.$connect()
    .then(() => console.log('Successfully connected to the database'))
    .catch((err) => {
        console.error('Failed to connect to the database:', err.message);
        if (err.code === 'P1001') {
            console.error('Tip: Check if your database is reachable and firewall allows connection on port 5432.');
        }
    });

module.exports = prisma;
