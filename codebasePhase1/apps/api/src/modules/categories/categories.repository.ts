import type { Category } from '@prisma/client';
import { prisma } from '@/config/db';
import type { CreateCategoryInput, UpdateCategoryInput, CategoriesQueryInput } from '@/middleware/validators';

export class CategoriesRepository {
  async findAll(query: CategoriesQueryInput) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

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
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } });
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}

export const categoriesRepository = new CategoriesRepository();
