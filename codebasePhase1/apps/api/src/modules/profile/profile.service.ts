import { profileRepository } from './profile.repository';
import { NotFoundError, ForbiddenError } from '@/errors';
import type { CreateAddressDto } from '@merko/types';

export class ProfileService {
  async getAddresses(userId: string) {
    return profileRepository.getAddresses(userId);
  }

  async createAddress(userId: string, data: CreateAddressDto) {
    const existingAddresses = await profileRepository.getAddresses(userId);
    
    const isFirstAddress = existingAddresses.length === 0;
    const isDefault = isFirstAddress ? true : (data.isDefault || false);

    if (isDefault) {
      await profileRepository.clearDefaultAddresses(userId);
    }

    return profileRepository.createAddress(userId, {
      ...data,
      isDefault,
    });
  }

  async updateAddress(userId: string, addressId: string, data: Partial<CreateAddressDto>) {
    const address = await profileRepository.findAddressById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this address');
    }

    if (data.isDefault) {
      await profileRepository.clearDefaultAddresses(userId);
    }

    return profileRepository.updateAddress(addressId, data);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await profileRepository.findAddressById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this address');
    }

    const wasDefault = address.isDefault;
    await profileRepository.deleteAddress(addressId);

    if (wasDefault) {
      const remaining = await profileRepository.getAddresses(userId);
      if (remaining.length > 0) {
        await profileRepository.updateAddress(remaining[0]!.id, { isDefault: true });
      }
    }
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await profileRepository.findAddressById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this address');
    }

    await profileRepository.clearDefaultAddresses(userId);
    return profileRepository.updateAddress(addressId, { isDefault: true });
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; languagePreference?: string }) {
    const user = await profileRepository.updateProfile(userId, data);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      languagePreference: user.languagePreference,
    };
  }
}

export const profileService = new ProfileService();
