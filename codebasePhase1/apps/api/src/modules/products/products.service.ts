import type { Product } from '@prisma/client';
import { ProductsRepository } from './products.repository';
import { NotFoundError, AppError } from '@/errors';
import type { CreateProductInput, UpdateProductInput } from '@/middleware/validators';

export class ProductsService {
  private repository = new ProductsRepository();

  async getAllProducts(
    search?: string,
    categoryId?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Product[]; total: number; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const result = await this.repository.findAll(search, categoryId, isActive, page, limit);
    const pages = Math.ceil(result.total / limit);

    return {
      data: result.data,
      total: result.total,
      pagination: { page, limit, total: result.total, pages },
    };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.repository.findBySlug(slug);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    // Check if slug already exists
    const existingSlug = await this.repository.existsBySlug(data.slug);
    if (existingSlug) {
      throw new AppError(`Product with slug "${data.slug}" already exists`, 409);
    }

    return this.repository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.repository.findByIdWithDeleted(id);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // Check if slug is being updated and if it's unique
    if (data.slug && data.slug !== existingProduct.slug) {
      const slugExists = await this.repository.existsBySlug(data.slug, id);
      if (slugExists) {
        throw new AppError(`Product with slug "${data.slug}" already exists`, 409);
      }
    }

    return this.repository.update(id, data);
  }

  async updateProductStatus(id: string, isActive: boolean): Promise<Product> {
    const product = await this.repository.findByIdWithDeleted(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return this.repository.update(id, { isActive });
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.repository.findByIdWithDeleted(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Soft delete (mark as deleted)
    await this.repository.softDelete(id);
  }

  async permanentlyDeleteProduct(id: string): Promise<void> {
    const product = await this.repository.findByIdWithDeleted(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await this.repository.hardDelete(id);
  }
}

export const productsService = new ProductsService();
