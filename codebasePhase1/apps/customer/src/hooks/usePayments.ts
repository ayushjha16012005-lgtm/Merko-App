import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If script already exists
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function usePayments() {
  const queryClient = useQueryClient();

  const initiatePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post('/payments/initiate', { orderId });
      return response.data.data;
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => {
      const response = await apiClient.post('/payments/verify', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });

  const payWithRazorpay = async ({
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,
    onError,
  }: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string }) => void;
    onError: (error: string) => void;
  }) => {
    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        onError('Razorpay SDK failed to load. Are you offline?');
        return;
      }

      // 2. Initiate payment session
      const session = await initiatePaymentMutation.mutateAsync(orderId);

      // 3. Open Razorpay checkout options
      const options = {
        key: session.keyId,
        amount: session.amount * 100,
        currency: session.currency,
        name: 'Merko Custom Merchandise',
        description: `Order Payment for ${orderId.slice(0, 8)}`,
        order_id: session.gatewayOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // 4. Verify payment with backend
            await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess(response);
          } catch {
            onError('Payment signature verification failed.');
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone || '',
        },
        theme: {
          color: '#6366f1', // Indigo color matching design system
        },
      };

      if (session.isMock) {
        // Under mock mode, simulate immediate success handler after 1 second
        console.log('Mock Payment mode triggered for:', session.gatewayOrderId);
        setTimeout(async () => {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: session.gatewayOrderId,
              razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
              razorpaySignature: 'mock_signature',
            });
            onSuccess({
              razorpay_order_id: session.gatewayOrderId,
              razorpay_payment_id: 'mock_pay_id',
            });
          } catch {
            onError('Verification of mock payment failed.');
          }
        }, 1200);
      } else {
        const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      onError(error.response?.data?.error || 'Failed to initialize payment.');
    }
  };

  return {
    payWithRazorpay,
    isInitiating: initiatePaymentMutation.isPending,
    isVerifying: verifyPaymentMutation.isPending,
  };
}
