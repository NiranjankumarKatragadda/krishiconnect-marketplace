import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { adminApi, disputesApi } from '../utils/api';
import { Users, FileText, AlertCircle, DollarSign, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function AdminPanel({ onNavigate, onOpenAuth }: AdminPanelProps) {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      onOpenAuth('login');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, loading]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [usersRes, listingsRes, disputesRes, analyticsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAllListings(),
        disputesApi.getAll(),
        adminApi.getAnalytics(),
      ]);
      
      setUsers(usersRes.users || []);
      setListings(listingsRes.listings || []);
      setDisputes(disputesRes.disputes || []);
      setAnalytics(analyticsRes.analytics || {});
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      if (error.message?.includes('Forbidden')) {
        toast.error('Access denied: Admin privileges required');
        onNavigate('home');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, updates: any) => {
    try {
      await adminApi.updateUser(userId, updates);
      toast.success('User updated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleResolveDispute = async (disputeId: string, status: string) => {
    try {
      await disputesApi.update(disputeId, { status });
      toast.success('Dispute updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update dispute');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { month: 'Jan', users: 45, orders: 120, revenue: 450000 },
    { month: 'Feb', users: 52, orders: 145, revenue: 520000 },
    { month: 'Mar', users: 61, orders: 168, revenue: 610000 },
    { month: 'Apr', users: 78, orders: 195, revenue: 780000 },
    { month: 'May', users: 85, orders: 220, revenue: 850000 },
    { month: 'Jun', users: 92, orders: 245, revenue: 920000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, listings, and platform operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Users</p>
                  <p className="text-gray-900">{analytics?.totalUsers || 0}</p>
                  <p className="text-gray-500 mt-1">
                    {analytics?.totalSuppliers || 0} suppliers, {analytics?.totalBuyers || 0} buyers
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Listings</p>
                  <p className="text-gray-900">{analytics?.totalListings || 0}</p>
                  <p className="text-gray-500 mt-1">{analytics?.activeListings || 0} active</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Orders</p>
                  <p className="text-gray-900">{analytics?.totalOrders || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-gray-900">₹{(analytics?.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#16a34a" name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#16a34a" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analytics?.recentOrders || []).slice(0, 10).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.slice(0, 12)}...</TableCell>
                        <TableCell>{order.crop}</TableCell>
                        <TableCell>{order.quantity} {order.unit}</TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge>{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {u.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>{u.rating?.toFixed(1) || '0.0'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateUserStatus(u.id, { verified: !u.verified })}
                            >
                              {u.verified ? 'Unverify' : 'Verify'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateUserStatus(u.id, { status: u.status === 'suspended' ? 'active' : 'suspended' })}
                            >
                              {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crop</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.slice(0, 20).map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>{listing.crop}</TableCell>
                        <TableCell>{listing.supplierName}</TableCell>
                        <TableCell>{listing.quantity} {listing.unit}</TableCell>
                        <TableCell>₹{listing.pricePerUnit}</TableCell>
                        <TableCell>
                          <Badge>{listing.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('product', listing.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No disputes to resolve</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <Card key={dispute.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-gray-900">{dispute.reason}</h3>
                                <Badge className={
                                  dispute.status === 'open'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : dispute.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }>
                                  {dispute.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{dispute.description}</p>
                              <div className="text-gray-500">
                                <p>Raised by: {dispute.raisedByName}</p>
                                <p>Order ID: {dispute.orderId}</p>
                                <p>Date: {new Date(dispute.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            {dispute.status === 'open' && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolveDispute(dispute.id, 'resolved')}
                                >
                                  Resolve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolveDispute(dispute.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
