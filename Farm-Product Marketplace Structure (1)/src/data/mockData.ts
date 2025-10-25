// Mock data for the farm marketplace

export interface MandiRate {
  id: string;
  crop: string;
  mandi: string;
  state: string;
  govtRate: number;
  date: string;
  change: number;
}

export interface Listing {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  supplierVerified: boolean;
  supplierLocation: string;
  crop: string;
  grade: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  mandi: string;
  packaging: string;
  harvestDate: string;
  images: string[];
  certification?: string;
  description: string;
  status: 'published' | 'pending' | 'closed';
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  buyerName: string;
  crop: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  status: 'inquiry' | 'negotiation' | 'confirmed' | 'completed';
  createdAt: string;
}

export const mandiRates: MandiRate[] = [
  {
    id: '1',
    crop: 'Wheat',
    mandi: 'Azadpur Mandi',
    state: 'Delhi',
    govtRate: 2125,
    date: '2025-10-19',
    change: 2.5,
  },
  {
    id: '2',
    crop: 'Rice',
    mandi: 'Karnal Mandi',
    state: 'Haryana',
    govtRate: 2850,
    date: '2025-10-19',
    change: -1.2,
  },
  {
    id: '3',
    crop: 'Tomato',
    mandi: 'Koyambedu Market',
    state: 'Tamil Nadu',
    govtRate: 18,
    date: '2025-10-19',
    change: 15.5,
  },
  {
    id: '4',
    crop: 'Onion',
    mandi: 'Lasalgaon Mandi',
    state: 'Maharashtra',
    govtRate: 22,
    date: '2025-10-19',
    change: -8.3,
  },
  {
    id: '5',
    crop: 'Potato',
    mandi: 'Agra Mandi',
    state: 'Uttar Pradesh',
    govtRate: 12,
    date: '2025-10-19',
    change: 0,
  },
];

