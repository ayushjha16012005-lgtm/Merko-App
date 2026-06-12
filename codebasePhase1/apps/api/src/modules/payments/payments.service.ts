import crypto from 'crypto';
import Razorpay from 'razorpay';
import { paymentsRepository } from './payments.repository';
import { prisma } from '@/config/db';
import { AppError, NotFoundError } from '@/errors';

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid12345';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret1234567890abcdef';
const isMockMode = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export class PaymentsService {
  async initiatePayment(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new AppError(`Cannot pay for an order in status: ${order.status}`, 400);
    }

    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    // If payment already exists and is completed, block
    if (order.payment) {
      if (order.payment.status === 'COMPLETED') {
        throw new AppError('Payment already completed for this order', 400);
      }
      // Return existing payment gateway order id if already created
      if (order.payment.gatewayOrderId) {
        return {
          paymentId: order.payment.id,
          gatewayOrderId: order.payment.gatewayOrderId,
          amount: Number(order.totalAmount),
          currency: 'INR',
          keyId: isMockMode ? 'MOCK_KEY_ID' : keyId,
          isMock: isMockMode,
        };
      }
    }

    let gatewayOrderId = '';

    if (isMockMode) {
      // Simulate Razorpay order id creation
      gatewayOrderId = `rzp_mock_${crypto.randomBytes(8).toString('hex')}`;
    } else {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
        });
        gatewayOrderId = rzpOrder.id;
      } catch (err) {
        const error = err as Error;
        throw new AppError(`Razorpay order creation failed: ${error.message}`, 502);
      }
    }

    const payment = await paymentsRepository.createPayment({
      orderId,
      amount: Number(order.totalAmount),
      provider: 'RAZORPAY',
      status: 'PENDING',
      gatewayOrderId,
    });

    return {
      paymentId: payment.id,
      gatewayOrderId,
      amount: Number(order.totalAmount),
      currency: 'INR',
      keyId: isMockMode ? 'MOCK_KEY_ID' : keyId,
      isMock: isMockMode,
    };
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const payment = await paymentsRepository.findPaymentByGatewayOrderId(razorpayOrderId);
    if (!payment) {
      throw new NotFoundError('Payment session not found');
    }

    if (payment.status === 'COMPLETED') {
      return payment;
    }

    let isValid = false;

    if (isMockMode && razorpaySignature === 'mock_signature') {
      isValid = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      // Record failed transaction attempt
      await paymentsRepository.createTransaction({
        paymentId: payment.id,
        transactionId: razorpayPaymentId,
        status: 'FAILED',
        rawPayload: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
      });
      throw new AppError('Payment signature verification failed', 400);
    }

    // Success transaction
    return prisma.$transaction(async (tx) => {
      // 1. Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayPaymentId: razorpayPaymentId,
        },
      });

      // 2. Create transaction record
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          transactionId: razorpayPaymentId,
          status: 'COMPLETED',
          rawPayload: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
        },
      });

      // 3. Update Order status to PAYMENT_SUCCESS and timeline
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'DESIGN_APPROVED', // Advance straight to design approved for printing
        },
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId: payment.orderId,
          status: 'DESIGN_APPROVED',
          description: 'Payment verified successfully. Order passed to customization review.',
        },
      });

      return updatedPayment;
    });
  }

  async getPaymentByOrderId(orderId: string) {
    return paymentsRepository.findPaymentByOrderId(orderId);
  }
}

export const paymentsService = new PaymentsService();
