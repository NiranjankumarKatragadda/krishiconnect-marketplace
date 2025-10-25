# Payment Integration Setup Guide

This document provides comprehensive instructions for integrating Paytm payment gateway into the KrishiConnect Marketplace.

## 1. Backend Setup Instructions (Node.js/Express)

### Prerequisites
- Node.js (v14 or higher)
- Express.js server
- MongoDB/Database setup

### Install Required Package

```bash
npm install paytmchecksum
```

### Package Import

```javascript
const PaytmChecksum = require('paytmchecksum');
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

## 2. Environment Variables Configuration

Create a `.env` file in your project root and add the following variables:

```env
# Paytm Configuration
PAYTM_MID=your_merchant_id_here
PAYTM_MERCHANT_KEY=your_merchant_key_here
PAYTM_WEBSITE=WEBSTAGING  # Use 'DEFAULT' for production
PAYTM_CALLBACK_URL=https://yourdomain.com/api/paytm/callback

# Environment
NODE_ENV=development  # Change to 'production' for live
PORT=3000
```

### Environment Variable Descriptions:
- **PAYTM_MID**: Merchant ID provided by Paytm
- **PAYTM_MERCHANT_KEY**: Secret key for checksum generation
- **PAYTM_WEBSITE**: 'WEBSTAGING' for testing, 'DEFAULT' for production
- **PAYTM_CALLBACK_URL**: URL where Paytm will redirect after payment

## 3. API Endpoints Implementation

### 3.1 Payment Initiation Endpoint

```javascript
// /api/paytm/initiate
app.post('/api/paytm/initiate', async (req, res) => {
    try {
        const { orderId, amount, customerId, customerEmail, customerPhone } = req.body;
        
        // Validate required fields
        if (!orderId || !amount || !customerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const paytmParams = {
            MID: process.env.PAYTM_MID,
            WEBSITE: process.env.PAYTM_WEBSITE,
            CHANNEL_ID: 'WEB',
            INDUSTRY_TYPE_ID: 'Retail',
            ORDER_ID: orderId,
            CUST_ID: customerId,
            TXN_AMOUNT: amount.toString(),
            CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
            EMAIL: customerEmail || '',
            MOBILE_NO: customerPhone || ''
        };

        // Generate checksum
        const checksum = await PaytmChecksum.generateSignature(
            paytmParams, 
            process.env.PAYTM_MERCHANT_KEY
        );
        
        paytmParams.CHECKSUMHASH = checksum;
        
        // Return payment form data
        res.json({
            success: true,
            data: paytmParams,
            action: process.env.NODE_ENV === 'production' 
                ? 'https://securegw.paytm.in/order/process'
                : 'https://securegw-stage.paytm.in/order/process'
        });
        
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
});
```

### 3.2 Payment Callback Endpoint

```javascript
// /api/paytm/callback
app.post('/api/paytm/callback', async (req, res) => {
    try {
        const paytmParams = req.body;
        const checksum = paytmParams.CHECKSUMHASH;
        delete paytmParams.CHECKSUMHASH;

        // Verify checksum
        const isValidChecksum = PaytmChecksum.verifySignature(
            paytmParams, 
            process.env.PAYTM_MERCHANT_KEY, 
            checksum
        );

        if (isValidChecksum) {
            // Process payment response
            const { ORDERID, TXNID, STATUS, RESPCODE, RESPMSG } = paytmParams;
            
            if (STATUS === 'TXN_SUCCESS') {
                // Update order status in database
                // await updateOrderStatus(ORDERID, 'paid', TXNID);
                
                res.redirect(`/payment-success?orderId=${ORDERID}&txnId=${TXNID}`);
            } else {
                res.redirect(`/payment-failed?orderId=${ORDERID}&reason=${RESPMSG}`);
            }
        } else {
            res.redirect('/payment-failed?reason=Invalid+checksum');
        }
        
    } catch (error) {
        console.error('Callback processing error:', error);
        res.redirect('/payment-failed?reason=Processing+error');
    }
});
```

### 3.3 Payment Verification Endpoint

```javascript
// /api/paytm/verify
app.post('/api/paytm/verify', async (req, res) => {
    try {
        const { orderId, txnId } = req.body;
        
        const paytmParams = {
            MID: process.env.PAYTM_MID,
            ORDERID: orderId
        };

        const checksum = await PaytmChecksum.generateSignature(
            paytmParams, 
            process.env.PAYTM_MERCHANT_KEY
        );
        
        paytmParams.CHECKSUMHASH = checksum;
        
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paytmParams)
        };
        
        const verifyUrl = process.env.NODE_ENV === 'production'
            ? 'https://securegw.paytm.in/order/status'
            : 'https://securegw-stage.paytm.in/order/status';
            
        const response = await fetch(verifyUrl, requestOptions);
        const result = await response.json();
        
        res.json({ success: true, data: result });
        
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
```

## 4. Getting Paytm Credentials

### Steps to obtain credentials from business.paytm.com:

1. **Registration**:
   - Visit [business.paytm.com](https://business.paytm.com)
   - Sign up for a business account
   - Complete KYC verification

2. **Integration Setup**:
   - Navigate to 'Developers' section
   - Select 'Payment Gateway'
   - Choose 'Website Integration'

3. **Credentials Location**:
   - **Merchant ID (MID)**: Found in Dashboard > Profile
   - **Merchant Key**: Available in API Keys section
   - **Website Name**: Assigned during integration setup

4. **Testing Environment**:
   - Use staging credentials for development
   - Switch to production credentials for live deployment

## 5. Test Card Details for Staging

### Credit/Debit Cards:

```
# Successful Transaction
Card Number: 4111111111111111
Expiry Date: 12/25
CVV: 123
Name: Test User

# Failed Transaction
Card Number: 4000000000000002
Expiry Date: 12/25
CVV: 123
Name: Test User
```

### Net Banking:
- Bank: Test Bank
- User ID: test
- Password: test
- Transaction PIN: 123456

### UPI:
- UPI ID: test@paytm
- PIN: 123456

### Wallet:
- Mobile: 9999999999
- OTP: 489871

## 6. Frontend Integration Example

### PaytmPayment Component Usage

```javascript
import React, { useState } from 'react';

const PaytmPayment = ({ orderData, onSuccess, onFailure }) => {
    const [loading, setLoading] = useState(false);
    
    const initiatePayment = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/paytm/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: orderData.orderId,
                    amount: orderData.amount,
                    customerId: orderData.customerId,
                    customerEmail: orderData.customerEmail,
                    customerPhone: orderData.customerPhone
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Create form and submit to Paytm
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = result.action;
                
                Object.keys(result.data).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = result.data[key];
                    form.appendChild(input);
                });
                
                document.body.appendChild(form);
                form.submit();
            } else {
                onFailure('Payment initiation failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            onFailure('Payment processing error');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="payment-container">
            <div className="payment-summary">
                <h3>Payment Summary</h3>
                <p>Order ID: {orderData.orderId}</p>
                <p>Amount: ₹{orderData.amount}</p>
            </div>
            
            <button 
                onClick={initiatePayment} 
                disabled={loading}
                className="pay-now-btn"
            >
                {loading ? 'Processing...' : 'Pay with Paytm'}
            </button>
        </div>
    );
};

export default PaytmPayment;
```

### Usage in Parent Component:

```javascript
import PaytmPayment from './components/PaytmPayment';

const CheckoutPage = () => {
    const orderData = {
        orderId: 'ORD_' + Date.now(),
        amount: 1500,
        customerId: 'CUST_001',
        customerEmail: 'customer@example.com',
        customerPhone: '9999999999'
    };
    
    const handlePaymentSuccess = (data) => {
        console.log('Payment successful:', data);
        // Redirect to success page or update UI
    };
    
    const handlePaymentFailure = (error) => {
        console.error('Payment failed:', error);
        // Show error message to user
    };
    
    return (
        <div>
            <h2>Checkout</h2>
            <PaytmPayment 
                orderData={orderData}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
            />
        </div>
    );
};
```

## 7. Security Best Practices

1. **Environment Variables**: Never expose merchant keys in client-side code
2. **HTTPS**: Always use HTTPS in production
3. **Checksum Verification**: Always verify checksums on callback
4. **Order Validation**: Validate order amounts and details
5. **Database Updates**: Only update order status after successful verification

## 8. Testing Checklist

- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Network timeout scenarios
- [ ] Invalid checksum handling
- [ ] Database status updates
- [ ] Callback URL accessibility
- [ ] Mobile responsiveness
- [ ] Different payment methods (Card, UPI, Wallet, Net Banking)

## 9. Troubleshooting

### Common Issues:

1. **Checksum Mismatch**: Verify merchant key and parameter order
2. **Callback Not Working**: Ensure callback URL is publicly accessible
3. **Payment Gateway Error**: Check MID and environment configuration
4. **CORS Issues**: Configure proper CORS headers for API endpoints

### Debug Mode:

```javascript
// Add to development environment
if (process.env.NODE_ENV === 'development') {
    console.log('Paytm Parameters:', paytmParams);
    console.log('Generated Checksum:', checksum);
}
```

---

## Support

For technical support:
- Paytm Developer Documentation: https://developer.paytm.com/
- Business Support: business.paytm.com/support
- Integration Issues: Create an issue in this repository
