import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { mandiRatesApi } from "../utils/api";

export function MandiRateTicker() {
  const [mandiRates, setMandiRates] = useState<any[]>([]);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const { rates } = await mandiRatesApi.getAll();
      setMandiRates(rates || []);
    } catch (error) {
      console.error('Failed to fetch mandi rates:', error);
    }
  };

  if (mandiRates.length === 0) return null;

  return (
    <div className="bg-green-50 border-y border-green-100 py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-900 flex-shrink-0">Live Govt. Mandi Rates:</span>
          <span className="text-gray-500 text-sm">Updated today</span>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {mandiRates.map((rate) => (
            <div key={rate.id} className="flex items-center gap-3 flex-shrink-0 bg-white px-4 py-2 rounded-lg border border-green-100">
              <div>
                <div className="text-gray-900">{rate.crop}</div>
                <div className="text-gray-500 text-sm">{rate.mandi}</div>
              </div>
              <div className="border-l border-gray-200 pl-3">
                <div className="text-green-900">₹{rate.govtRate}/{rate.crop === 'Wheat' || rate.crop === 'Rice' ? 'quintal' : 'kg'}</div>
                <div className={`flex items-center gap-1 text-sm ${
                  rate.change > 0 ? 'text-green-600' : rate.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {rate.change > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : rate.change < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {Math.abs(rate.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
