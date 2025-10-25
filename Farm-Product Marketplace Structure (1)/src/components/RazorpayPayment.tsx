import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RazorpayPaymentProps {
  amount: number;
  productName: string;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  productName,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await loadRazorpay();

      if (!res) {
        toast.error('Razorpay SDK failed to load');
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'KrishiConnect',
        description: `Payment for ${productName}`,
        handler: function (response: any) {
          toast.success('Payment successful!');
          onSuccess?.(response.razorpay_payment_id);
          setLoading(false);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#10b981',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast.error('Payment failed. Please try again.');
        onFailure?.(response.error);
        setLoading(false);
      });
      paymentObject.open();
    } catch (error) {
      toast.error('An error occurred during payment');
      onFailure?.(error);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Product:</span>
            <span className="font-medium">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-medium">₹{amount}</span>
          </div>
        </div>
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
