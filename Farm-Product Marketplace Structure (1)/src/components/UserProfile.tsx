import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { usersApi, reviewsApi, listingsApi } from '../utils/api';
import { User, MapPin, Star, CheckCircle, Phone, Mail, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserProfileProps {
  userId: string;
  onNavigate: (page: string, id?: string) => void;
}

export function UserProfile({ userId, onNavigate }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userRes, reviewsRes, listingsRes] = await Promise.all([
        usersApi.getById(userId),
        reviewsApi.getForUser(userId),
        listingsApi.getSupplierListings(userId),
      ]);
      
      setUser(userRes.user);
      setReviews(reviewsRes.reviews || []);
      setListings(listingsRes.listings || []);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">User not found</p>
          <Button onClick={() => onNavigate('home')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-gray-900">{user.name}</h1>
                    {user.verified && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className="bg-green-100 text-green-800">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{user.rating?.toFixed(1) || '0.0'} ({reviews.length} reviews)</span>
                    </div>
                    {user.role === 'supplier' && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{listings.length} Active Listings</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue={user.role === 'supplier' ? 'listings' : 'reviews'}>
            <TabsList>
              {user.role === 'supplier' && <TabsTrigger value="listings">Listings</TabsTrigger>}
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            {user.role === 'supplier' && (
              <TabsContent value="listings" className="mt-6">
                {listings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active listings</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <Card
                        key={listing.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => onNavigate('product', listing.id)}
                      >
                        <CardContent className="pt-6">
                          <h3 className="text-gray-900 mb-2">{listing.crop}</h3>
                          <div className="space-y-2 text-gray-600">
                            <div className="flex justify-between">
                              <span>Grade:</span>
                              <span className="text-gray-900">{listing.grade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="text-gray-900">{listing.quantity} {listing.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="text-green-600">₹{listing.pricePerUnit}/{listing.unit}</span>
                            </div>
                          </div>
                          <Badge className="mt-3 bg-green-100 text-green-800">
                            {listing.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-gray-900 mb-1">{review.reviewerName}</h3>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <h3 className="text-gray-900 mb-2">Role</h3>
                      <p>{user.role === 'supplier' ? 'Agricultural Supplier' : 'Buyer'}</p>
                    </div>
                    {user.location && (
                      <div>
                        <h3 className="text-gray-900 mb-2">Location</h3>
                        <p>{user.location}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-gray-900 mb-2">Member Since</h3>
                      <p>{new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-2">Verification Status</h3>
                      <div className="flex items-center gap-2">
                        {user.verified ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-600">Verified User</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500">Not verified</span>
                          </>
                        )}
                      </div>
                    </div>
                    {user.role === 'supplier' && (
                      <>
                        <div>
                          <h3 className="text-gray-900 mb-2">Total Listings</h3>
                          <p>{listings.length} active listings</p>
                        </div>
                        <div>
                          <h3 className="text-gray-900 mb-2">Rating</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(user.rating || 0)
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span>{user.rating?.toFixed(1) || '0.0'} ({reviews.length} reviews)</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
