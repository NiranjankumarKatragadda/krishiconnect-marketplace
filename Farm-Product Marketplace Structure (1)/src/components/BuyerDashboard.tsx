import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ordersApi, watchlistApi, usersApi } from '../utils/api';
import { ShoppingCart, Heart, Bell, TrendingUp, Eye, MessageSquare, Star, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BuyerDashboardProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function BuyerDashboard({ onNavigate, onOpenAuth }: BuyerDashboardProps) {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      onOpenAuth('login', 'buyer');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [ordersRes, watchlistRes] = await Promise.all([
        ordersApi.getAll(),
        watchlistApi.getAll(),
      ]);
      
      setOrders(ordersRes.orders || []);
      setWatchlist(watchlistRes.items || []);
      
      // Get saved suppliers from watchlist
      const supplierItems = watchlistRes.items?.filter((item: any) => item.type === 'supplier') || [];
      setSavedSuppliers(supplierItems);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    const colors: any = {
      inquiry: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    try {
      await watchlistApi.remove(id);
      setWatchlist(watchlist.filter(item => item.id !== id));
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleViewOrder = (orderId: string) => {
    // Navigate to order details
    toast.info('Order details coming soon');
  };

  const myOrders = orders.filter(order => order.buyerId === user?.id);
  const totalSpent = myOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const completedOrders = myOrders.filter(order => order.status === 'delivered').length;

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Buyer Dashboard</h1>
          <p className="text-gray-600">Manage your orders, watchlist, and preferences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Orders</p>
                  <p className="text-gray-900">{myOrders.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Completed Orders</p>
                  <p className="text-gray-900">{completedOrders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Watchlist Items</p>
                  <p className="text-gray-900">{watchlist.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Spent</p>
                  <p className="text-gray-900">₹{totalSpent.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                <TabsTrigger value="suppliers">Saved Suppliers</TabsTrigger>
                <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-6">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {myOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Button onClick={() => onNavigate('market')}>Browse Market</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-gray-900">{order.crop}</h3>
                                <Badge className={getOrderStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-600">
                                <div>
                                  <p className="mb-1">Quantity</p>
                                  <p className="text-gray-900">{order.quantity} {order.unit}</p>
                                </div>
                                <div>
                                  <p className="mb-1">Unit Price</p>
                                  <p className="text-gray-900">₹{order.unitPrice}</p>
                                </div>
                                <div>
                                  <p className="mb-1">Total Amount</p>
                                  <p className="text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="mb-1">Order Date</p>
                                  <p className="text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {order.message && (
                                <p className="mt-3 text-gray-600 italic">"{order.message}"</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Chat coming soon')}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Watchlist Tab */}
              <TabsContent value="watchlist" className="mt-6">
                {watchlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No items in watchlist</p>
                    <Button onClick={() => onNavigate('market')}>Browse Market</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchlist.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-gray-900 mb-2">{item.crop || item.type}</h3>
                              <div className="flex gap-4 text-gray-600">
                                {item.mandi && <span>Mandi: {item.mandi}</span>}
                                {item.targetPrice && (
                                  <span>Target Price: ₹{item.targetPrice}</span>
                                )}
                              </div>
                              <p className="text-gray-500 mt-2">
                                Added: {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromWatchlist(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Saved Suppliers Tab */}
              <TabsContent value="suppliers" className="mt-6">
                {savedSuppliers.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No saved suppliers</p>
                    <Button onClick={() => onNavigate('market')}>Browse Market</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedSuppliers.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-gray-900 mb-2">Supplier #{item.itemId?.slice(0, 8)}</h3>
                              <p className="text-gray-600">Saved {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromWatchlist(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Inquiries Tab */}
              <TabsContent value="inquiries" className="mt-6">
                {myOrders.filter(o => o.status === 'inquiry').length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending inquiries</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders
                      .filter(o => o.status === 'inquiry')
                      .map((order) => (
                        <Card key={order.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-gray-900 mb-2">{order.crop}</h3>
                                <p className="text-gray-600">
                                  {order.quantity} {order.unit} @ ₹{order.unitPrice}/{order.unit}
                                </p>
                                <p className="text-gray-500 mt-2">
                                  Sent: {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Chat coming soon')}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Follow Up
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
