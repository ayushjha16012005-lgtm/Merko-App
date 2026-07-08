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
  const subMDFGiftTable = await prisma.subcategory.create({
    data: { categoryId: catMDFGifts.id, name: 'Table Decor', slug: 'mdf-table-decor' },
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
    data: { categoryId: catMDFHome.id, name: 'Shelves & Wall Shelves', slug: 'mdf-shelves-wall-shelves' },
  });
  const subMDFHomeTable = await prisma.subcategory.create({
    data: { categoryId: catMDFHome.id, name: 'Table Decor', slug: 'mdf-table-decor-home' },
  });
  const subMDFHomePlanters = await prisma.subcategory.create({
    data: { categoryId: catMDFHome.id, name: 'Planters & Stands', slug: 'mdf-planters-stands' },
  });
  const subMDFHomeMirrors = await prisma.subcategory.create({
    data: { categoryId: catMDFHome.id, name: 'Mirrors', slug: 'mdf-mirrors' },
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
    cropConfig?: string;
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
        cropConfig: params.cropConfig ?? JSON.stringify({ width: 90, height: 90, left: 5, top: 5 }),
        variants: {
          create: [
            { name: 'Standard 3mm', sku: `${params.skuPrefix}-3MM`, price: params.price, stock: 1000, isActive: true },
            { name: 'Premium 5mm', sku: `${params.skuPrefix}-5MM`, price: params.price + 50.00, stock: 500, isActive: true },
          ],
        },
        images: {
          create: params.imagePlaceholder ? [
            { imageUrl: params.imagePlaceholder, altText: params.name, sortOrder: 0 },
          ] : [],
        },
      },
    });
  };

  // 1. Acrylic ID Cards - Creative Shapes (20 shapes)
  const creativeShapes = [
    { name: 'Apple', code: '01' },
    { name: 'Mango', code: '02' },
    { name: 'Tiger', code: '03' },
    { name: 'Lion', code: '04' },
    { name: 'Giraffe', code: '05' },
    { name: 'Bus', code: '06' },
    { name: 'Camera', code: '07' },
    { name: 'House', code: '08' },
    { name: 'Rocket', code: '09' },
    { name: 'Bulb', code: '10' },
    { name: 'Shield', code: '11' },
    { name: 'Star', code: '12' },
    { name: 'Heart', code: '13' },
    { name: 'Hexagon', code: '14' },
    { name: 'Drop', code: '15' },
    { name: 'Oval', code: '16' },
    { name: 'Butterfly', code: '17' },
    { name: 'Bear', code: '18' },
    { name: 'Cloud', code: '19' },
    { name: 'Car', code: '20' }
  ];
  for (const shape of creativeShapes) {
    // Leave some products with NO product images to test Category Inheritance
    const hasImage = !['Apple', 'Mango', 'Tiger', 'Lion'].includes(shape.name);
    await addProduct({
      categoryId: catIDCardsCreative.id,
      subcategoryId: subCreativeIDs.id,
      name: shape.name,
      slug: `${shape.name.toLowerCase()}-creative-id-card`,
      price: 149.00,
      skuPrefix: `IDC-CR-${shape.code}`,
      material: 'Premium Acrylic',
      finish: 'Glossy Finish',
      printingMethod: 'UV Printing',
      thickness: '3mm / 5mm',
      waterResistant: true,
      imagePlaceholder: hasImage ? 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400' : undefined,
      cropConfig: JSON.stringify({ width: 85, height: 85, left: 7.5, top: 7.5 })
    });
  }

  // 2. Acrylic ID Cards - Modern Shapes (9 shapes)
  const modernShapes = [
    { name: 'Rounded Rectangle', code: '01' },
    { name: 'Vertical Tag', code: '02' },
    { name: 'Badge Shield', code: '03' },
    { name: 'Hexagonal Tag', code: '04' },
    { name: 'Circular Access Card', code: '05' },
    { name: 'Square Badge', code: '06' },
    { name: 'Horizontal ID Tag', code: '07' },
    { name: 'Diamond Access Card', code: '08' },
    { name: 'Octagonal ID Card', code: '09' }
  ];
  for (const shape of modernShapes) {
    await addProduct({
      categoryId: catIDCardsModern.id,
      subcategoryId: subModernIDs.id,
      name: shape.name,
      slug: `${shape.name.toLowerCase().replace(/\s+/g, '-')}-modern-id-card`,
      price: 139.00,
      skuPrefix: `IDC-MD-${shape.code}`,
      material: 'Premium Acrylic',
      finish: 'Glossy / Matte',
      printingMethod: 'High Resolution UV Print',
      thickness: '3mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }

  // 3. Acrylic Birthday Gift Items (19 standees + 5 keepsakes)
  const birthdayStandeeShapes = [
    { name: 'Apple', code: '01' },
    { name: 'Mango', code: '02' },
    { name: 'Tiger', code: '03' },
    { name: 'Lion', code: '04' },
    { name: 'Giraffe', code: '05' },
    { name: 'Bus', code: '06' },
    { name: 'Heart', code: '07' },
    { name: 'Star', code: '08' },
    { name: 'Round', code: '09' },
    { name: 'Hexagon', code: '10' },
    { name: 'Shield', code: '11' },
    { name: 'Camera', code: '12' },
    { name: 'House', code: '13' },
    { name: 'Rocket', code: '14' },
    { name: 'Bulb', code: '15' },
    { name: 'Drop', code: '16' },
    { name: 'Butterfly', code: '17' },
    { name: 'Bear', code: '18' },
    { name: 'Cloud', code: '19' }
  ];
  for (const shape of birthdayStandeeShapes) {
    await addProduct({
      categoryId: catBirthday.id,
      subcategoryId: subBirthdayStandees.id,
      name: shape.name,
      slug: `${shape.name.toLowerCase()}-birthday-standee`,
      price: 249.00,
      skuPrefix: `BTY-STND-${shape.code}`,
      material: 'Premium Cast Acrylic',
      finish: 'Crystal Clear Glossy',
      printingMethod: 'Vibrant UV Printing',
      thickness: '3mm / 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 80, height: 80, left: 10, top: 10 })
    });
  }

  const birthdayDeskItems = [
    { name: 'Birthday Photo Frame', code: 'BTY-DK-01', price: 399.00 },
    { name: 'Birthday LED Lamp', code: 'BTY-DK-02', price: 599.00 },
    { name: 'Birthday Keychain', code: 'BTY-DK-03', price: 99.00 },
    { name: 'Birthday Name Plate', code: 'BTY-DK-04', price: 499.00 },
    { name: 'Birthday Pen Stand', code: 'BTY-DK-05', price: 349.00 }
  ];
  for (const item of birthdayDeskItems) {
    await addProduct({
      categoryId: catBirthday.id,
      subcategoryId: subBirthdayOther.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Acrylic / Wood Stand',
      finish: 'Polished Glossy',
      printingMethod: 'UV Decal Printing',
      thickness: '3mm / 5mm / 8mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
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
      name: frame.name,
      slug: `${frame.name.toLowerCase().replace(/\s+/g, '-')}-${frame.code.toLowerCase()}`,
      price: frame.price,
      skuPrefix: frame.code,
      material: 'Optical-Grade Acrylic',
      finish: 'Crystal Clear Polished',
      printingMethod: 'Double-Sided Sandwich Mount',
      thickness: '5mm + 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 85, height: 85, left: 7.5, top: 7.5 })
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
      name: desk.name,
      slug: `${desk.name.toLowerCase().replace(/\s+/g, '-')}-${desk.code.toLowerCase()}`,
      price: desk.price,
      skuPrefix: desk.code,
      material: 'Optical-Grade Acrylic',
      finish: 'Flame-Polished Edges',
      printingMethod: 'UV Direct Print',
      thickness: '3mm / 4mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
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
      name: decor.name,
      slug: `${decor.name.toLowerCase().replace(/\s+/g, '-')}-${decor.code.toLowerCase()}`,
      price: decor.price,
      skuPrefix: decor.code,
      material: 'Premium Acrylic',
      finish: 'Matte / Glossy',
      printingMethod: 'UV Direct / Laser Cut',
      thickness: '3mm / 5mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 85, height: 85, left: 7.5, top: 7.5 })
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
      name: award.name,
      slug: `${award.name.toLowerCase().replace(/\s+/g, '-')}-${award.code.toLowerCase()}`,
      price: award.price,
      skuPrefix: award.code,
      material: 'Heavy Cast Acrylic / Wooden Base',
      finish: 'Beveled Flame-Polished Edges',
      printingMethod: 'Reverse UV / Laser Engraving',
      thickness: '10mm / 12mm / 15mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 80, height: 80, left: 10, top: 10 })
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
      name: pers.name,
      slug: `${pers.name.toLowerCase().replace(/\s+/g, '-').replace('(', '').replace(')', '')}-${pers.code.toLowerCase()}`,
      price: pers.price,
      skuPrefix: pers.code,
      material: 'Clear Acrylic',
      finish: 'Smooth Laser Cut',
      printingMethod: 'Double-Sided UV Sublimation',
      thickness: '2mm / 3mm',
      waterResistant: true,
      imagePlaceholder: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }

  // 5. Advertising & Branding Products
  const brandingDisplayItems = [
    { code: 'ADV-DS-01', name: 'Roll-up Banner Stand', price: 1499.00, subId: subBrandingDisplay.id, mat: 'Aluminium Stand & Flex Fabric', fin: 'Matte Printed Finish', pm: 'Eco-Solvent Wide Format Print', thick: 'N/A' },
    { code: 'ADV-DS-02', name: 'Pop-up Exhibition Backdrop', price: 12499.00, subId: subBrandingDisplay.id, mat: 'Aluminum Frame & Polyester Graphic fabric', fin: 'Glare-free Matte Finish', pm: 'Wide Format Dye Sublimation', thick: 'N/A' },
    { code: 'ADV-DS-03', name: 'A-Frame Poster Stand', price: 1999.00, subId: subBrandingDisplay.id, mat: 'Anodized Aluminum Frame', fin: 'Metallic Silver Polish', pm: 'Double-Sided UV Poster Print', thick: 'N/A' }
  ];
  const brandingOutdoorItems = [
    { code: 'ADV-OA-01', name: 'Outdoor Vinyl Signage Board', price: 2499.00, subId: subBrandingOutdoor.id, mat: 'Iron Grid & Heavy Vinyl Banner', fin: 'Glossy Weatherproof', pm: 'Vibrant Solvent Print', thick: 'N/A' },
    { code: 'ADV-OA-02', name: 'Acrylic LED Sign Board', price: 4999.00, subId: subBrandingOutdoor.id, mat: 'Heavy Cast Acrylic & LEDs', fin: 'Brilliant Gloss & Backlight Glow', pm: '3D Laser Cut Lettering & Print', thick: '8mm / 10mm' }
  ];
  const brandingFlagsItems = [
    { code: 'ADV-PF-01', name: 'Promotional Flag Banner', price: 899.00, subId: subBrandingFlags.id, mat: 'Knitted Polyester Fabric', fin: 'Satin Printed Glow', pm: 'Sublimation Print', thick: 'N/A' }
  ];
  const brandingCanopyItems = [
    { code: 'ADV-CT-01', name: 'Printed Canopy Tent', price: 8499.00, subId: subBrandingCanopy.id, mat: 'Heavy Waterproof Canvas & Steel Frame', fin: 'Rugged Weather-resistant Coating', pm: 'Outdoor UV Solvent Print', thick: 'N/A' }
  ];
  const allBrandingItems = [...brandingDisplayItems, ...brandingOutdoorItems, ...brandingFlagsItems, ...brandingCanopyItems];
  for (const item of allBrandingItems) {
    await addProduct({
      categoryId: catBranding.id,
      subcategoryId: item.subId,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: item.mat,
      finish: item.fin,
      printingMethod: item.pm,
      thickness: item.thick,
      imagePlaceholder: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }

  // 6. MDF Gift Items
  const mdfGiftFramesList = [
    { code: 'MF-01', name: 'MDF Engraved Photo Frame', price: 299.00 },
    { code: 'MF-02', name: 'MDF Collage Frame', price: 599.00 },
    { code: 'MF-03', name: 'MDF Photo Shadow Box', price: 699.00 }
  ];
  const mdfGiftTableList = [
    { code: 'MT-01', name: 'MDF Desk Name Stand', price: 399.00 },
    { code: 'MT-02', name: 'MDF Pen Holder with Clock', price: 449.00 }
  ];
  const mdfGiftBoxesList = [
    { code: 'MB-01', name: 'MDF Desktop Pen Organizer', price: 349.00 },
    { code: 'MB-02', name: 'MDF Multi-purpose Storage Box', price: 499.00 },
    { code: 'MB-03', name: 'MDF Jewellery Box', price: 599.00 }
  ];
  const mdfGiftPersonalizedList = [
    { code: 'MP-01', name: 'MDF Personalized Keychain', price: 79.00 },
    { code: 'MP-02', name: 'MDF Custom Puzzle Gift', price: 349.00 },
    { code: 'MP-03', name: 'MDF Wall Hanging Plaque', price: 499.00 }
  ];

  for (const item of mdfGiftFramesList) {
    await addProduct({
      categoryId: catMDFGifts.id,
      subcategoryId: subMDFGiftFrames.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Premium MDF Wood',
      finish: 'Rustic Wood Polish',
      printingMethod: 'Laser Engraved',
      thickness: '5mm / 8mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 85, height: 85, left: 7.5, top: 7.5 })
    });
  }
  for (const item of mdfGiftTableList) {
    await addProduct({
      categoryId: catMDFGifts.id,
      subcategoryId: subMDFGiftTable.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Walnut Veneer MDF',
      finish: 'Walnut Finish',
      printingMethod: 'Laser Cut & Etched',
      thickness: '6mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }
  for (const item of mdfGiftBoxesList) {
    await addProduct({
      categoryId: catMDFGifts.id,
      subcategoryId: subMDFGiftOrganizers.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Engineered Wood MDF',
      finish: 'Matte Coating',
      printingMethod: 'Laser Cut & Assembly',
      thickness: '3mm / 4mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }
  for (const item of mdfGiftPersonalizedList) {
    await addProduct({
      categoryId: catMDFGifts.id,
      subcategoryId: subMDFGiftPersonalized.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Standard Density MDF',
      finish: 'Vibrant Print Lamination',
      printingMethod: 'Dye Sublimation',
      thickness: '3mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }

  // 7. MDF Home Decor
  const mdfHomeWallList = [
    { code: 'WD-01', name: 'MDF Geometric Wall Art', price: 899.00 },
    { code: 'WD-02', name: 'MDF Wall Mounted Key Holder', price: 299.00 },
    { code: 'WD-03', name: 'MDF Custom Name Plate for Home', price: 799.00 },
    { code: 'WD-04', name: 'MDF Wall Mounted Clock', price: 999.00 },
    { code: 'WD-05', name: 'MDF Decorative Wall Panel', price: 649.00 }
  ];
  const mdfHomeShelvesList = [
    { code: 'WS-01', name: 'MDF Multi-tier Wall Shelf', price: 1299.00 },
    { code: 'WS-02', name: 'MDF Floating Corner Shelf', price: 549.00 },
    { code: 'WS-03', name: 'MDF Hexagonal Wall Shelf Set', price: 1199.00 }
  ];
  const mdfHomeTableList = [
    { code: 'TD-01', name: 'MDF Table Clock', price: 349.00 },
    { code: 'TD-02', name: 'MDF Table Calendar', price: 299.00 },
    { code: 'TD-03', name: 'MDF Table Quote Stand', price: 199.00 }
  ];
  const mdfHomePlantersList = [
    { code: 'PS-01', name: 'MDF Indoor Plant Stand', price: 499.00 },
    { code: 'PS-02', name: 'MDF Succulent Planter Box', price: 399.00 }
  ];
  const mdfHomeMirrorsList = [
    { code: 'MR-01', name: 'MDF Decorative Wall Mirror Frame', price: 1499.00 },
    { code: 'MR-02', name: 'MDF Handheld Mirror', price: 249.00 }
  ];

  for (const item of mdfHomeWallList) {
    await addProduct({
      categoryId: catMDFHome.id,
      subcategoryId: subMDFHomeWall.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'High-Density MDF',
      finish: 'Satin Finish Spray',
      printingMethod: 'Laser Die-cut',
      thickness: '6mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 85, height: 85, left: 7.5, top: 7.5 })
    });
  }
  for (const item of mdfHomeShelvesList) {
    await addProduct({
      categoryId: catMDFHome.id,
      subcategoryId: subMDFHomeShelves.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Heavy MDF Planks',
      finish: 'Mahogany Veneer Spray',
      printingMethod: 'Edge Banding',
      thickness: '12mm / 18mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }
  for (const item of mdfHomeTableList) {
    await addProduct({
      categoryId: catMDFHome.id,
      subcategoryId: subMDFHomeTable.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Engineered Wood MDF',
      finish: 'Veneered Polish',
      printingMethod: 'Laser Engraved & Cut',
      thickness: '5mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 90, height: 90, left: 5, top: 5 })
    });
  }
  for (const item of mdfHomePlantersList) {
    await addProduct({
      categoryId: catMDFHome.id,
      subcategoryId: subMDFHomePlanters.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'Waterproof Finished MDF',
      finish: 'Clear Lamination',
      printingMethod: 'Laser Assemble',
      thickness: '6mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 85, height: 85, left: 7.5, top: 7.5 })
    });
  }
  for (const item of mdfHomeMirrorsList) {
    await addProduct({
      categoryId: catMDFHome.id,
      subcategoryId: subMDFHomeMirrors.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: item.price,
      skuPrefix: item.code,
      material: 'High-Density MDF & Mirror Glass',
      finish: 'Gold Trim Painted',
      printingMethod: 'Precision Cut & Mount',
      thickness: '8mm',
      imagePlaceholder: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
      cropConfig: JSON.stringify({ width: 80, height: 80, left: 10, top: 10 })
    });
  }

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
      permissions: 'products,categories,orders,customers,payments,settings,reports',
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
