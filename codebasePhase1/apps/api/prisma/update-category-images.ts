import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categoryImageMap = [
    { slug: 'advertising-branding-products', url: 'http://localhost:4000/uploads/cat-branding.jpg' },
    { slug: 'acrylic-birthday-gift-items', url: 'http://localhost:4000/uploads/cat-acrylic-birthday.jpg' },
    { slug: 'acrylic-id-cards-creative-shapes', url: 'http://localhost:4000/uploads/cat-id-creative.jpg' },
    { slug: 'acrylic-id-cards-modern-shapes', url: 'http://localhost:4000/uploads/cat-id-modern.jpg' },
    { slug: 'mdf-gift-items', url: 'http://localhost:4000/uploads/cat-mdf-gifts.jpg' },
    { slug: 'acrylic-products', url: 'http://localhost:4000/uploads/cat-acrylic-products.jpg' },
    { slug: 'mdf-home-decor', url: 'http://localhost:4000/uploads/cat-mdf-home.png' },
  ];

  console.log('Updating category master image URLs in the database...');
  for (const item of categoryImageMap) {
    const category = await prisma.category.findUnique({
      where: { slug: item.slug },
    });

    if (category) {
      await prisma.category.update({
        where: { id: category.id },
        data: { masterImageUrl: item.url },
      });
      console.log(`Updated category: ${category.name} -> ${item.url}`);
    } else {
      console.warn(`Category with slug "${item.slug}" not found in database.`);
    }
  }

  console.log('Category master image synchronization complete.');
}

main()
  .catch((e) => {
    console.error('Error updating category master image URLs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
