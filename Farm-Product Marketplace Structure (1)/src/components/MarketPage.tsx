import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { cropOptions, mandiOptions } from "../data/mockData";
import { listingsApi } from "../utils/api";
import { toast } from "sonner";

interface MarketPageProps {
  onNavigate: (page: string, listingId?: string) => void;
}

export function MarketPage({ onNavigate }: MarketPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [selectedMandi, setSelectedMandi] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [selectedCrop, selectedMandi, selectedGrade]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const filters: any = { status: 'published' };
      if (selectedCrop !== 'all') filters.crop = selectedCrop;
      if (selectedMandi !== 'all') filters.mandi = selectedMandi;
      if (selectedGrade !== 'all') filters.grade = selectedGrade;
      
      const { listings: data } = await listingsApi.getAll(filters);
      setListings(data || []);
    } catch (error: any) {
      toast.error('Failed to load listings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = 
      searchQuery === "" ||
      listing.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.supplierLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search crop, mandi, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Crops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
          </p>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading listings...</p>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card 
              key={listing.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate('product', listing.id)}
            >
              <div className="aspect-video overflow-hidden rounded-t-lg relative">
                <img 
                  src={listing.images[0]} 
                  alt={listing.crop}
                  className="w-full h-full object-cover"
                />
                {listing.certification && (
                  <Badge className="absolute top-3 right-3 bg-blue-600">
                    {listing.certification}
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{listing.crop}</h3>
                    <p className="text-gray-600 text-sm">{listing.mandi}</p>
                  </div>
                  {listing.supplierVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 flex-shrink-0">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-green-900">₹{listing.pricePerUnit}</span>
                  <span className="text-gray-500">per {listing.unit}</span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available</span>
                    <span className="text-gray-900">{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Grade</span>
                    <span className="text-gray-900">{listing.grade}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Packaging</span>
                    <span className="text-gray-900">{listing.packaging}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{listing.supplierRating}</span>
                    </div>
                    <span className="text-sm text-gray-600">{listing.supplierLocation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
        
        {!loading && filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No listings found matching your criteria.</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCrop("all");
                setSelectedMandi("all");
                setSelectedGrade("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
