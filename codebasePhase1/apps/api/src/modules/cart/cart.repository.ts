import { prisma } from '@/config/db';

export class CartRepository {
  async findCartByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { sortOrder: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }
    return cart;
  }

  async findCartItem(cartId: string, productVariantId: string, designFileUrl?: string, designConfig?: string) {
    return prisma.cartItem.findFirst({
      where: {
        cartId,
        productVariantId,
        designFileUrl: designFileUrl || null,
        designConfig: designConfig || null,
      },
    });
  }

  async createCartItem(
    cartId: string,
    productVariantId: string,
    quantity: number,
    designFileUrl?: string,
    designFileName?: string,
    designFileType?: string,
    designConfig?: string,
    mockupUrl?: string
  ) {
    return prisma.cartItem.create({
      data: {
        cartId,
        productVariantId,
        quantity,
        designFileUrl: designFileUrl || null,
        designFileName: designFileName || null,
        designFileType: designFileType || null,
        designConfig: designConfig || null,
        mockupUrl: mockupUrl || null,
      },
      include: {
        productVariant: true,
      },
    });
  }

  async updateCartItemQuantity(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async deleteCartItem(itemId: string) {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();
