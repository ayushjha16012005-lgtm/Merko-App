import { cartRepository } from './cart.repository';
import { prisma } from '@/config/db';
import { NotFoundError, AppError } from '@/errors';
import type { AddToCartDto } from '@merko/types';

export class CartService {
  async getCart(userId: string) {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
      await cartRepository.findOrCreateCart(userId);
      // refetch to get includes
      cart = await cartRepository.findCartByUserId(userId);
    }
    return cart!;
  }

  async addItemToCart(userId: string, data: AddToCartDto) {
    const { productVariantId, quantity, designFileUrl, designFileName, designFileType, mockupUrl, designConfig } = data;

    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    // 1. Verify variant exists and is active
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true }
    });

    if (!variant || !variant.isActive || !variant.product.isActive) {
      throw new NotFoundError('Product variant not found or inactive');
    }

    // 2. Verify stock
    if (variant.stock < quantity) {
      throw new AppError(`Only ${variant.stock} item(s) available in stock`, 400);
    }

    // 3. Find or create cart
    const cart = await cartRepository.findOrCreateCart(userId);

    // 4. Check if item already in cart
    const existingItem = await cartRepository.findCartItem(cart.id, productVariantId, designFileUrl, designConfig);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (variant.stock < newQuantity) {
        throw new AppError(`Cannot add more items. Only ${variant.stock} item(s) in stock, and you already have ${existingItem.quantity} in cart`, 400);
      }
      await cartRepository.updateCartItemQuantity(existingItem.id, newQuantity);
    } else {
      await cartRepository.createCartItem(
        cart.id,
        productVariantId,
        quantity,
        designFileUrl,
        designFileName,
        designFileType,
        designConfig,
        mockupUrl
      );
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    const cart = await cartRepository.findOrCreateCart(userId);

    // Verify cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        productVariant: {
          include: { product: true }
        }
      }
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundError('Cart item not found');
    }

    // Verify stock
    if (cartItem.productVariant.stock < quantity) {
      throw new AppError(`Only ${cartItem.productVariant.stock} item(s) available in stock`, 400);
    }

    await cartRepository.updateCartItemQuantity(itemId, quantity);
    return this.getCart(userId);
  }

  async removeItemFromCart(userId: string, itemId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundError('Cart item not found');
    }

    await cartRepository.deleteCartItem(itemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
