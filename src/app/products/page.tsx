"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts, getProductsByCategory, searchProducts, getCategories, getBrands, Product } from "@/services/clientApi";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { FaStar, FaShoppingCart, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import Heart from "@/components/HeartSimple";
import { useTranslation } from "react-i18next";

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Context
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let externalProducts: Product[] = [];
      let localProducts: Product[] = [];

      // Read hidden product IDs set by admin dashboard
      const hiddenIds: string[] = (() => {
        try {
          const data = localStorage.getItem("admin_hidden_products");
          return data ? JSON.parse(data) : [];
        } catch { return []; }
      })();

      // Fetch local Alnaseej products
      try {
        const localRes = await fetch('/api/admin/products', { cache: 'no-store' });
        const localData = await localRes.json();
        localProducts = (localData.data || []).map((p: any) => ({
          ...p,
          isLocal: true,
          category: typeof p.category === 'string'
            ? { _id: p.category, name: 'Alnaseej', image: '' }
            : p.category,
          brand: typeof p.brand === 'string'
            ? { _id: p.brand, name: 'النزيج', image: '' }
            : p.brand,
        }));
      } catch (e) {
        console.warn('Could not fetch local products');
      }

      // Fetch external API products
      try {
        let response;
        if (searchQuery) {
          response = await searchProducts(searchQuery);
        } else if (selectedCategory) {
          response = await getProductsByCategory(selectedCategory);
        } else {
          response = await getProducts();
        }
        externalProducts = response.data || [];
      } catch (e) {
        console.warn('Could not fetch external products');
      }

      // Merge: local first, then external — filter out admin-hidden products
      const merged = localProducts;
      setProducts(merged);
      setTotalResults(merged.length);
      setDisplayedProducts(20);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await getBrands();
      setBrands(response.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      window.location.href = "/login";
      return;
    }
    
    try {
      console.log('ProductsPage: handleAddToCart called', { productId });
      await addToCart(productId);
      console.log('ProductsPage: Product added to cart successfully');
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-primary/80 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = 'Product added to cart successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };


  const handleLoadMore = () => {
    setDisplayedProducts(prev => prev + 20);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSortBy("");
    setPriceRange({ min: "", max: "" });
  };

  const visibleProducts = products.slice(0, displayedProducts);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a3a3a] mb-2">{t('home.categories')}</h1>
          <p className="text-gray-500 font-medium">{totalResults} {i18n.language === 'ar' ? 'منتج' : 'products found'}</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] p-8 mb-12 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#6f1e3d] transition-colors" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6f1e3d]/20 transition-all text-gray-700"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 px-6 py-4 bg-[#6f1e3d] text-white rounded-2xl hover:bg-[#8d2a4e] transition-all shadow-lg shadow-[#6f1e3d]/20 font-bold"
            >
              <FaFilter className="text-sm" />
              <span>Filter & Sort</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#6f1e3d]/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#6f1e3d]/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#6f1e3d]/20 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="">Default</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="title">Name: A to Z</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      className="w-1/2 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#6f1e3d]/20"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      className="w-1/2 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#6f1e3d]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={clearFilters} className="text-sm font-bold text-gray-400 hover:text-[#6f1e3d] transition-colors underline underline-offset-4 decoration-gray-200 hover:decoration-[#6f1e3d]/30">
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {loading ? (
            Array(8).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-[2.5rem] shadow-sm p-6 animate-pulse">
                <div className="bg-gray-200 h-64 rounded-[2rem] mb-6"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mx-auto mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
              </div>
            ))
          ) : (
            visibleProducts.map((product: any) => (
              <div
                key={product._id}
                className="group relative flex flex-col bg-white rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)] cursor-pointer overflow-hidden border border-gray-100"
                onClick={() => window.location.href = `/products/${product._id}`}
              >
                {/* Product Image */}
                <div className="relative h-80 w-full overflow-hidden p-3 pb-0">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                    <img
                      src={product.imageCover || '/placeholder.svg'}
                      alt={i18n.language === 'ar' ? product.title : (product.titleEn || product.title)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Alnaseej Badge */}
                    {product.isLocal && (
                      <div className="absolute top-4 right-4 bg-[#c5a059] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                        {i18n.language === 'ar' ? 'النزيج' : 'Alnaseej'}
                      </div>
                    )}

                    {/* Discount Badge */}
                    {product.priceAfterDiscount && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg">
                        -{Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)}%
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <div className="absolute bottom-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                      <Heart
                        productId={product._id}
                        className="bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-white transition-colors"
                        size="md"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 text-center space-y-2.5">
                  <h3 className="text-base font-black text-[#1a3a3a] line-clamp-2 group-hover:text-[#c5a059] transition-colors duration-300 leading-snug">
                    {i18n.language === 'ar' ? product.title : (product.titleEn || product.title)}
                  </h3>

                  {/* Stars */}
                  {product.ratingsAverage && (
                    <div className="flex items-center justify-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <FaStar
                          key={star}
                          className={`text-xs ${
                            star <= Math.round(product.ratingsAverage)
                              ? 'text-[#c5a059]'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({product.ratingsQuantity || 0})</span>
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xl font-black text-[#1a3a3a]">
                      {(product.priceAfterDiscount || product.price).toLocaleString()}
                      <span className="text-xs font-bold text-gray-400 ml-1">{t('common.egp')}</span>
                    </span>
                    {product.priceAfterDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.price.toLocaleString()} {t('common.egp')}
                      </span>
                    )}
                  </div>

                  {/* Details Button */}
                  <div className="pt-1">
                    <button className="w-full bg-[#1a3a3a] text-white py-3.5 px-6 rounded-2xl text-sm font-black hover:bg-[#c5a059] transition-all duration-300 shadow-lg shadow-[#1a3a3a]/10 active:scale-95">
                      {i18n.language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {products.length > displayedProducts && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              className="bg-[#1a3a3a] hover:bg-[#c5a059] text-white px-10 py-4 rounded-2xl font-black transition-all duration-300 shadow-lg flex items-center gap-3 mx-auto"
            >
              {i18n.language === 'ar' ? 'تحميل المزيد' : 'Load More'}
              <FaSort className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

