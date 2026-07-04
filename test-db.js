require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Connection failed:', e);
    process.exit(1);
  }
}

main();
