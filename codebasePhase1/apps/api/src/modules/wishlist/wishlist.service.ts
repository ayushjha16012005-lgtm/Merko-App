import { prisma } from '@/config/db';

export class WishlistService {
  async getWishlist(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            variants: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    if (existing) {
      return existing;
    }

    return prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            variants: true,
            category: true,
          },
        },
      },
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    await prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
    return { success: true };
  }
}

export const wishlistService = new WishlistService();
