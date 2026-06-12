import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'akshatavnish123@gmail.com';
  const plainPassword = 'akshatavnish@456';
  
  console.log('Hashing new password...');
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  
  console.log('Searching for existing SUPER_ADMIN...');
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (existingSuperAdmin) {
    console.log(`Updating existing SUPER_ADMIN (ID: ${existingSuperAdmin.id}, Old Email: ${existingSuperAdmin.email})...`);
    await prisma.user.update({
      where: { id: existingSuperAdmin.id },
      data: {
        email,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        status: 'ACTIVE',
        isPlatformSuperAdmin: true,
        permissions: 'orders,products,categories,shipments,returns,analytics,payments',
        isActive: true,
        emailVerified: true,
      }
    });
    console.log('Super Admin credentials updated successfully.');
  } else {
    console.log('No existing SUPER_ADMIN found. Creating one...');
    await prisma.user.create({
      data: {
        email,
        firstName: 'Super',
        lastName: 'Admin',
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isPlatformSuperAdmin: true,
        permissions: 'orders,products,categories,shipments,returns,analytics,payments',
        emailVerified: true,
        isActive: true,
      }
    });
    console.log('Super Admin user created successfully.');
  }
}

main()
  .catch((e) => {
    console.error('Error updating super admin credentials:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
