import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Loader } from '../ui/Loader';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ limit: 10 });
        const data = response.data || response || [];
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products for slider', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-text-light font-medium animate-pulse">Curating featured collection...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show anything if no products
  }

  return (
    <div className="relative group px-4 sm:px-12">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={{
          prevEl: '.swiper-prev',
          nextEl: '.swiper-next',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          el: '.swiper-pagination-custom'
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="pb-16"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Card className="group/card border-border hover:border-primary/50 hover:shadow-xl transition-all duration-500 overflow-hidden h-full flex flex-col">
              <div className="aspect-[4/5] relative overflow-hidden bg-surface-hover">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec4?q=80&w=800&auto=format&fit=crop'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4">
                  {product.stock > 0 ? (
                    <Badge className="bg-success/90 backdrop-blur-md text-white border-none shadow-lg font-bold">In Stock</Badge>
                  ) : (
                    <Badge variant="danger" className="shadow-lg">Out of Stock</Badge>
                  )}
                </div>

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
                  <Link to={`/products/${product.id}`} className="w-full">
                    <Button className="w-full bg-surface text-primary hover:bg-surface-hover border border-primary/50 hover:scale-105 transition-all shadow-2xl font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> View Details
                    </Button>
                  </Link>
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                  {product.category_name || 'Premium Series'}
                </p>
                <h3 className="text-lg font-bold text-text mb-2 line-clamp-1 group-hover/card:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-text-light line-clamp-2 mb-4 flex-1">
                  {product.description || 'High-performance piping solution designed for modern infrastructure needs.'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted font-medium uppercase tracking-tighter">Price</span>
                    <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">₹{product.price}</span>
                  </div>
                  <Link to={`/products/${product.id}`} className="p-2 bg-primary/10 rounded-lg text-text-light hover:text-primary hover:bg-primary/20 transition-all hover:scale-110">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <button className="swiper-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-surface border border-border rounded-full shadow-lg flex items-center justify-center text-text-light hover:text-primary hover:border-primary hover:scale-110 transition-all disabled:opacity-0 hidden lg:flex">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button className="swiper-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-surface border border-border rounded-full shadow-lg flex items-center justify-center text-text-light hover:text-primary hover:border-primary hover:scale-110 transition-all disabled:opacity-0 hidden lg:flex">
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom flex justify-center mt-8 gap-2 h-2"></div>
    </div>
  );
};

export default ProductSlider;
