import { Button } from "./ui/button";
import { Leaf, User, Menu, LogOut, Bell, MessageSquare, ShoppingBag, BarChart, Shield, HelpCircle, FileText, X } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenAuth: (mode: 'login' | 'signup', role?: 'supplier' | 'buyer') => void;
}

export function Header({ onNavigate, currentPage, onOpenAuth }: HeaderProps) {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigate('home')}
          >
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-green-900">KrishiConnect</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={currentPage === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('market')}
              className={currentPage === 'market' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}
            >
              Market
            </button>
            <button
              onClick={() => onNavigate('rates')}
              className={currentPage === 'rates' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}
            >
              Rate Board
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-green-600">
                More
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onNavigate('about')}>About Us</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('how-it-works')}>How It Works</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('faq')}>FAQ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('contact')}>Contact Us</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('notifications')}
                  className="hidden md:flex"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                {/* Messages */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('chat')}
                  className="hidden md:flex"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {profile?.name || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {profile?.role === 'supplier' && (
                      <DropdownMenuItem onClick={() => onNavigate('supplier-dashboard')}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Supplier Dashboard
                      </DropdownMenuItem>
                    )}
                    {profile?.role === 'buyer' && (
                      <DropdownMenuItem onClick={() => onNavigate('buyer-dashboard')}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Buyer Dashboard
                      </DropdownMenuItem>
                    )}
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => onNavigate('admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onNavigate('notifications')}>
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('chat')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex items-center gap-2"
                  onClick={() => onOpenAuth('login')}
                >
                  <User className="h-4 w-4" />
                  Login
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 hidden md:flex"
                  onClick={() => onOpenAuth('signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavigate('home')}
                  >
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavigate('market')}
                  >
                    Market
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavigate('rates')}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Rate Board
                  </Button>
                  
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleNavigate('notifications')}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleNavigate('chat')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Button>
                      
                      {profile?.role === 'supplier' && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => handleNavigate('supplier-dashboard')}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Supplier Dashboard
                        </Button>
                      )}
                      {profile?.role === 'buyer' && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => handleNavigate('buyer-dashboard')}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Buyer Dashboard
                        </Button>
                      )}
                      {profile?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => handleNavigate('admin')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          onOpenAuth('login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 justify-start"
                        onClick={() => {
                          onOpenAuth('signup');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    <p className="text-gray-500 mb-2 px-2">Information</p>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate('about')}
                    >
                      About Us
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate('how-it-works')}
                    >
                      How It Works
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate('faq')}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      FAQ
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate('contact')}
                    >
                      Contact Us
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate('terms')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Terms & Conditions
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate('privacy')}
                    >
                      Privacy Policy
                    </Button>
                  </div>
                  
                  {user && (
                    <Button
                      variant="ghost"
                      className="justify-start text-red-600 mt-4"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}