import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  MapPin, 
  Star, 
  Calendar, 
  Package, 
  TrendingDown, 
  TrendingUp, 
  MessageCircle,
  Phone,
  ShieldCheck
} from "lucide-react";
import { listingsApi, mandiRatesApi, ordersApi } from "../utils/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ProductDetailProps {
  listingId: string;
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function ProductDetail({ listingId, onNavigate, onOpenAuth }: ProductDetailProps) {
  const [listing, setListing] = useState<any>(null);
  const [mandiRates, setMandiRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    quantity: '',
    message: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [listingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingRes, ratesRes] = await Promise.all([
        listingsApi.getById(listingId),
        mandiRatesApi.getAll()
      ]);
      
      setListing(listingRes.listing);
      setMandiRates(ratesRes.rates || []);
    } catch (error: any) {
      toast.error('Failed to load listing');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInquiry = async () => {
    if (!user) {
      toast.error('Please login to create an inquiry');
      onOpenAuth('login', 'buyer');
      return;
    }

    if (!inquiryData.quantity) {
      toast.error('Please enter quantity');
      return;
    }

    try {
      await ordersApi.create({
        listingId: listing.id,
        quantity: parseInt(inquiryData.quantity),
        message: inquiryData.message,
      });
      
      toast.success('Inquiry sent successfully! The supplier will contact you soon.');
      setShowInquiry(false);
      setInquiryData({ quantity: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send inquiry');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Listing not found</p>
          <Button onClick={() => onNavigate('market')}>Back to Market</Button>
        </div>
      </div>
    );
  }

  // Find matching mandi rate
  const cropName = listing.crop.split('(')[0].trim();
  const matchingRate = mandiRates.find((r: any) => 
    r.crop.toLowerCase().includes(cropName.toLowerCase()) &&
    listing.mandi.includes(r.mandi)
  );

  const priceDifference = matchingRate 
    ? ((listing.pricePerUnit - matchingRate.govtRate) / matchingRate.govtRate) * 100
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => onNavigate('market')}
          className="mb-6"
        >
          ← Back to Market
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card>
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={listing.images[0]} 
                  alt={listing.crop}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-gray-900 mb-2">{listing.crop}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.mandi}</span>
                    </div>
                  </div>
                  {listing.certification && (
                    <Badge className="bg-blue-600">{listing.certification}</Badge>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6">{listing.description}</p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Available Quantity</p>
                      <p className="text-gray-900">{listing.quantity} {listing.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Harvest Date</p>
                      <p className="text-gray-900">{new Date(listing.harvestDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Packaging</p>
                      <p className="text-gray-900">{listing.packaging}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Star className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="text-gray-900">{listing.grade}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Government Rate Comparison */}
            {matchingRate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Government Mandi Rate Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Official rate from AGMARKNET • {new Date(matchingRate.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-gray-900">Govt. Rate:</span>
                      <span className="text-green-900">₹{matchingRate.govtRate}/quintal</span>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">This Listing</p>
                      <p className="text-gray-900">₹{listing.pricePerUnit}/{listing.unit}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Difference</p>
                      <div className={`flex items-center gap-1 ${
                        priceDifference !== null && priceDifference < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {priceDifference !== null && priceDifference < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span className="text-gray-900">
                          {priceDifference !== null ? `${Math.abs(priceDifference).toFixed(1)}%` : 'N/A'}
                          {priceDifference !== null && priceDifference < 0 ? ' below' : ' above'} govt. rate
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Price per {listing.unit}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-green-900">₹{listing.pricePerUnit}</span>
                    {matchingRate && priceDifference !== null && priceDifference < 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Below govt. rate
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => setShowInquiry(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Inquiry
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setShowInquiry(true)}
                  >
                    <Phone className="h-4 w-4" />
                    Request Quote
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  3% platform commission applies on confirmed orders
                </p>
              </CardContent>
            </Card>

            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">{listing.supplierName}</p>
                    <p className="text-sm text-gray-600">{listing.supplierLocation}</p>
                  </div>
                  {listing.supplierVerified && (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-gray-900">{listing.supplierRating} / 5</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant="secondary" className={
                    listing.supplierVerified 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }>
                    {listing.supplierVerified ? 'KYC Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                
                <Separator />
                
                <Button variant="outline" className="w-full">
                  View Supplier Profile
                </Button>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-blue-900 mb-1">Buyer Protection</p>
                    <p className="text-xs text-blue-700">
                      All transactions monitored. Dispute resolution available. Rate your experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={showInquiry} onOpenChange={setShowInquiry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Inquiry to Supplier</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Product: {listing.crop}</p>
              <p className="text-sm text-gray-600">Available: {listing.quantity} {listing.unit}</p>
              <p className="text-sm text-gray-600">Price: ₹{listing.pricePerUnit}/{listing.unit}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity ({listing.unit}) *</Label>
              <Input
                id="quantity"
                type="number"
                value={inquiryData.quantity}
                onChange={(e) => setInquiryData({ ...inquiryData, quantity: e.target.value })}
                placeholder={`Max: ${listing.quantity}`}
                max={listing.quantity}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={inquiryData.message}
                onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                placeholder="Add any specific requirements or questions..."
                rows={3}
              />
            </div>
            
            {inquiryData.quantity && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  Estimated Total: ₹{(parseFloat(inquiryData.quantity) * listing.pricePerUnit).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  (Final price subject to negotiation with supplier)
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={handleCreateInquiry}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Send Inquiry
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowInquiry(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
