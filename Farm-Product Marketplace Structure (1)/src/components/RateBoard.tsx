import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { mandiRatesApi } from '../utils/api';
import { Search, TrendingUp, TrendingDown, Download, Bell, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

export function RateBoard() {
  const [rates, setRates] = useState<any[]>([]);
  const [filteredRates, setFilteredRates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    filterRates();
  }, [rates, searchQuery, selectedCrop, selectedState]);

  const loadRates = async () => {
    try {
      setLoading(true);
      const { rates: ratesData } = await mandiRatesApi.getAll();
      setRates(ratesData || []);
    } catch (error) {
      console.error('Failed to load rates:', error);
      toast.error('Failed to load mandi rates');
    } finally {
      setLoading(false);
    }
  };

  const filterRates = () => {
    let filtered = [...rates];

    if (searchQuery) {
      filtered = filtered.filter(
        (rate) =>
          rate.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rate.mandi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCrop !== 'all') {
      filtered = filtered.filter((rate) => rate.crop === selectedCrop);
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter((rate) => rate.state === selectedState);
    }

    setFilteredRates(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Crop', 'Mandi', 'State', 'Rate (₹)', 'Change (%)', 'Date'];
    const csvData = filteredRates.map((rate) => [
      rate.crop,
      rate.mandi,
      rate.state,
      rate.govtRate,
      rate.change,
      rate.date,
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandi-rates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Rates exported successfully');
  };

  const setupAlert = () => {
    toast.success('Rate alert feature coming soon!');
  };

  const uniqueCrops = Array.from(new Set(rates.map((r) => r.crop)));
  const uniqueStates = Array.from(new Set(rates.map((r) => r.state)));

  // Generate mock historical data for charts
  const generateHistoricalData = (crop: string) => {
    const days = 7;
    const baseRate = rates.find((r) => r.crop === crop)?.govtRate || 2000;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: baseRate + (Math.random() - 0.5) * baseRate * 0.1,
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mandi rates...</p>
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
          <h1 className="text-gray-900 mb-2">Government Mandi Rates</h1>
          <p className="text-gray-600">Live market prices from government mandis across India</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search crop or mandi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {uniqueCrops.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={setupAlert}>
                <Bell className="h-4 w-4 mr-2" />
                Setup Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="current">Current Rates</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Current Rates Table */}
          <TabsContent value="current" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Mandi Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crop</TableHead>
                      <TableHead>Mandi</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Rate (₹/Quintal)</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No rates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell>{rate.crop}</TableCell>
                          <TableCell>{rate.mandi}</TableCell>
                          <TableCell>{rate.state}</TableCell>
                          <TableCell>₹{rate.govtRate.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {rate.change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : rate.change < 0 ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span
                                className={
                                  rate.change > 0
                                    ? 'text-green-600'
                                    : rate.change < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }
                              >
                                {rate.change > 0 ? '+' : ''}
                                {rate.change}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(rate.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Trends Charts */}
          <TabsContent value="trends" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {uniqueCrops.slice(0, 4).map((crop) => {
                const historicalData = generateHistoricalData(crop);
                return (
                  <Card key={crop}>
                    <CardHeader>
                      <CardTitle>{crop} - 7 Day Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#16a34a"
                            strokeWidth={2}
                            name="Rate (₹)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Price Comparison */}
          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mandi Comparison - Same Crop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {uniqueCrops.slice(0, 3).map((crop) => {
                    const cropRates = rates.filter((r) => r.crop === crop);
                    const maxRate = Math.max(...cropRates.map((r) => r.govtRate));
                    const minRate = Math.min(...cropRates.map((r) => r.govtRate));

                    return (
                      <div key={crop}>
                        <h3 className="text-gray-900 mb-4">{crop}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {cropRates.map((rate) => (
                            <Card key={rate.id} className="relative overflow-hidden">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-gray-900">{rate.mandi}</p>
                                    <p className="text-gray-500">{rate.state}</p>
                                  </div>
                                  {rate.govtRate === maxRate && (
                                    <Badge className="bg-green-100 text-green-800">Highest</Badge>
                                  )}
                                  {rate.govtRate === minRate && (
                                    <Badge className="bg-blue-100 text-blue-800">Lowest</Badge>
                                  )}
                                </div>
                                <p className="text-gray-900 mt-2">₹{rate.govtRate.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {rate.change > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                  ) : rate.change < 0 ? (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                  ) : null}
                                  <span
                                    className={
                                      rate.change > 0
                                        ? 'text-green-600'
                                        : rate.change < 0
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }
                                  >
                                    {rate.change > 0 ? '+' : ''}
                                    {rate.change}%
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
