import { useState } from 'react';
import type { CartItem } from './data/products';
import LoginForm from './components/LoginForm';
import POSDashboard from './components/POSDashboard';
import Checkout from './components/Checkout';

type View = 'dashboard' | 'checkout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [checkoutCart, setCheckoutCart] = useState<CartItem[]>([]);

  const handleCheckout = (cart: CartItem[]) => {
    setCheckoutCart(cart);
    setView('checkout');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  const handleOrderComplete = () => {
    setCheckoutCart([]);
    setView('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  if (view === 'checkout') {
    return (
      <Checkout
        cart={checkoutCart}
        onBack={handleBackToDashboard}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  return <POSDashboard onCheckout={handleCheckout} />;
}

export default App;
