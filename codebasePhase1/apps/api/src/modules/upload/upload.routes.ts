import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sendSuccess } from '@/lib/response';
import { AppError } from '@/errors';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { fileName, fileType, fileData } = req.body;

    if (!fileName || !fileType || !fileData) {
      throw new AppError('fileName, fileType and fileData (Base64) are required', 400);
    }

    // Supported extensions validation
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.svg', '.ai', '.psd'];
    const ext = path.extname(fileName).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new AppError(`Unsupported file extension. Allowed: ${allowedExtensions.join(', ')}`, 400);
    }

    // Decode Base64 data
    const buffer = Buffer.from(fileData, 'base64');

    // Validate size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new AppError('File size exceeds 10MB limit', 400);
    }

    // Setup public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file with unique hash prefix to prevent collisions
    const hash = crypto.randomBytes(8).toString('hex');
    const safeFileName = `${hash}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFileName);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `http://localhost:4000/uploads/${safeFileName}`;

    sendSuccess(res, {
      fileUrl,
      fileName,
      fileType,
      fileSize: buffer.length,
    }, 201);
  } catch (error) {
    next(error);
  }
});

export const uploadRouter = router;
export default uploadRouter;
