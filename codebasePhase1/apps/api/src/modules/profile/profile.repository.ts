import { prisma } from '@/config/db';
import type { Address, User } from '@prisma/client';
import type { CreateAddressDto } from '@merko/types';

export class ProfileRepository {
  async getAddresses(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findAddressById(id: string): Promise<Address | null> {
    return prisma.address.findUnique({ where: { id } });
  }

  async createAddress(userId: string, data: CreateAddressDto): Promise<Address> {
    return prisma.address.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
        isDefault: data.isDefault || false,
      },
    });
  }

  async updateAddress(id: string, data: Partial<CreateAddressDto>): Promise<Address> {
    return prisma.address.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault,
      },
    });
  }

  async deleteAddress(id: string): Promise<void> {
    await prisma.address.delete({ where: { id } });
  }

  async clearDefaultAddresses(userId: string): Promise<void> {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; languagePreference?: string }): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}

export const profileRepository = new ProfileRepository();
