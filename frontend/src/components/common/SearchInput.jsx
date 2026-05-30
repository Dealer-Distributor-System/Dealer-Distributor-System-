import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { useDebounce } from '../../hooks/useDebounce';

const SearchInput = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      searchProducts();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      const allProducts = res.data || res || [];
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (productId) => {
    setQuery('');
    setShowDropdown(false);
    navigate(`/products/${productId}`);
  };

  return (
    <div className="relative w-full max-w-md hidden md:block" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-surface/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-surface transition-all outline-none"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setShowDropdown(true)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        ) : query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-text-muted" />
          </button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-surface-hover transition-colors text-left"
              >
                <img
                  src={product.image_url || 'https://via.placeholder.com/40'}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-surface-hover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{product.name}</p>
                  <p className="text-xs text-text-muted truncate">₹{product.price}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="bg-surface-hover px-4 py-2 border-t border-border">
            <button
              className="text-xs font-medium text-primary hover:text-primary-light transition-colors"
              onClick={() => {
                setShowDropdown(false);
                navigate(`/products?q=${query}`);
              }}
            >
              View all results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
