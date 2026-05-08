"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts, getProductsByCategory, searchProducts, Product, getCategories, Category } from "@/services/clientApi";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { FaStar, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Slider from "@/components/Slider";
import SearchBar from "@/components/SearchBar";
import CategoriesBar from "@/components/CategoriesBar";
import Heart from "@/components/HeartSimple";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleWishlistUpdate = () => {
      setDisplayedProducts(prev => prev);
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Read hidden product IDs set by admin
      const hiddenIds: string[] = (() => {
        try {
          const data = localStorage.getItem("admin_hidden_products");
          return data ? JSON.parse(data) : [];
        } catch { return []; }
      })();

      let localProducts: Product[] = [];

      // Local products
      try {
        const localRes = await fetch('/api/admin/products', { cache: 'no-store' });
        const localData = await localRes.json();
        localProducts = (localData.data || []).map((p: any) => ({
          ...p, isLocal: true,
          category: typeof p.category === 'string' ? { _id: p.category, name: 'Watani', image: '' } : p.category,
          brand: typeof p.brand === 'string' ? { _id: p.brand, name: 'وطني', image: '' } : p.brand,
        })).filter((p: any) => !hiddenIds.includes(p._id));
      } catch { }

      // Always save all products for the featured section
      setAllProducts(localProducts);

      // Filter by selected category if one is chosen
      let filtered = localProducts;
      if (selectedCategory) {
        filtered = localProducts.filter((p: any) => {
          const catId = typeof p.category === 'object' ? p.category?._id : p.category;
          return catId === selectedCategory;
        });
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter((p: any) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory !== null) {
      fetchProducts();
    }
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#1a3a3a] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = t('home.addedToCart');
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        alert(t('home.authRequired'));
        window.location.href = "/login";
      } else {
        alert(t('home.failedToAddToCart'));
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedProducts(prev => prev + 20);
      setLoadingMore(false);
    }, 500);
  };

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-6">
        <Slider />
      </section>

      <section className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      <CategoriesBar
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-400 font-medium tracking-widest uppercase text-xs mb-3">{t('home.findStyle')}</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a3a3a] mb-4">{t('home.categories')}</h2>
            <div className="w-20 h-1.5 bg-[#e6c35f] mx-auto rounded-full"></div>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-[2.5rem] shadow-sm p-6 animate-pulse">
                  <div className="bg-gray-200 h-72 rounded-[2rem] mb-6"></div>
                  <div className="bg-gray-200 h-8 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('home.noCategories')}</h3>
              <p className="text-gray-500">{t('home.checkBackLater')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  className="group relative flex flex-col bg-white rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] cursor-pointer overflow-hidden"
                >
                  <div className="relative h-80 w-full overflow-hidden p-3 pb-0">
                    <div className="w-full h-full rounded-[2rem] overflow-hidden relative group">
                      <img
                        src={category.image || '/placeholder-image.jpg'}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-8 text-center bg-white">
                    <h3 className="text-2xl font-black text-[#1a3a3a] tracking-tight group-hover:text-[#6f1e3d] transition-colors duration-300">
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Section - shows filtered products */}
      {(selectedCategory !== null || searchQuery) && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-[#1a3a3a]">
                {selectedCategory
                  ? categories.find(c => c._id === selectedCategory)?.name || t('home.categories')
                  : `${t('common.search')}: ${searchQuery}`}
              </h2>
              <button
                onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
                className="text-sm text-gray-400 hover:text-[#6f1e3d] font-bold transition-colors"
              >
                ✕ مسح الفلتر
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-500">لا توجد منتجات في هذه الفئة</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, displayedProducts).map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.imageCover || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                      <div className="absolute top-2 right-2">
                        <Heart productId={product._id} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#1a3a3a] text-sm line-clamp-2 mb-2 group-hover:text-[#6f1e3d] transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        <FaStar className="text-[#e6c35f] text-xs" />
                        <span className="text-xs text-gray-500">{product.ratingsAverage || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#1a3a3a]">{product.price} {t('common.egp')}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                          className="bg-[#1a3a3a] text-white p-2 rounded-lg hover:bg-[#6f1e3d] transition-colors"
                        >
                          <FaShoppingCart className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== Combined Premium Section (Featured Products & CTA) ===== */}
      <div className="bg-white pb-20">
        <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="overflow-hidden rounded-[2.5rem] shadow-2xl">
          {/* Part 1: Featured Products (Dark) */}
          <div className="py-24 bg-[#1a202c] text-white">
            <div className="max-w-6xl mx-auto px-6">

              {/* Header */}
              <div className="text-center mb-16 space-y-4">
                <span className="inline-block bg-[#2c5e5e] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  وصل حديثاً
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">اكتشف أحدث منتجاتنا</h2>
                <p className="text-gray-400 font-medium">اكتشف أحدث صيحات الموضة</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-72 bg-white/5 rounded-[1.5rem] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                    {allProducts.slice(0, 7).map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="group relative h-72 rounded-[1.5rem] overflow-hidden cursor-pointer bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-500"
                      >
                        <img
                          src={product.imageCover || '/placeholder.svg'}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Hover Info Overlay */}
                        <div className="absolute bottom-5 left-5 right-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <p className="text-[10px] font-bold text-[#e6c35f] mb-1 uppercase tracking-widest">
                            {typeof product.category === 'object' ? product.category?.name : 'وطني'}
                          </p>
                          <h3 className="text-base font-black leading-tight line-clamp-1">{product.title}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-black text-white/90">{product.price} ر.ع</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                              className="w-8 h-8 bg-[#c5a059] hover:bg-[#e6c35f] rounded-full flex items-center justify-center transition-colors"
                            >
                              <FaShoppingCart className="text-[10px] text-[#1a202c]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Button */}
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/products')}
                      className="inline-flex items-center gap-3 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-10 py-4 rounded-full font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 group"
                    >
                      عرض جميع المنتجات
                      <span className="text-lg group-hover:translate-x-1 transition-transform">←</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Part 2: Start Your Journey (Teal) */}
          <div className="py-28 bg-[#2c5e5e] text-white relative">
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <div className="space-y-12">
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 bg-white/10 px-6 py-1.5 rounded-full text-[11px] font-bold tracking-widest border border-white/20 uppercase">
                    جاهز للتسوق <FaShoppingCart className="text-[#e6c35f] text-xs" />
                  </span>
                </div>

                <div className="space-y-6">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none">ابدأ رحلتك</h2>
                  <p className="text-white/60 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                    اكتشف منتجات رائعة وعروض حصرية تناسب ذوقك الرفيع
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full sm:w-auto bg-[#c5a059] hover:bg-[#b08d4a] text-white px-12 py-3.5 rounded-full font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-3 order-1 sm:order-2"
                  >
                    <FaShoppingCart className="text-sm" />
                    ابدأ التسوق
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full sm:w-auto border border-white/40 bg-transparent hover:bg-white/5 text-white px-12 py-3.5 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-3 order-2 sm:order-1"
                  >
                    <FaUserCircle className="text-lg" />
                    إنشاء حساب
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>


    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('home.loading')}</h2>
          <p className="text-gray-600">{t('home.pleaseWait')}</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
