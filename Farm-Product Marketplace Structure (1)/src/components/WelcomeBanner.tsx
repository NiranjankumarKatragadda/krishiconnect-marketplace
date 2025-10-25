import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';
import { listingsApi } from '../utils/api';
import { demoListings } from '../utils/seedData';
import { toast } from 'sonner';

export function WelcomeBanner() {
  const [show, setShow] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Show banner only for new suppliers
    if (user && profile?.role === 'supplier') {
      checkIfNeedsDemo();
    }
  }, [user, profile]);

  const checkIfNeedsDemo = async () => {
    try {
      const { listings } = await listingsApi.getSupplierListings(user!.id);
      if (listings.length === 0) {
        setShow(true);
      }
    } catch (error) {
      console.error('Failed to check listings:', error);
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      // Create 2 demo listings for the supplier
      for (let i = 0; i < 2; i++) {
        await listingsApi.create(demoListings[i]);
      }
      toast.success('Demo listings created! Refresh the page to see them.');
      setShow(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create demo listings');
    } finally {
      setSeeding(false);
    }
  };

  if (!show) return null;

  return (
    <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-gray-900 mb-2">Welcome to KrishiConnect! 🎉</h3>
            <p className="text-gray-700 mb-4">
              Get started by creating your first listing, or try our demo to see how it works.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="bg-green-600 hover:bg-green-700"
              >
                {seeding ? 'Creating...' : 'Create Demo Listings'}
              </Button>
              <Button variant="outline" onClick={() => setShow(false)}>
                I'll Create My Own
              </Button>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
