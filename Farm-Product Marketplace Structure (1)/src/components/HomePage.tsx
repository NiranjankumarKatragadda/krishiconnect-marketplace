import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, TrendingUp, Users, Shield, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { listingsApi } from "../utils/api";

interface HomePageProps {
  onNavigate: (page: string, listingId?: string) => void;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function HomePage({ onNavigate, onOpenAuth }: HomePageProps) {
  const [listings, setListings] = useState<any>([]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { listings: data } = await listingsApi.getAll({ status: 'published' });
      setListings(data || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-green-900 mb-4">
              India's Transparent Farm Marketplace
            </h1>
            <p className="text-green-800 mb-8">
              Connect directly with verified suppliers. Compare prices with government mandi rates. 
              Fair commission. Zero middleman markup.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2 max-w-2xl mx-auto">
              <Input
                placeholder="Search crop, mandi, or location..."
                className="border-0 shadow-none"
              />
              <Button
                onClick={() => onNavigate('market')}
                className="bg-green-600 hover:bg-green-700 flex-shrink-0"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-gray-600">Popular:</span>
              {['Rice', 'Wheat', 'Tomato', 'Onion'].map((crop) => (
                <Button
                  key={crop}
                  onClick={() => onNavigate('market')}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  {crop}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">1. List or Browse</h3>
              <p className="text-gray-600">
                Suppliers list produce. Buyers search with real-time mandi rate comparison.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">2. Negotiate & Connect</h3>
              <p className="text-gray-600">
                Direct chat. Transparent pricing. See govt rates side-by-side.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">3. Close the Deal</h3>
              <p className="text-gray-600">
                Verified sellers. Small commission. Rate both parties. Build trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900">Featured Listings</h2>
            <Button
              variant="outline"
              onClick={() => onNavigate('market')}
              className="gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.slice(0, 3).map((listing) => (
              <Card
                key={listing.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('product', listing.id)}
              >
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={listing.images[0]} 
                    alt={listing.crop}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-gray-900">{listing.crop}</h3>
                      <p className="text-gray-600">{listing.mandi}</p>
                    </div>
                    {listing.supplierVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-green-900">₹{listing.pricePerUnit}</span>
                    <span className="text-gray-500">per {listing.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    {listing.quantity} {listing.unit} available
                    Grade {listing.grade}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Ready to Start Trading?</h2>
          <p className="text-green-50 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and buyers who trust KrishiConnect for fair, transparent trade.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onOpenAuth('signup', 'supplier')}
            >
              I'm a Supplier
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-green-600 hover:bg-green-50"
              onClick={() => onNavigate('supplier-dashboard')}
            >
              <Plus className="h-5 w-5 mr-2" />
              List Your Crops
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-green-600"
              onClick={() => onOpenAuth('signup', 'buyer')}
            >
              I'm a Buyer
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
