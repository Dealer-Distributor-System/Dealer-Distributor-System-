import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';

const CartPage = () => {
  const { cartItems, loading, cartTotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size="xl" />
        <p className="text-text-light mt-4">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-text mb-4">Your Cart is Empty</h1>
        <p className="text-text-light mb-8 max-w-md mx-auto">
          Looks like you haven't added any products to your cart yet. Browse our catalog to find what you need.
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-text tracking-tight mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                
                {/* Product Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-[var(--radius-soft)] overflow-hidden shrink-0">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/200x200?text=Product'} 
                    alt={item.name}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 text-center sm:text-left w-full">
                  <h3 className="font-semibold text-lg text-text mb-2 line-clamp-1">
                    <Link to={`/products/${item.product_id || item.id}`} className="hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </h3>
                  <div className="text-lg font-bold text-primary mb-4">
                    ₹{item.price}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center border border-gray-200 rounded-[var(--radius-soft)] bg-surface overflow-hidden w-fit">
                      <button 
                        className="px-3 py-1.5 text-text-light hover:text-text hover:bg-gray-50 transition-colors disabled:opacity-50"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        readOnly
                        className="w-12 text-center py-1.5 focus:outline-none font-medium text-text text-sm"
                      />
                      <button 
                        className="px-3 py-1.5 text-text-light hover:text-text hover:bg-gray-50 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-danger hover:text-red-700 flex items-center text-sm font-medium transition-colors p-2 rounded-md hover:bg-danger/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" /> Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="hidden sm:block text-right shrink-0 min-w-[120px]">
                  <p className="text-sm text-text-light mb-1">Subtotal</p>
                  <p className="text-lg font-bold text-text">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="sticky top-24 border border-gray-100 shadow-soft-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-text mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text-light">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-medium text-text">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-light">
                  <span>Shipping</span>
                  <span className="text-success font-medium">Calculated at Checkout</span>
                </div>
                <div className="flex justify-between text-text-light">
                  <span>Taxes</span>
                  <span className="font-medium text-text">Calculated at Checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-text">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-primary">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="w-full h-12 text-base shadow-lg shadow-primary/20"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="mt-6 text-center">
                <Link to="/products" className="text-sm font-medium text-primary hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
