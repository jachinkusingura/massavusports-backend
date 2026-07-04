const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@massavusports.com',
        password: hashedPassword
      }
    });
    console.log('Seed: Default admin created (username: admin, password: password123)');
  } else {
    console.log('Seed: Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
