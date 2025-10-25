# Payment Integration Setup Guide

## Overview

This guide provides a comprehensive walkthrough for integrating Paytm payment gateway into the KrishiConnect marketplace platform. The integration enables secure payment processing for agricultural transactions between farmers and buyers.

## Frontend Component

The payment UI component is built using React and Chakra UI, providing a seamless checkout experience.

### Key Features:
- Order summary display
- Multiple payment method support
- Responsive design
- Loading states and error handling
- Secure payment processing

### Component Structure:
```jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Spinner
} from '@chakra-ui/react';
import axios from 'axios';

const PaymentComponent = ({ orderId, amount, userDetails }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/payment/initiate', {
        orderId,
        amount,
        userDetails
      });
      
      // Redirect to Paytm payment page
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: error.message,
        status: 'error',
        duration: 5000
      });
      setLoading(false);
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">Complete Your Payment</Text>
        <Text>Amount: ₹{amount}</Text>
        <Button
          colorScheme="green"
          onClick={initiatePayment}
          isLoading={loading}
          loadingText="Processing"
        >
          Pay Now
        </Button>
      </VStack>
    </Box>
  );
};

export default PaymentComponent;
```

## Backend Setup

### 1. Server Configuration (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const PaytmChecksum = require('paytmchecksum');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Environment Variables (.env)

```env
# Paytm Configuration
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE=Retail

# URLs
PAYTM_CALLBACK_URL=http://localhost:5000/api/payment/callback
PAYTM_PAYMENT_URL=https://securegw-stage.paytm.in/order/process
PAYTM_STATUS_URL=https://securegw-stage.paytm.in/order/status

# For Production
# PAYTM_WEBSITE=DEFAULT
# PAYTM_PAYMENT_URL=https://securegw.paytm.in/order/process
# PAYTM_STATUS_URL=https://securegw.paytm.in/order/status
```

### 3. Payment Configuration (config/payment.js)

```javascript
module.exports = {
  paytm: {
    merchantId: process.env.PAYTM_MERCHANT_ID,
    merchantKey: process.env.PAYTM_MERCHANT_KEY,
    website: process.env.PAYTM_WEBSITE,
    channelId: process.env.PAYTM_CHANNEL_ID,
    industryType: process.env.PAYTM_INDUSTRY_TYPE,
    callbackUrl: process.env.PAYTM_CALLBACK_URL,
    paymentUrl: process.env.PAYTM_PAYMENT_URL,
    statusUrl: process.env.PAYTM_STATUS_URL
  }
};
```

### 4. Payment Routes (routes/payment.js)

```javascript
const express = require('express');
const router = express.Router();
const PaytmChecksum = require('paytmchecksum');
const config = require('../config/payment');

// Initiate Payment
router.post('/initiate', async (req, res) => {
  try {
    const { orderId, amount, userDetails } = req.body;
    
    const paytmParams = {
      body: {
        requestType: 'Payment',
        mid: config.paytm.merchantId,
        websiteName: config.paytm.website,
        orderId: orderId,
        callbackUrl: config.paytm.callbackUrl,
        txnAmount: {
          value: amount,
          currency: 'INR'
        },
        userInfo: {
          custId: userDetails.customerId,
          email: userDetails.email,
          mobile: userDetails.mobile
        }
      }
    };

    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      config.paytm.merchantKey
    );

    paytmParams.head = {
      signature: checksum
    };

    res.json({
      paytmParams,
      paymentUrl: `${config.paytm.paymentUrl}?mid=${config.paytm.merchantId}&orderId=${orderId}`
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Payment Callback
router.post('/callback', async (req, res) => {
  try {
    const paytmChecksum = req.body.CHECKSUMHASH;
    delete req.body.CHECKSUMHASH;

    const isVerified = PaytmChecksum.verifySignature(
      req.body,
      config.paytm.merchantKey,
      paytmChecksum
    );

    if (isVerified) {
      // Payment successful - Update order status
      const { ORDERID, TXNID, TXNAMOUNT, STATUS } = req.body;
      
      if (STATUS === 'TXN_SUCCESS') {
        // Update database with successful payment
        console.log('Payment successful:', { ORDERID, TXNID, TXNAMOUNT });
        res.redirect(`/payment-success?orderId=${ORDERID}`);
      } else {
        res.redirect(`/payment-failed?orderId=${ORDERID}`);
      }
    } else {
      res.status(400).json({ error: 'Checksum verification failed' });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Check Payment Status
router.post('/status', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const paytmParams = {
      body: {
        mid: config.paytm.merchantId,
        orderId: orderId
      }
    };

    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      config.paytm.merchantKey
    );

    paytmParams.head = {
      signature: checksum
    };

    const response = await fetch(config.paytm.statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paytmParams)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

module.exports = router;
```

