import type { Product } from '@prisma/client';
import { prisma } from '@/config/db';
import type { CreateProductInput, UpdateProductInput } from '@/middleware/validators';

export class ProductsRepository {
  async findAll(
    search?: string,
    categoryId?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const isSQLite = process.env.DATABASE_URL?.includes('sqlite') || process.env.DATABASE_URL?.startsWith('file:');
    const searchMode = isSQLite ? undefined : ('insensitive' as const);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, ...(searchMode && { mode: searchMode }) } },
          { slug: { contains: search, ...(searchMode && { mode: searchMode }) } },
          { description: { contains: search, ...(searchMode && { mode: searchMode }) } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      deletedAt: null,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
      },
    });

    if (!product || product.deletedAt) return null;
    return product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
      },
    });

    if (!product || product.deletedAt) return null;
    return product;
  }

  async findByIdWithDeleted(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProductInput): Promise<Product> {
    const { images, variants, ...productData } = data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: productData.slug.toLowerCase(),
        ...(images && images.length > 0 && {
          images: {
            create: images.map((img) => ({
              imageUrl: img.imageUrl,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? 0,
            })),
          },
        }),
        ...(variants && variants.length > 0 && {
          variants: {
            create: variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock ?? 0,
              isActive: v.isActive ?? true,
            })),
          },
        }),
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return product as unknown as Product;
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const { images, variants, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Update basic product details
      await tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(productData.slug && { slug: productData.slug.toLowerCase() }),
        },
      });

      // 2. Sync Images (Delete & Recreate)
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img) => ({
              productId: id,
              imageUrl: img.imageUrl,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? 0,
            })),
          });
        }
      }

      // 3. Sync Variants (Delete & Recreate)
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v) => ({
              productId: id,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock ?? 0,
              isActive: v.isActive ?? true,
            })),
          });
        }
      }

      // Retrieve full product with relations
      const updated = await tx.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          category: true,
        },
      });

      return updated as unknown as Product;
    });
  }

  async softDelete(id: string): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return product;
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
        deletedAt: null,
      },
    });
    return !!product;
  }

  async countByCategory(categoryId: string): Promise<number> {
    return prisma.product.count({
      where: {
        categoryId,
        deletedAt: null,
      },
    });
  }
}
