import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database...');
  await prisma.shipmentEvent.deleteMany();
  await prisma.returnEvent.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderTimelineEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.superAdminInvitation.deleteMany();
  await prisma.orderDesignFile.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding top-level categories...');
  const catBranding = await prisma.category.create({
    data: { name: 'Advertising & Branding Products', slug: 'advertising-branding-products', sortOrder: 1, isActive: true },
  });
  const catBirthday = await prisma.category.create({
    data: { name: 'Acrylic Birthday Gift Items', slug: 'acrylic-birthday-gift-items', sortOrder: 2, isActive: true },
  });
  const catIDCardsCreative = await prisma.category.create({
    data: { name: 'Acrylic ID Cards – Creative Shapes', slug: 'acrylic-id-cards-creative-shapes', sortOrder: 3, isActive: true },
  });
  const catIDCardsModern = await prisma.category.create({
    data: { name: 'Acrylic ID Cards – Modern Shapes', slug: 'acrylic-id-cards-modern-shapes', sortOrder: 4, isActive: true },
  });
  const catMDFGifts = await prisma.category.create({
    data: { name: 'MDF Gift Items', slug: 'mdf-gift-items', sortOrder: 5, isActive: true },
  });
  const catAcrylic = await prisma.category.create({
    data: { name: 'Acrylic Products', slug: 'acrylic-products', sortOrder: 6, isActive: true },
  });
  const catMDFHome = await prisma.category.create({
    data: { name: 'MDF Home Decor', slug: 'mdf-home-decor', sortOrder: 7, isActive: true },
  });

  console.log('Seeding subcategories...');
  // 1. Advertising & Branding
  const subBrandingDisplay = await prisma.subcategory.create({
    data: { categoryId: catBranding.id, name: 'Display Systems', slug: 'display-systems' },
  });
  const subBrandingOutdoor = await prisma.subcategory.create({
    data: { categoryId: catBranding.id, name: 'Outdoor Advertising', slug: 'outdoor-advertising' },
  });
  const subBrandingFlags = await prisma.subcategory.create({
    data: { categoryId: catBranding.id, name: 'Promotional Flags', slug: 'promotional-flags' },
  });
  const subBrandingCanopy = await prisma.subcategory.create({
    data: { categoryId: catBranding.id, name: 'Printed Canopy Tents', slug: 'printed-canopy-tents' },
  });

  // 2. Acrylic Products
  const subAcrylicFrames = await prisma.subcategory.create({
    data: { categoryId: catAcrylic.id, name: 'Photo Frames', slug: 'acrylic-photo-frames' },
  });
  const subAcrylicDesk = await prisma.subcategory.create({
    data: { categoryId: catAcrylic.id, name: 'Desk Essentials', slug: 'acrylic-desk-essentials' },
  });
  const subAcrylicDecor = await prisma.subcategory.create({
    data: { categoryId: catAcrylic.id, name: 'Home Decor', slug: 'acrylic-home-decor' },
  });
  const subAcrylicAwards = await prisma.subcategory.create({
    data: { categoryId: catAcrylic.id, name: 'Awards & Trophies', slug: 'acrylic-awards-trophies' },
  });
  const subAcrylicGifts = await prisma.subcategory.create({
    data: { categoryId: catAcrylic.id, name: 'Personalized Gifts', slug: 'acrylic-personalized-gifts' },
  });

  // 3. MDF Gift Items
  const subMDFGiftFrames = await prisma.subcategory.create({
    data: { categoryId: catMDFGifts.id, name: 'Photo Frames', slug: 'mdf-photo-frames' },
  });
  const subMDFGiftOrganizers = await prisma.subcategory.create({
    data: { categoryId: catMDFGifts.id, name: 'Boxes & Organizers', slug: 'mdf-boxes-organizers' },
  });
  const subMDFGiftPersonalized = await prisma.subcategory.create({
    data: { categoryId: catMDFGifts.id, name: 'Personalized Gifts', slug: 'mdf-personalized-gifts' },
  });

  // 4. MDF Home Decor
  const subMDFHomeWall = await prisma.subcategory.create({
    data: { categoryId: catMDFHome.id, name: 'Wall Decor', slug: 'mdf-wall-decor' },
  });
  const subMDFHomeShelves = await prisma.subcategory.create({
    data: { categoryId: catMDFHome.id, name: 'Shelves', slug: 'mdf-shelves' },
  });

  // 5. Default Subcategories for Shape IDs
  const subCreativeIDs = await prisma.subcategory.create({
    data: { categoryId: catIDCardsCreative.id, name: 'Creative Shapes Collection', slug: 'creative-shapes-collection' },
  });
  const subModernIDs = await prisma.subcategory.create({
    data: { categoryId: catIDCardsModern.id, name: 'Modern Shapes Collection', slug: 'modern-shapes-collection' },
  });

  // 6. Default Subcategories for Birthday Gifts
  const subBirthdayStandees = await prisma.subcategory.create({
    data: { categoryId: catBirthday.id, name: 'Birthday Standees', slug: 'birthday-standees' },
  });
  const subBirthdayOther = await prisma.subcategory.create({
    data: { categoryId: catBirthday.id, name: 'Keepsakes & Desk Accessories', slug: 'keepsakes-desk-accessories' },
  });

  console.log('Seeding products...');

  // Helper to create simple products
  const addProduct = async (params: {
    categoryId: string;
    subcategoryId: string;
    name: string;
    slug: string;
    price: number;
    skuPrefix: string;
    material: string;
    finish: string;
    printingMethod: string;
    thickness?: string;
    waterResistant?: boolean;
    imagePlaceholder?: string;
  }) => {
    return prisma.product.create({
      data: {
        categoryId: params.categoryId,
        subcategoryId: params.subcategoryId,
        name: params.name,
        slug: params.slug,
        shortDescription: `Premium custom ${params.name.toLowerCase()} personalized for business or personal gifting.`,
        description: `Experience the peak of quality with our custom ${params.name}. Made with high-grade ${params.material.toLowerCase()} featuring a pristine ${params.finish.toLowerCase()} finish, this product is printed using state-of-the-art ${params.printingMethod.toLowerCase()} technology. Built for durability and style, it is fully customizable to your designs.`,
        basePrice: params.price,
        isActive: true,
        material: params.material,
        finish: params.finish,
        printingMethod: params.printingMethod,
        waterResistant: params.waterResistant ?? true,
        customizationAvailable: true,
        thickness: params.thickness ?? '3mm',
        printingType: params.printingMethod,
        customizationSupport: 'Upload vector artwork or photo graphics.',
        variants: {
          create: [
            { name: 'Standard 3mm', sku: `${params.skuPrefix}-3MM`, price: params.price, stock: 1000, isActive: true },
            { name: 'Premium 5mm', sku: `${params.skuPrefix}-5MM`, price: params.price + 50.00, stock: 500, isActive: true },
          ],
        },
        images: {
          create: [
            { imageUrl: params.imagePlaceholder || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600', altText: params.name, sortOrder: 0 },
          ],
        },
      },
    });
  };

  // 1. Acrylic ID Cards - Creative Shapes
  const creativeShapes = ['Apple', 'Mango', 'Tiger', 'Giraffe', 'Bus', 'Camera', 'House', 'Rocket', 'Bulb', 'Shield', 'Star', 'Heart', 'Hexagon', 'Drop', 'Oval'];
  for (const shape of creativeShapes) {
    await addProduct({
      categoryId: catIDCardsCreative.id,
      subcategoryId: subCreativeIDs.id,
      name: `${shape} Shape Acrylic ID Card`,
      slug: `${shape.toLowerCase()}-shape-acrylic-id-card`,
      price: 149.00,
      skuPrefix: `IDC-CR-${shape.substring(0, 3).toUpperCase()}`,
      material: 'Premium Acrylic',
      finish: 'Glossy Finish',
      printingMethod: 'UV Printing',
      thickness: '3mm / 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400',
    });
  }

  // 2. Acrylic ID Cards - Modern Shapes
  const modernShapes = ['Rounded Rectangle', 'Vertical Tag', 'Badge Shield', 'Hexagonal Tag', 'Circular Access Card'];
  for (const shape of modernShapes) {
    const code = shape.split(' ').map(s => s[0]).join('');
    await addProduct({
      categoryId: catIDCardsModern.id,
      subcategoryId: subModernIDs.id,
      name: `${shape} Acrylic ID Card`,
      slug: `${shape.toLowerCase().replace(/\s+/g, '-')}-acrylic-id-card`,
      price: 139.00,
      skuPrefix: `IDC-MD-${code.toUpperCase()}`,
      material: 'Premium Acrylic',
      finish: 'Glossy / Matte',
      printingMethod: 'High Resolution UV Print',
      thickness: '3mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400',
    });
  }

  // 3. Acrylic Birthday Gift Items
  const birthdayStandeeShapes = ['Apple', 'Mango', 'Tiger', 'Giraffe', 'Bus', 'Heart', 'Star', 'Round', 'Hexagon', 'Shield', 'Camera', 'House', 'Rocket', 'Bulb', 'Drop'];
  for (const shape of birthdayStandeeShapes) {
    await addProduct({
      categoryId: catBirthday.id,
      subcategoryId: subBirthdayStandees.id,
      name: `${shape} Shape Birthday Standee`,
      slug: `${shape.toLowerCase()}-shape-birthday-standee`,
      price: 249.00,
      skuPrefix: `BTY-STND-${shape.substring(0, 3).toUpperCase()}`,
      material: 'Premium Cast Acrylic',
      finish: 'Crystal Clear Glossy',
      printingMethod: 'Vibrant UV Printing',
      thickness: '3mm / 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    });
  }

  const birthdayDeskItems = [
    { name: 'Birthday Photo Frame', slug: 'birthday-photo-frame', price: 399.00, sku: 'BTY-PF' },
    { name: 'Birthday LED Lamp', slug: 'birthday-led-lamp', price: 599.00, sku: 'BTY-LED' },
    { name: 'Birthday Keychain', slug: 'birthday-keychain', price: 99.00, sku: 'BTY-KEY' },
    { name: 'Birthday Name Plate', slug: 'birthday-name-plate', price: 499.00, sku: 'BTY-NAME' },
    { name: 'Birthday Pen Stand', slug: 'birthday-pen-stand', price: 349.00, sku: 'BTY-PEN' },
  ];
  for (const item of birthdayDeskItems) {
    await addProduct({
      categoryId: catBirthday.id,
      subcategoryId: subBirthdayOther.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      skuPrefix: item.sku,
      material: 'Acrylic / Wood Stand',
      finish: 'Polished Glossy',
      printingMethod: 'UV Decal Printing',
      thickness: '3mm / 5mm / 8mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
    });
  }

  // 4. Acrylic Products (Elegance in Clarity)
  // Photo Frames (PF)
  const framesList = [
    { code: 'PF-01', name: 'Floating Photo Frame', price: 399.00 },
    { code: 'PF-02', name: 'Acrylic Block Frame', price: 499.00 },
    { code: 'PF-03', name: 'Magnetic Photo Frame', price: 399.00 },
    { code: 'PF-04', name: 'Heart Photo Frame', price: 349.00 },
    { code: 'PF-05', name: 'Collage Frame', price: 799.00 },
  ];
  for (const frame of framesList) {
    await addProduct({
      categoryId: catAcrylic.id,
      subcategoryId: subAcrylicFrames.id,
      name: `${frame.name} (${frame.code})`,
      slug: `${frame.name.toLowerCase().replace(/\s+/g, '-')}-${frame.code.toLowerCase()}`,
      price: frame.price,
      skuPrefix: `ACR-PF-${frame.code.replace('-', '')}`,
      material: 'Optical-Grade Acrylic',
      finish: 'Crystal Clear Polished',
      printingMethod: 'Double-Sided Sandwich Mount',
      thickness: '5mm + 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&q=80&w=400',
    });
  }

  // Desk Essentials (DE)
  const deskList = [
    { code: 'DE-01', name: 'Acrylic Pen Stand', price: 249.00 },
    { code: 'DE-02', name: 'Business Card Holder', price: 199.00 },
    { code: 'DE-03', name: 'Name Plate', price: 449.00 },
    { code: 'DE-04', name: 'Mobile Stand', price: 149.00 },
    { code: 'DE-05', name: 'Desktop Organizer', price: 599.00 },
  ];
  for (const desk of deskList) {
    await addProduct({
      categoryId: catAcrylic.id,
      subcategoryId: subAcrylicDesk.id,
      name: `${desk.name} (${desk.code})`,
      slug: `${desk.name.toLowerCase().replace(/\s+/g, '-')}-${desk.code.toLowerCase()}`,
      price: desk.price,
      skuPrefix: `ACR-DE-${desk.code.replace('-', '')}`,
      material: 'Optical-Grade Acrylic',
      finish: 'Flame-Polished Edges',
      printingMethod: 'UV Direct Print',
      thickness: '3mm / 4mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400',
    });
  }

  // Home Decor (HD)
  const decorList = [
    { code: 'HD-01', name: 'Acrylic Wall Clock', price: 899.00 },
    { code: 'HD-02', name: 'Acrylic Wall Shelf', price: 499.00 },
    { code: 'HD-03', name: 'LED Acrylic Night Lamp', price: 599.00 },
    { code: 'HD-04', name: 'Acrylic Vase', price: 399.00 },
    { code: 'HD-05', name: 'Acrylic Photo Stand', price: 299.00 },
  ];
  for (const decor of decorList) {
    await addProduct({
      categoryId: catAcrylic.id,
      subcategoryId: subAcrylicDecor.id,
      name: `${decor.name} (${decor.code})`,
      slug: `${decor.name.toLowerCase().replace(/\s+/g, '-')}-${decor.code.toLowerCase()}`,
      price: decor.price,
      skuPrefix: `ACR-HD-${decor.code.replace('-', '')}`,
      material: 'Premium Acrylic',
      finish: 'Matte / Glossy',
      printingMethod: 'UV Direct / Laser Cut',
      thickness: '3mm / 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
    });
  }

  // Awards & Trophies (AT)
  const awardsList = [
    { code: 'AT-01', name: 'Acrylic Trophy', price: 699.00 },
    { code: 'AT-02', name: 'Acrylic Star Trophy', price: 799.00 },
    { code: 'AT-03', name: 'Acrylic Shield Trophy', price: 599.00 },
    { code: 'AT-04', name: 'Acrylic Memento', price: 499.00 },
    { code: 'AT-05', name: 'Acrylic Certificate Block', price: 999.00 },
  ];
  for (const award of awardsList) {
    await addProduct({
      categoryId: catAcrylic.id,
      subcategoryId: subAcrylicAwards.id,
      name: `${award.name} (${award.code})`,
      slug: `${award.name.toLowerCase().replace(/\s+/g, '-')}-${award.code.toLowerCase()}`,
      price: award.price,
      skuPrefix: `ACR-AT-${award.code.replace('-', '')}`,
      material: 'Heavy Cast Acrylic / Wooden Base',
      finish: 'Beveled Flame-Polished Edges',
      printingMethod: 'Reverse UV / Laser Engraving',
      thickness: '10mm / 12mm / 15mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=400',
    });
  }

  // Personalized Gifts (PG)
  const personalList = [
    { code: 'PG-01', name: 'Acrylic Keychain', price: 99.00 },
    { code: 'PG-02', name: 'Acrylic LED Keychain', price: 149.00 },
    { code: 'PG-03', name: 'Acrylic Name Keychain', price: 129.00 },
    { code: 'PG-04', name: 'Acrylic Photo Keychain', price: 129.00 },
    { code: 'PG-05', name: 'Acrylic Coaster (Set of 4)', price: 399.00 },
  ];
  for (const pers of personalList) {
    await addProduct({
      categoryId: catAcrylic.id,
      subcategoryId: subAcrylicGifts.id,
      name: `${pers.name} (${pers.code})`,
      slug: `${pers.name.toLowerCase().replace(/\s+/g, '-').replace('(', '').replace(')', '')}-${pers.code.toLowerCase()}`,
      price: pers.price,
      skuPrefix: `ACR-PG-${pers.code.replace('-', '')}`,
      material: 'Clear Acrylic',
      finish: 'Smooth Laser Cut',
      printingMethod: 'Double-Sided UV Sublimation',
      thickness: '2mm / 3mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&q=80&w=400',
    });
  }

  // 5. Advertising & Branding Products
  await addProduct({
    categoryId: catBranding.id,
    subcategoryId: subBrandingDisplay.id,
    name: 'Roll-up Banner Stand',
    slug: 'roll-up-banner-stand',
    price: 1499.00,
    skuPrefix: 'ADV-DSP-ROLL',
    material: 'Aluminium Stand & Flex Fabric',
    finish: 'Matte Printed Finish',
    printingMethod: 'Eco-Solvent Wide Format Print',
    thickness: 'N/A',
  });
  await addProduct({
    categoryId: catBranding.id,
    subcategoryId: subBrandingOutdoor.id,
    name: 'Outdoor Vinyl Signage Board',
    slug: 'outdoor-vinyl-signage-board',
    price: 2499.00,
    skuPrefix: 'ADV-OUT-SIGN',
    material: 'Iron Grid & Heavy Vinyl Banner',
    finish: 'Glossy Weatherproof',
    printingMethod: 'Vibrant Solvent Print',
    thickness: 'N/A',
  });

  // 6. MDF Gift Items
  await addProduct({
    categoryId: catMDFGifts.id,
    subcategoryId: subMDFGiftFrames.id,
    name: 'MDF Engraved Photo Frame',
    slug: 'mdf-engraved-photo-frame',
    price: 299.00,
    skuPrefix: 'MDF-GFT-FRM',
    material: 'Premium Engineered Wood (MDF)',
    finish: 'Rustic Wood Grain Polish',
    printingMethod: 'Precision Laser Engraving',
    thickness: '5mm / 8mm',
  });
  await addProduct({
    categoryId: catMDFGifts.id,
    subcategoryId: subMDFGiftOrganizers.id,
    name: 'MDF Desktop Pen Organizer',
    slug: 'mdf-desktop-pen-organizer',
    price: 349.00,
    skuPrefix: 'MDF-GFT-ORG',
    material: 'Premium MDF Wood',
    finish: 'Matte Black Painted Coating',
    printingMethod: 'Laser Cut & Snap Assemble',
    thickness: '3mm',
  });

  // 7. MDF Home Decor
  await addProduct({
    categoryId: catMDFHome.id,
    subcategoryId: subMDFHomeWall.id,
    name: 'MDF Geometric Wall Art',
    slug: 'mdf-geometric-wall-art',
    price: 899.00,
    skuPrefix: 'MDF-DEC-WALL',
    material: 'High-Density MDF Wood',
    finish: 'Smooth Charcoal Satin Spray',
    printingMethod: '3D Laser Die-cutting',
    thickness: '6mm',
  });

  console.log('Seeding default users (Admin, Customer, Super Admin)...');
  const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
  const customerPasswordHash = await bcrypt.hash('customerpassword123', 10);
  const superAdminPasswordHash = await bcrypt.hash('akshatavnish@456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@merko.com',
      firstName: 'Alex',
      lastName: 'Merko Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      isActive: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@merko.com',
      firstName: 'Sarah',
      lastName: 'Connor Customer',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      isActive: true,
    },
  });

  const superAdminUser = await prisma.user.create({
    data: {
      email: 'akshatavnish123@gmail.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superAdminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isPlatformSuperAdmin: true,
      permissions: 'orders,products,categories,shipments,returns,analytics,payments',
      emailVerified: true,
      isActive: true,
    },
  });

  // Seed default address for customer
  await prisma.address.create({
    data: {
      userId: customerUser.id,
      name: 'Sarah Connor',
      phone: '9876543210',
      addressLine1: '123 Cyberdyne Systems Blvd',
      addressLine2: 'Apt 4B',
      city: 'Los Angeles',
      state: 'California',
      postalCode: '90001',
      country: 'United States',
      isDefault: true,
    },
  });

  console.log('Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