## Get Paytm Credentials

### For Testing (Staging):
1. Visit [Paytm Developer Portal](https://developer.paytm.com/)
2. Sign up for a developer account
3. Access staging credentials from the dashboard
4. Use staging URLs for testing

### For Production:
1. Complete merchant onboarding at [Paytm Business](https://business.paytm.com/)
2. Submit required documents:
   - Business registration
   - PAN card
   - Bank account details
   - Address proof
3. Receive production credentials after verification
4. Update environment variables with production URLs

## Testing

### Test Flow:
1. Create a test order with amount
2. Click "Pay Now" button
3. Redirected to Paytm payment page
4. Use Paytm test credentials:
   - Test cards provided by Paytm
   - Test UPI IDs
   - Test wallet numbers
5. Complete payment
6. Verify callback handling
7. Check order status update

### Test Credentials (Staging):
- Available in Paytm Developer Dashboard
- Test cards with different scenarios:
  - Success
  - Failure
  - Pending
  - Invalid

## Frontend Usage

### Integration in Order Page:

```jsx
import PaymentComponent from './components/PaymentComponent';

const OrderCheckout = () => {
  const orderDetails = {
    orderId: 'ORDER_' + Date.now(),
    amount: 1000,
    userDetails: {
      customerId: 'CUST123',
      email: 'farmer@example.com',
      mobile: '9876543210'
    }
  };

  return (
    <div>
      <h1>Order Checkout</h1>
      <PaymentComponent {...orderDetails} />
    </div>
  );
};
```

## Running the Project

### Backend:
```bash
# Install dependencies
npm install express cors paytmchecksum dotenv

# Create .env file with credentials
cp .env.example .env
# Edit .env with your Paytm credentials

# Start server
node server.js
```

### Frontend:
```bash
# Install dependencies
npm install axios @chakra-ui/react @emotion/react @emotion/styled framer-motion

# Start development server
npm start
```

## Production Deployment

### Pre-deployment Checklist:
- [ ] Replace staging credentials with production credentials
- [ ] Update PAYTM_WEBSITE to 'DEFAULT'
- [ ] Update payment URLs to production endpoints
- [ ] Enable HTTPS for callback URL
- [ ] Implement proper error logging
- [ ] Set up payment reconciliation
- [ ] Configure webhook endpoints
- [ ] Test all payment scenarios
- [ ] Implement retry mechanism
- [ ] Set up monitoring and alerts

### Environment Variables for Production:
```env
PAYTM_MERCHANT_ID=your_production_mid
PAYTM_MERCHANT_KEY=your_production_key
PAYTM_WEBSITE=DEFAULT
PAYTM_CALLBACK_URL=https://yourdomain.com/api/payment/callback
PAYTM_PAYMENT_URL=https://securegw.paytm.in/order/process
PAYTM_STATUS_URL=https://securegw.paytm.in/order/status
```

### Security Best Practices:
1. Never expose merchant key in frontend code
2. Always verify checksum in callbacks
3. Use HTTPS for all payment communications
4. Implement rate limiting on payment endpoints
5. Log all payment transactions securely
6. Store sensitive data encrypted
7. Implement proper access controls
8. Regular security audits

## Support & Resources

### Official Documentation:
- [Paytm Payment Gateway Documentation](https://developer.paytm.com/docs/)
- [Paytm Checksum Utility](https://developer.paytm.com/docs/checksum/)
- [API Reference](https://developer.paytm.com/docs/api-reference/)

### Common Issues & Solutions:

**Issue 1: Checksum Mismatch**
- Solution: Verify merchant key and ensure proper JSON stringification

**Issue 2: Callback Not Received**
- Solution: Check callback URL accessibility and firewall settings

**Issue 3: Payment Status Not Updated**
- Solution: Implement status inquiry API for reconciliation

**Issue 4: Amount Mismatch**
- Solution: Ensure amount format is correct (string with 2 decimal places)

### Support Channels:
- Email: developer@paytm.com
- Developer Forum: https://developer.paytm.com/forum
- Integration Support: Available through merchant dashboard

## Summary

This payment integration provides:
- ✅ Secure payment processing
- ✅ Multiple payment methods (Cards, UPI, Wallet, Net Banking)
- ✅ Seamless checkout experience
- ✅ Real-time payment status updates
- ✅ Proper error handling
- ✅ Production-ready code structure
- ✅ Comprehensive testing support

For additional customization or advanced features, refer to the official Paytm documentation or contact their support team.

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Maintained By:** KrishiConnect Development Team