export const listings: Listing[] = [
  {
    id: '1',
    supplierId: 'supplier1',
    supplierName: 'Rajesh Kumar',
    supplierRating: 4.5,
    supplierVerified: true,
    supplierLocation: 'Karnal, Haryana',
    crop: 'Rice (Basmati)',
    grade: 'Grade A',
    quantity: 5000,
    unit: 'kg',
    pricePerUnit: 2750,
    mandi: 'Karnal Mandi',
    packaging: '50kg bags',
    harvestDate: '2025-10-10',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c'],
    certification: 'Organic Certified',
    description: 'Premium quality Basmati rice, freshly harvested. Minimum order 500kg.',
    status: 'published',
    createdAt: '2025-10-15',
  },
  {
    id: '2',
    supplierId: 'supplier2',
    supplierName: 'Suresh Patel',
    supplierRating: 4.8,
    supplierVerified: true,
    supplierLocation: 'Azadpur, Delhi',
    crop: 'Wheat',
    grade: 'Grade A',
    quantity: 10000,
    unit: 'kg',
    pricePerUnit: 2100,
    mandi: 'Azadpur Mandi',
    packaging: '40kg bags',
    harvestDate: '2025-10-05',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'],
    description: 'High quality wheat suitable for flour milling. Bulk orders welcome.',
    status: 'published',
    createdAt: '2025-10-12',
  },
  {
    id: '3',
    supplierId: 'supplier3',
    supplierName: 'Lakshmi Reddy',
    supplierRating: 4.2,
    supplierVerified: true,
    supplierLocation: 'Koyambedu, Tamil Nadu',
    crop: 'Tomato',
    grade: 'Grade B',
    quantity: 2000,
    unit: 'kg',
    pricePerUnit: 16,
    mandi: 'Koyambedu Market',
    packaging: 'Crates (20kg each)',
    harvestDate: '2025-10-18',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    description: 'Fresh tomatoes, ideal for wholesale. Quick delivery available.',
    status: 'published',
    createdAt: '2025-10-18',
  },
  {
    id: '4',
    supplierId: 'supplier4',
    supplierName: 'Mahesh Desai',
    supplierRating: 4.6,
    supplierVerified: true,
    supplierLocation: 'Lasalgaon, Maharashtra',
    crop: 'Onion',
    grade: 'Grade A',
    quantity: 8000,
    unit: 'kg',
    pricePerUnit: 20,
    mandi: 'Lasalgaon Mandi',
    packaging: '25kg mesh bags',
    harvestDate: '2025-10-08',
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb'],
    description: 'Premium quality onions. Storage facility available for bulk buyers.',
    status: 'published',
    createdAt: '2025-10-14',
  },
  {
    id: '5',
    supplierId: 'supplier5',
    supplierName: 'Ramesh Singh',
    supplierRating: 4.3,
    supplierVerified: false,
    supplierLocation: 'Agra, Uttar Pradesh',
    crop: 'Potato',
    grade: 'Grade A',
    quantity: 3000,
    unit: 'kg',
    pricePerUnit: 11,
    mandi: 'Agra Mandi',
    packaging: '50kg jute bags',
    harvestDate: '2025-10-12',
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655'],
    description: 'Good quality potatoes for retail and wholesale. Negotiable prices for large orders.',
    status: 'published',
    createdAt: '2025-10-16',
  },
  {
    id: '6',
    supplierId: 'supplier6',
    supplierName: 'Priya Sharma',
    supplierRating: 4.9,
    supplierVerified: true,
    supplierLocation: 'Nashik, Maharashtra',
    crop: 'Grapes',
    grade: 'Premium',
    quantity: 1500,
    unit: 'kg',
    pricePerUnit: 45,
    mandi: 'Nashik Mandi',
    packaging: '5kg boxes',
    harvestDate: '2025-10-17',
    images: ['https://images.unsplash.com/photo-1601275618229-9c72d0558ab2'],
    certification: 'Export Quality',
    description: 'Premium export quality grapes. Perfect for retail chains and exporters.',
    status: 'published',
    createdAt: '2025-10-17',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord1',
    listingId: '1',
    buyerName: 'ABC Rice Mills',
    crop: 'Rice (Basmati)',
    quantity: 1000,
    unit: 'kg',
    unitPrice: 2750,
    totalAmount: 2750000,
    status: 'negotiation',
    createdAt: '2025-10-18',
  },
  {
    id: 'ord2',
    listingId: '2',
    buyerName: 'XYZ Flour Co.',
    crop: 'Wheat',
    quantity: 2000,
    unit: 'kg',
    unitPrice: 2100,
    totalAmount: 4200000,
    status: 'confirmed',
    createdAt: '2025-10-17',
  },
  {
    id: 'ord3',
    listingId: '4',
    buyerName: 'Fresh Mart',
    crop: 'Onion',
    quantity: 500,
    unit: 'kg',
    unitPrice: 20,
    totalAmount: 10000,
    status: 'inquiry',
    createdAt: '2025-10-19',
  },
];

export const cropOptions = [
  'Rice (Basmati)',
  'Rice (Non-Basmati)',
  'Wheat',
  'Tomato',
  'Onion',
  'Potato',
  'Grapes',
  'Mango',
  'Cotton',
  'Sugarcane',
];

export const gradeOptions = ['Grade A', 'Grade B', 'Premium', 'Standard'];

export const unitOptions = ['kg', 'quintal', 'ton', 'crate', 'box'];

export const mandiOptions = [
  'Azadpur Mandi, Delhi',
  'Karnal Mandi, Haryana',
  'Koyambedu Market, Tamil Nadu',
  'Lasalgaon Mandi, Maharashtra',
  'Agra Mandi, Uttar Pradesh',
  'Nashik Mandi, Maharashtra',
  'Pune Market, Maharashtra',
  'Bangalore Market, Karnataka',
];
