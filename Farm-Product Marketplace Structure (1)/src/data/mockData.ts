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
  { id: '1', crop: 'Wheat', mandi: 'Azadpur Mandi', state: 'Delhi', govtRate: 2125, date: '2025-10-19', change: 2.5 },
  { id: '2', crop: 'Rice', mandi: 'Karnal Mandi', state: 'Haryana', govtRate: 2850, date: '2025-10-19', change: -1.2 },
  { id: '3', crop: 'Tomato', mandi: 'Koyambedu Market', state: 'Tamil Nadu', govtRate: 18, date: '2025-10-19', change: 15.5 },
  { id: '4', crop: 'Onion',  mandi: 'Lasalgaon Mandi', state: 'Maharashtra', govtRate: 22, date: '2025-10-19', change: -8.3 },
  { id: '5', crop: 'Potato', mandi: 'Agra Mandi', state: 'Uttar Pradesh', govtRate: 12, date: '2025-10-19', change: 0 },
];
export const listings: Listing[] = [];
export const mockOrders: Order[] = [];
export const cropOptions = [
  // Cereals
  'Rice (Basmati)','Rice (Non-Basmati)','Parboiled Rice','Brown Rice','Black Rice','Red Rice','Ponni Rice','Sona Masoori Rice','Idli Rice','Sticky Rice',
  'Wheat','Durum Wheat','Emmer Wheat','Maize (Corn)','Sweet Corn','Popcorn Maize','Barley','Oats','Rye',
  'Sorghum (Jowar)','Pearl Millet (Bajra)','Finger Millet (Ragi)','Foxtail Millet','Little Millet','Kodo Millet','Barnyard Millet','Proso Millet',
  // Pulses
  'Toor Dal (Arhar)','Chana Dal','Urad Dal','Masoor Dal','Moong Dal','Whole Chana','Whole Urad','Whole Masoor','Whole Moong','Kabuli Chana','Desi Chana',
  'Rajma (Kidney Beans)','Lobia (Black-eyed Pea)','Matar (Dried Peas)','Horse Gram (Kulthi)','Green Lentil','Black Lentil','Red Lentil',
  // Oilseeds
  'Groundnut (Peanut)','Mustard Seed','Yellow Mustard','Soybean','Sesame (Til)','Sunflower Seed','Safflower Seed','Niger Seed','Castor Seed','Linseed (Flaxseed)',
  'Coconut (Copra)','Oil Palm Fruit','Cottonseed','Rapeseed','Canola',
  // Vegetables
  'Potato','Onion','Tomato','Garlic','Ginger','Green Chilli','Capsicum (Bell Pepper)','Brinjal (Eggplant)','Okra (Lady Finger)',
  'Cabbage','Cauliflower','Broccoli','Carrot','Beetroot','Radish','Cucumber','Bitter Gourd','Bottle Gourd','Ridge Gourd','Snake Gourd',
  'Pumpkin','Ash Gourd','Tinda','Drumstick (Moringa)','Turnip','Yam','Sweet Potato','Mushroom','Spinach','Amaranthus','Fenugreek Leaves',
  'Coriander Leaves','Mint Leaves','Curry Leaves','Lettuce','Spring Onion','Leek','Celery','Green Peas','French Beans','Cluster Beans (Guar)',
  'Ivy Gourd (Tindora)','Kohlrabi','Zucchini','Sweet Corn (Fresh)','Baby Corn',
  // Fruits
  'Mango','Banana','Apple','Orange','Sweet Lime (Mosambi)','Lemon','Pomegranate','Grapes','Watermelon','Muskmelon','Papaya','Guava','Pineapple','Sapota (Chikoo)',
  'Lychee','Pear','Plum','Peach','Apricot','Fig','Jamun (Java Plum)','Custard Apple (Sitaphal)','Avocado','Strawberry','Blueberry','Raspberry','Blackberry',
  'Dragon Fruit','Kiwi','Starfruit','Passion Fruit','Dates','Tender Coconut',
  // Spices
  'Turmeric (Raw)','Turmeric (Dry Finger)','Chilli (Dry)','Black Pepper','White Pepper','Cardamom (Green)','Cardamom (Black)','Cumin (Jeera)','Coriander Seed (Dhania)',
  'Fennel (Saunf)','Fenugreek Seed (Methi)','Mustard (Rai/Sarson)','Clove','Cinnamon','Cassia','Nutmeg','Mace','Bay Leaf','Asafoetida (Hing)','Carom Seed (Ajwain)',
  'Poppy Seed (Khus Khus)','Star Anise','Nigella (Kalonji)','Turmeric Powder','Chili Powder','Garam Masala Mix',
  // Cash Crops
  'Cotton','Sugarcane','Tobacco','Jute','Kenaf','Hemp','Betel Leaf','Arecanut (Supari)',
  // Plantation Crops
  'Tea (Green)','Tea (CTC/Black)','Coffee (Arabica)','Coffee (Robusta)','Cocoa','Rubber','Coconut','Areca Palm',
  // Flowers
  'Marigold','Rose','Jasmine','Tuberose (Rajnigandha)','Chrysanthemum','Gerbera','Carnation','Orchid','Lotus','Sunflower (Cut Flower)',
  // Animal Products and Allied
  'Milk','Ghee','Butter','Paneer','Curd','Skimmed Milk Powder','Eggs','Honey','Beeswax','Silk Cocoons','Raw Silk','Wool','Hides & Skins',
  'Fresh Fish','Dried Fish','Prawns/Shrimp','Crab','Chicken (Broiler)','Country Chicken','Mutton (Goat)','Chevon','Buffalo Meat',
  // Other farm products
  'Sugar (Raw)','Jaggery (Gur)','Molasses','Palm Sugar','Cane Jaggery','Vermicompost','Farmyard Manure','Organic Compost','Cocopeat','Coir Fiber',
  'Bamboo','Neem Seed','Neem Cake','Turmeric Rhizome Seed','Potato Seed (Tuber)','Onion Seed','Vegetable Seed Packets','Fruit Saplings','Timber (Teak/Eucalyptus)'
];
export const gradeOptions = ['Grade A', 'Grade B', 'Premium', 'Standard'];
export const unitOptions = ['kg', 'quintal', 'ton', 'crate', 'box'];
export const mandiOptions = [
  'Azadpur Mandi, Delhi','Okhla Sabzi Mandi, Delhi','Karnal Mandi, Haryana','Kurukshetra Mandi, Haryana','Hisar Mandi, Haryana',
  'Lasalgaon APMC (Onion), Maharashtra','Nashik APMC, Maharashtra','Pune APMC (Gultekdi), Maharashtra','Vashi APMC (Navi Mumbai), Maharashtra',
  'Koyambedu Market, Tamil Nadu','Salem Mandi, Tamil Nadu','Madurai Market, Tamil Nadu',
  'Ahmedabad Jamalpur Market, Gujarat','Rajkot APMC, Gujarat','Surat APMC, Gujarat','Unjha APMC (Jeera), Gujarat',
  'Ludhiana Mandi, Punjab','Amritsar Mandi, Punjab','Moga Mandi, Punjab',
  'Agra Mandi, Uttar Pradesh','Kanpur Mandi, Uttar Pradesh','Varanasi Mandi, Uttar Pradesh','Lucknow Mandi, Uttar Pradesh'
];
