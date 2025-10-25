import { useState, useEffect } from "react";
import { AuthProvider } from "./components/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MandiRateTicker } from "./components/MandiRateTicker";
import { HomePage } from "./components/HomePage";
import { MarketPage } from "./components/MarketPage";
import { ProductDetail } from "./components/ProductDetail";
import { SupplierDashboard } from "./components/SupplierDashboard";
import { BuyerDashboard } from "./components/BuyerDashboard";
import { RateBoard } from "./components/RateBoard";
import { ChatSystem } from "./components/ChatSystem";
import { AdminPanel } from "./components/AdminPanel";
import { NotificationCenter } from "./components/NotificationCenter";
import { UserProfile } from "./components/UserProfile";
import { AboutUs, HowItWorks, FAQ, ContactUs, TermsAndConditions, PrivacyPolicy, RefundPolicy } from "./components/StaticPages";
import { Toaster } from "./components/ui/sonner";
import { mandiRatesApi } from "./utils/api";

type Page = 'home' | 'market' | 'product' | 'rates' | 'supplier-dashboard' | 'buyer-dashboard' 
  | 'chat' | 'admin' | 'notifications' | 'profile' | 'about' | 'how-it-works' | 'faq' 
  | 'contact' | 'terms' | 'privacy' | 'refund';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<'supplier' | 'buyer' | undefined>();

  useEffect(() => {
    // Seed mandi rates on first load
    seedMandiRates();
  }, []);

  const seedMandiRates = async () => {
    try {
      await mandiRatesApi.seedRates();
    } catch (error) {
      // Rates might already exist, that's fine
    }
  };

  const handleNavigate = (page: string, listingId?: string) => {
    setCurrentPage(page as Page);
    if (listingId) {
      setSelectedListingId(listingId);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => {
    setAuthMode(mode);
    setAuthRole(role);
    setShowAuth(true);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header onNavigate={handleNavigate} currentPage={currentPage} onOpenAuth={handleOpenAuth} />
        <MandiRateTicker />
        
        <div className="flex-1">
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'market' && <MarketPage onNavigate={handleNavigate} />}
          {currentPage === 'product' && <ProductDetail listingId={selectedListingId} onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'supplier-dashboard' && <SupplierDashboard onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'buyer-dashboard' && <BuyerDashboard onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'rates' && <RateBoard />}
          {currentPage === 'chat' && <ChatSystem onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'admin' && <AdminPanel onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'notifications' && <NotificationCenter onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />}
          {currentPage === 'profile' && <UserProfile userId={selectedUserId} onNavigate={handleNavigate} />}
          {currentPage === 'about' && <AboutUs />}
          {currentPage === 'how-it-works' && <HowItWorks />}
          {currentPage === 'faq' && <FAQ />}
          {currentPage === 'contact' && <ContactUs />}
          {currentPage === 'terms' && <TermsAndConditions />}
          {currentPage === 'privacy' && <PrivacyPolicy />}
          {currentPage === 'refund' && <RefundPolicy />}
        </div>
        
        <Footer onNavigate={handleNavigate} />
        
        <AuthModal 
          open={showAuth} 
          onClose={() => setShowAuth(false)}
          defaultMode={authMode}
          defaultRole={authRole}
        />
        
        <Toaster />
      </div>
    </AuthProvider>
  );
}