import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State from URL
  const page = parseInt(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';

  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, selectedCategory, sortBy, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts({ 
        page, 
        limit: 12,
        category: selectedCategory,
        q: searchQuery,
        sort: sortBy,
        min: minPrice,
        max: maxPrice
      });
      setProducts(res.data || []);
      setPagination({ total: res.total, pages: res.pages });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-text tracking-tight mb-2">Our Products</h1>
        <p className="text-text-light text-lg">Browse our premium infrastructure materials and supplies.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Min" 
                    type="number" 
                    className="h-10"
                    value={minPrice}
                    onChange={(e) => updateFilters({ min: e.target.value })}
                  />
                  <span className="text-gray-400">-</span>
                  <Input 
                    placeholder="Max" 
                    type="number" 
                    className="h-10"
                    value={maxPrice}
                    onChange={(e) => updateFilters({ max: e.target.value })}
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="stock">In Stock First</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSearchParams({})}
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 relative">
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => updateFilters({ q: e.target.value })}
              className="pl-10 h-12 rounded-xl shadow-sm"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader size="lg" />
              <p className="text-text-light mt-4">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-danger/5 rounded-xl border border-danger/20">
              <p className="text-danger font-medium mb-4">{error}</p>
              <Button onClick={fetchProducts} variant="outline">Try Again</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">No products found</h3>
              <p className="text-text-light mb-6">We couldn't find any products matching your current filters.</p>
              <Button onClick={() => setSearchParams({})} variant="outline">Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const isAvailable = product.is_available === 1 && product.stock > 0;
                  return (
                    <Card key={product.id} className="group flex flex-col h-full hover:shadow-soft-lg hover:border-primary/30 transition-all duration-300">
                      <Link to={`/products/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden rounded-t-[var(--radius-soft-lg)]">
                        <img 
                          src={product.image_url || 'https://via.placeholder.com/400x400?text=Product'} 
                          alt={product.name}
                          loading="lazy"
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isAvailable && 'grayscale opacity-70'}`}
                        />
                        {isAvailable ? (
                          <Badge variant="success" className="absolute top-3 right-3 shadow-sm backdrop-blur-md bg-success/90 text-white border-none">In Stock</Badge>
                        ) : (
                          <Badge variant="danger" className="absolute top-3 right-3 shadow-sm backdrop-blur-md bg-danger/90 text-white border-none">Out of Stock</Badge>
                        )}
                      </Link>
                      <CardContent className="flex-1 flex flex-col p-5">
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-semibold text-lg text-text line-clamp-1 mb-1 group-hover:text-primary transition-colors" title={product.name}>
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-text-light line-clamp-2 mb-4 flex-1">
                          {product.description || 'No description available for this product.'}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <span className="text-xl font-bold text-text">₹{product.price}</span>
                          <Link to={`/products/${product.id}`}>
                            <Button variant={isAvailable ? 'primary' : 'ghost'} size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1 
                            ? 'bg-primary text-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
