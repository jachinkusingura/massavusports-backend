const prisma = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  try {
    await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@massavusports.com',
        password: hashedPassword
      }
    });
    console.log("Admin user seeded successfully! (Username: admin, Password: password123)");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}
seedAdmin();
