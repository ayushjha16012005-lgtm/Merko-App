import { categoriesRepository } from './categories.repository';
import { prisma } from '@/config/db';
import { NotFoundError, AppError } from '@/errors';
import type { CreateCategoryInput, UpdateCategoryInput, CategoriesQueryInput } from '@/middleware/validators';

export class CategoriesService {
  async getAllCategories(query: CategoriesQueryInput) {
    return categoriesRepository.findAll(query);
  }

  async getCategoryById(id: string) {
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoriesRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async createCategory(data: CreateCategoryInput) {
    // Check if slug already exists
    const existing = await categoriesRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError('Category with this slug already exists', 409);
    }

    return categoriesRepository.create(data);
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    // Verify category exists
    await this.getCategoryById(id);

    // If slug is being updated, check for duplicates
    if (data.slug) {
      const existing = await categoriesRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError('Category with this slug already exists', 409);
      }
    }

    return categoriesRepository.update(id, data);
  }

  async updateCategoryStatus(id: string, isActive: boolean) {
    await this.getCategoryById(id);
    return categoriesRepository.update(id, { isActive });
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new AppError(`Cannot delete category because it contains ${productCount} associated product(s). Please delete or reassign products first.`, 400);
    }
    await categoriesRepository.delete(id);
  }
}

export const categoriesService = new CategoriesService();
