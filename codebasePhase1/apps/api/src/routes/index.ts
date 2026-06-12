import type { Express } from 'express';
import { CONSTANTS } from '@merko/config';
import { healthRouter } from '@/modules/health';
import { categoriesRouter } from '@/modules/categories';
import { productsRouter } from '@/modules/products';
import { authRouter } from '@/modules/auth';
import { profileRouter } from '@/modules/profile';
import { cartRouter } from '@/modules/cart';
import { ordersRouter } from '@/modules/orders';
import { paymentsRouter } from '@/modules/payments';
import { shipmentsRouter } from '@/modules/shipments';
import { returnsRouter } from '@/modules/returns';
import { refundsRouter } from '@/modules/refunds';
import { usersRouter } from '@/modules/users/users.routes';
import { uploadRouter } from '@/modules/upload';

export function registerRoutes(app: Express): void {
  const basePath = `/api/${CONSTANTS.API_VERSION}`;
  app.use(`${basePath}/health`, healthRouter);
  app.use(`${basePath}/auth`, authRouter);
  app.use(`${basePath}/profile`, profileRouter);
  app.use(`${basePath}/categories`, categoriesRouter);
  app.use(`${basePath}/products`, productsRouter);
  app.use(`${basePath}/cart`, cartRouter);
  app.use(`${basePath}/orders`, ordersRouter);
  app.use(`${basePath}/payments`, paymentsRouter);
  app.use(`${basePath}/shipments`, shipmentsRouter);
  app.use(`${basePath}/returns`, returnsRouter);
  app.use(`${basePath}/refunds`, refundsRouter);
  app.use(`${basePath}/users`, usersRouter);
  app.use(`${basePath}/upload`, uploadRouter);
}
