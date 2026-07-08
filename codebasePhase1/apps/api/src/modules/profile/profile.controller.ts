import type { Request, Response } from 'express';
import { profileService } from './profile.service';
import { sendSuccess } from '@/lib/response';
import { UnauthorizedError } from '@/errors';

export class ProfileController {
  async getAddresses(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const addresses = await profileService.getAddresses(req.user.id);
    return sendSuccess(res, addresses);
  }

  async createAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const address = await profileService.createAddress(req.user.id, req.body);
    return sendSuccess(res, address, 201);
  }

  async updateAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const address = await profileService.updateAddress(req.user.id, req.params.id!, req.body);
    return sendSuccess(res, address);
  }

  async deleteAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    await profileService.deleteAddress(req.user.id, req.params.id!);
    return sendSuccess(res, { message: 'Address deleted successfully' });
  }

  async setDefaultAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const address = await profileService.setDefaultAddress(req.user.id, req.params.id!);
    return sendSuccess(res, address);
  }

  async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const user = await profileService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, user);
  }
}

export const profileController = new ProfileController();
