import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { WelcomeBanner } from "./WelcomeBanner";
import { 
  Plus, 
  Package, 
  MessageCircle, 
  TrendingUp, 
  Upload,
  Edit,
  Trash2,
  Eye,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cropOptions, gradeOptions, unitOptions, mandiOptions } from "../data/mockData";
import { listingsApi, ordersApi } from "../utils/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface SupplierDashboardProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function SupplierDashboard({ onNavigate, onOpenAuth }: SupplierDashboardProps) {
  const { user, profile } = useAuth();
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListing, setNewListing] = useState({
    crop: "",
    grade: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    mandi: "",
    packaging: "",
    harvestDate: "",
    description: "",
    images: [],
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, ordersRes] = await Promise.all([
        listingsApi.getSupplierListings(user!.id),
        ordersApi.getAll()
      ]);
      
      setListings(listingsRes.listings || []);
      setOrders(ordersRes.orders || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    // Validation
    if (!newListing.crop || !newListing.quantity || !newListing.pricePerUnit || !newListing.mandi) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await listingsApi.create(newListing);
      toast.success("Listing created successfully!");
      setShowCreateListing(false);
      setNewListing({
        crop: "",
        grade: "",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
        mandi: "",
        packaging: "",
        harvestDate: "",
        description: "",
        images: [],
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create listing");
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await listingsApi.delete(id);
      toast.success("Listing deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete listing");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-2">Supplier Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Please login as a supplier to access the dashboard.
            </p>
            <Button 
              onClick={() => onOpenAuth('login', 'supplier')}
              className="bg-green-600 hover:bg-green-700"
            >
              Login as Supplier
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.role !== 'supplier') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              This dashboard is only accessible to suppliers.
            </p>
            <Button 
              onClick={() => onNavigate('market')}
              variant="outline"
            >
              Browse Market Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Supplier Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile?.name || user.email}</p>
          </div>
          <Button 
            onClick={() => setShowCreateListing(!showCreateListing)}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        </div>

        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Active Listings</p>
                  <p className="text-gray-900">{listings.filter(l => l.status === 'published').length}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Pending Inquiries</p>
                  <p className="text-gray-900">{orders.filter(o => o.status === 'inquiry').length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Sales</p>
                  <p className="text-gray-900">₹6.95L</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={profile?.verified ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={profile?.verified ? "text-green-800 mb-1" : "text-yellow-800 mb-1"}>Verification</p>
                  <Badge className={profile?.verified ? "bg-green-600" : "bg-yellow-600"}>
                    {profile?.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <ShieldCheck className={`h-8 w-8 ${profile?.verified ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Listing Form */}
        {showCreateListing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="crop">Crop *</Label>
                  <Select value={newListing.crop} onValueChange={(value) => setNewListing({...newListing, crop: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropOptions.map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={newListing.grade} onValueChange={(value) => setNewListing({...newListing, grade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={newListing.quantity}
                    onChange={(e) => setNewListing({...newListing, quantity: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={newListing.unit} onValueChange={(value) => setNewListing({...newListing, unit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price per {newListing.unit} (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    value={newListing.pricePerUnit}
                    onChange={(e) => setNewListing({...newListing, pricePerUnit: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mandi">Mandi *</Label>
                  <Select value={newListing.mandi} onValueChange={(value) => setNewListing({...newListing, mandi: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mandi" />
                    </SelectTrigger>
                    <SelectContent>
                      {mandiOptions.map((mandi) => (
                        <SelectItem key={mandi} value={mandi}>{mandi}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging</Label>
                  <Input
                    id="packaging"
                    placeholder="e.g., 50kg bags"
                    value={newListing.packaging}
                    onChange={(e) => setNewListing({...newListing, packaging: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={newListing.harvestDate}
                    onChange={(e) => setNewListing({...newListing, harvestDate: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product, minimum order quantity, delivery terms, etc."
                    rows={4}
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 cursor-pointer transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={handleCreateListing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create Listing
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateListing(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders & Inquiries</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : listings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No listings yet. Create your first listing above!</p>
                ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">{listing.crop}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Qty: {listing.quantity} {listing.unit}</span>
                          <span>•</span>
                          <span>Price: ₹{listing.pricePerUnit}/{listing.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={listing.status === 'published' ? 'secondary' : 'outline'}>
                          {listing.status}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => onNavigate('product')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteListing(listing.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders & Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet.</p>
                ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">{order.crop}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Buyer: {order.buyerName}</span>
                          <span>•</span>
                          <span>Qty: {order.quantity} {order.unit}</span>
                          <span>•</span>
                          <span>₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary"
                          className={
                            order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            order.status === 'negotiation' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {order.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile?.verified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-900 mb-1">KYC Verified</p>
                    <p className="text-sm text-green-700">
                      Your account is verified. You can now create listings and receive inquiries.
                    </p>
                  </div>
                </div>
                ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 mb-1">Verification Pending</p>
                    <p className="text-sm text-yellow-700">
                      Your account is awaiting verification. Upload documents below to get verified.
                    </p>
                  </div>
                </div>
                )}
                
                <div className="space-y-3">
                  <h4 className="text-gray-900">Submitted Documents</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-900 mb-1">Farmer ID Card</p>
                      <Badge className="bg-green-600">Approved</Badge>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-gray-900 mb-1">Land Ownership Proof</p>
                      <Badge className="bg-green-600">Approved</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">Optional: Add More Credentials</p>
                    <p className="text-sm text-blue-700 mb-3">
                      Upload certifications (Organic, Export Quality, etc.) to boost buyer trust.
                    </p>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Certificate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
