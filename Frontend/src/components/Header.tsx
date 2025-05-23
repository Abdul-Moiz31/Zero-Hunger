import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Menu, X, ChevronDown, Heart, Users, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WelcomePopup from './WelcomePopup';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (isHomePage) {
        const sections = ['about', 'how-it-works', 'impact', 'partners', 'testimonials', 'contact'];
        const current = sections.find(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        setActiveSection(current || '');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const UserMenu = () => (
    <div className="relative">
      <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 focus:outline-none">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-lg font-semibold text-green-600">{user?.name?.charAt(0) || ''}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
      </button>

      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
          <div className="px-4 py-2 border-b">
            <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-600">{user?.email || ''}</p>
          </div>
          <button
            onClick={() => navigate(`/${user.role}-dashboard`)}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Dashboard 
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`fixed w-full z-40 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className={`rounded-full p-2.5 transition-all duration-300 group-hover:scale-110 ${
                isScrolled || !isHomePage ? 'bg-green-100' : 'bg-white'
              }`}>
                <UtensilsCrossed className="w-8 h-8 text-green-600" />
              </div>
              <span className={`text-2xl font-bold transition-all duration-300 ${
                isScrolled || !isHomePage ? 'text-gray-800' : 'text-white'
              }`}>Zero Hunger</span>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-gray-800' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-gray-800' : 'text-white'}`} />
              )}
            </button>

            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="/listings" isScrolled={isScrolled || !isHomePage} isActive={location.pathname === '/listings'}>Listings</NavLink>
              {isHomePage && (
                <>
                  <NavLink href="#about" isScrolled={isScrolled} isActive={activeSection === 'about'}>About Us</NavLink>
                  <NavLink href="#impact" isScrolled={isScrolled} isActive={activeSection === 'impact'}>Our Impact</NavLink>
                  <NavLink href="#how-it-works" isScrolled={isScrolled} isActive={activeSection === 'how-it-works'}>How It Works</NavLink>
                  <NavLink href="#partners" isScrolled={isScrolled} isActive={activeSection === 'partners'}>Partners</NavLink>
                  <NavLink href="#testimonials" isScrolled={isScrolled} isActive={activeSection === 'testimonials'}>Testimonials</NavLink>
                  <NavLink href="#contact" isScrolled={isScrolled} isActive={activeSection === 'contact'}>Contact</NavLink>
                </>
              )}
              {user ? <UserMenu /> : (
                <button 
                  onClick={() => navigate('/auth')} 
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
                    isScrolled || !isHomePage
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-white text-green-600 hover:bg-green-50'
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-fadeIn">
              <div className="flex flex-col space-y-4">
                <MobileNavLink href="/listings" isScrolled={isScrolled || !isHomePage} setIsMenuOpen={setIsMenuOpen}>Listings</MobileNavLink>
                {isHomePage && (
                  <>
                    <MobileNavLink href="#about" isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen}>About Us</MobileNavLink>
                    <MobileNavLink href="#impact" isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen}>Our Impact</MobileNavLink>
                    <MobileNavLink href="#how-it-works" isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen}>How It Works</MobileNavLink>
                    <MobileNavLink href="#partners" isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen}>Partners</MobileNavLink>
                    <MobileNavLink href="#testimonials" isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen}>Testimonials</MobileNavLink>
                    <MobileNavLink href="#contact" isScrolled={isScrolled} setIsMenuOpen={setIsMenuOpen}>Contact</MobileNavLink>
                  </>
                )}
                 {user ? (
                  <>
                    <button 
                      onClick={() => navigate(`/${user.role}-dashboard`)}
                      className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-500 transition-all duration-300"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-500 transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => navigate('/auth')} 
                    className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-500 transition-all duration-300"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />} */}
      
      {isHomePage && showWelcomePopup && (
        <div className="relative min-h-screen">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-fixed"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)'
              }}
            ></div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-green-900/90 to-green-800/85"></div>
            
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '20px 20px'
              }}
            ></div>
          </div>

          <div className="relative container mx-auto px-6 pt-40 pb-24">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-12 animate-fadeInUp">
                <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
                  Making a Difference Together
                </span>
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                  Creating a World
                  <br />
                  <span className="bg-gradient-to-r from-green-300 to-emerald-300 text-transparent bg-clip-text">
                    Without Hunger
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed">
                  Join our mission to build a sustainable food ecosystem where
                  <br className="hidden md:block" />
                  every meal shared creates a better tomorrow.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fadeInUp animate-delay-100">
                <StatsCard 
                  icon={Heart} 
                  number="100K+" 
                  label="Meals Shared"
                  description="Making a difference daily"
                  delay="0"
                />
                <StatsCard 
                  icon={Building2} 
                  number="50+" 
                  label="Partner NGOs"
                  description="Working together for change"
                  delay="100"
                />
                <StatsCard 
                  icon={Users} 
                  number="1000+" 
                  label="Active Volunteers"
                  description="Heroes making it happen"
                  delay="200"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-6 animate-fadeInUp animate-delay-200">
                <ActionButton onClick={() => navigate('/auth')} primary>
                  Start Donating
                </ActionButton>
                <ActionButton onClick={() => navigate('/auth')}>
                  Volunteer With Us
                </ActionButton>
                <ActionButton onClick={() => navigate('/auth')}>
                  NGO Partnership
                </ActionButton>
              </div>

              <div className="mt-20">
                <a 
                  href="#about"
                  className="inline-block text-white/80 hover:text-white transition-colors animate-bounce"
                  aria-label="Scroll to About section"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-sm font-medium">Learn More</span>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHomePage && showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
    </>
  );
};

const NavLink = ({ 
  href, 
  children, 
  isScrolled,
  isActive 
}: { 
  href: string; 
  children: React.ReactNode; 
  isScrolled: boolean;
  isActive: boolean;
}) => {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className={`relative py-2 transition-colors ${
        isScrolled 
          ? isActive ? 'text-green-600' : 'text-gray-700 hover:text-green-600' 
          : 'text-white hover:text-green-200'
      }`}
    >
      {children}
      <span className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300 ${
        isActive ? 'scale-x-100' : 'scale-x-0'
      } ${isScrolled ? 'bg-green-600' : 'bg-white'}`}></span>
    </a>
  );
};

const MobileNavLink = ({ href, children, isScrolled, setIsMenuOpen }: { href: string; children: React.ReactNode; isScrolled: boolean; setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  return (
    <a 
      href={href}
      onClick={handleClick}
      className={`py-2 px-4 rounded-lg transition-colors ${
        isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
      }`}
    >
      {children}
    </a>
  );
};

const StatsCard = ({ 
  icon: Icon, 
  number, 
  label,
  description,
  delay 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  number: string;
  label: string;
  description: string;
  delay: string;
}) => (
  <div 
    className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/10"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-3xl font-bold mb-2">{number}</p>
    <p className="font-medium mb-1">{label}</p>
    <p className="text-sm text-white/80">{description}</p>
  </div>
);

const ActionButton = ({ 
  children, 
  onClick, 
  primary 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
  primary?: boolean;
}) => (
  <button 
    onClick={onClick} 
    className={`group px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
      primary
        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400'
        : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
    }`}
  >
    <span className="flex items-center justify-center space-x-2">
      {children}
      <ChevronDown className="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
    </span>
  </button>
);

export default Header;