import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

interface PaytmPaymentProps {
  amount: number;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerMobile: string;
  onSuccess?: () => void;
  onFailure?: () => void;
}

const PaytmPayment: React.FC<PaytmPaymentProps> = ({
  amount,
  productName,
  buyerName,
  buyerEmail,
  buyerMobile,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/paytm/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          productName,
          buyerName,
          buyerEmail,
          buyerMobile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create a form and submit it to Paytm
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paytmUrl;

        // Add all Paytm parameters to the form
        Object.keys(data.paytmParams).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.paytmParams[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error('Failed to initiate payment');
        if (onFailure) onFailure();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while processing payment');
      if (onFailure) onFailure();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="payment-card">
      <Card.Body>
        <Card.Title>Payment Details</Card.Title>
        <div className="payment-info">
          <p><strong>Product:</strong> {productName}</p>
          <p><strong>Amount:</strong> ₹{amount}</p>
          <p><strong>Buyer:</strong> {buyerName}</p>
          <p><strong>Email:</strong> {buyerEmail}</p>
          <p><strong>Mobile:</strong> {buyerMobile}</p>
        </div>
        <Button
          variant="primary"
          onClick={handlePayment}
          disabled={loading}
          className="w-100 mt-3"
        >
          {loading ? 'Processing...' : 'Pay with Paytm'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default PaytmPayment;
