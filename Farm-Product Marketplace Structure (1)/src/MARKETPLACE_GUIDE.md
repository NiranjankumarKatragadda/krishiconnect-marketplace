# KrishiConnect - Farm Marketplace MVP

A fully functional farm product marketplace platform connecting suppliers (farmers) with buyers, featuring government mandi rate integration and real-time data persistence.

## 🚀 Getting Started

### First Time Setup

1. **The app will automatically seed government mandi rates** when you first load it.

2. **Create an account:**
   - Click "Sign Up" in the header
   - Choose your role: Supplier (Farmer/Trader) or Buyer
   - Fill in your details and create an account

### For Suppliers (Farmers/Traders)

1. **Access Dashboard:**
   - After signing up as a supplier, navigate to "Dashboard" in the header
   - You'll see a welcome banner with an option to create demo listings

2. **Create Listings:**
   - Click "Create Listing" button
   - Fill in crop details (crop, grade, quantity, price, mandi location, etc.)
   - Add description and packaging information
   - Submit to publish your listing

3. **Manage Inquiries:**
   - View all buyer inquiries in the "Orders & Inquiries" tab
   - Respond to buyers and negotiate prices
   - Update order status as you process them

### For Buyers

1. **Browse Market:**
   - Click "Market" in the header
   - Use filters to search by crop, grade, or location
   - View detailed product information including mandi rate comparison

2. **Send Inquiries:**
   - Click on any listing to view details
   - Click "Send Inquiry" button
   - Specify quantity and add a message
   - Wait for supplier response

## 🎯 Key Features Implemented

### ✅ Authentication & User Management
- Signup/Login with email and password
- Role-based access (Supplier/Buyer)
- User profiles with location and contact info
- Protected routes for suppliers

### ✅ Listing Management
- Create, view, update, and delete listings
- Real-time data persistence in Supabase
- Image support (currently using Unsplash demo images)
- Status tracking (published, pending, closed)

### ✅ Order/Inquiry System
- Buyers can send inquiries to suppliers
- Quantity and message support
- Estimated total calculation
- Order status tracking (inquiry, negotiation, confirmed, completed)

### ✅ Mandi Rate Integration
- Government mandi rates display on homepage
- Side-by-side price comparison on product pages
- Shows percentage difference from govt rates
- Daily rate updates (seeded data for demo)

### ✅ Supplier Dashboard
- Overview statistics (listings, inquiries, sales)
- Listing management interface
- Order management
- Verification status display
- Welcome banner with demo data option

### ✅ Search & Filters
- Search by crop, location, or supplier
- Filter by crop type, grade, mandi
- Sort by price, date, rating

## 🔧 Technical Architecture

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Context** for auth state management

### Backend
- **Supabase** for authentication
- **Supabase Edge Functions** (Hono server) for API
- **Key-Value Store** for data persistence
- RESTful API endpoints for all operations

### API Routes
- `POST /auth/signup` - Create new user
- `GET /listings` - Get all listings with filters
- `POST /listings` - Create new listing (auth required)
- `PUT /listings/:id` - Update listing (auth required)
- `DELETE /listings/:id` - Delete listing (auth required)
- `GET /orders` - Get user orders (auth required)
- `POST /orders` - Create inquiry (auth required)
- `GET /mandi-rates` - Get government rates
- `GET /users/me` - Get current user profile (auth required)

## 📝 Demo Credentials

You can create your own account or use the demo data seeder in the Supplier Dashboard.

## 🎨 User Flows

### Supplier Journey
1. Sign up as Supplier → 2. Access Dashboard → 3. Create Listing → 4. Receive Inquiries → 5. Negotiate & Confirm Orders

### Buyer Journey
1. Sign up as Buyer → 2. Browse Market → 3. View Product Details → 4. Send Inquiry → 5. Wait for Supplier Response

## 🔐 Security Features

- Email/password authentication via Supabase Auth
- Protected API routes requiring authentication
- Role-based access control
- User can only modify their own listings
- Secure token-based authorization

## 💡 Tips

1. **Start with Demo Data**: Use the "Create Demo Listings" button in the Supplier Dashboard to quickly populate your account
2. **Price Comparison**: Check the mandi rate comparison on product detail pages to ensure fair pricing
3. **Verification Badge**: Verified suppliers get a green badge (currently auto-set in demo)
4. **Mobile Responsive**: The entire app is mobile-friendly

## 🚧 Production Considerations

Before deploying to production, you should:

1. **Set up email confirmation** in Supabase Auth settings
2. **Add image upload functionality** using Supabase Storage
3. **Implement actual mandi rate API integration** (e.g., AGMARKNET)
4. **Add payment gateway** for escrow/transactions
5. **Implement real-time chat** between buyers and suppliers
6. **Add admin panel** for user verification and commission management
7. **Set up proper database schema** instead of KV store for complex queries
8. **Add rate limiting** and security measures
9. **Implement email/SMS notifications**
10. **Add analytics and reporting**

## 📞 Support

For issues or questions about the MVP, check the browser console for error logs. All API calls include detailed error messages.

---

**Note**: This is a prototype/MVP. Do not use it to collect or store sensitive personal or financial information in a production environment without proper security audits and compliance measures.
