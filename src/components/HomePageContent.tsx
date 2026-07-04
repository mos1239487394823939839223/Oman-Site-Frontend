"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, Category, getProducts, getCategories, getServices } from "@/services/clientApi";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";

interface Service {
  _id?: string;
  id?: string;
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
  active?: boolean;
}
import { FaStar, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Slider from "@/components/Slider";
import SearchBar from "@/components/SearchBar";
import CategoriesBar from "@/components/CategoriesBar";
import Heart from "@/components/Heart";
import { resolveMediaUrl } from "@/lib/media";
import { useAppSnackbar } from "@/components/mui/AppSnackbarProvider";

export default function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const { showSnackbar } = useAppSnackbar();
  // Match the language the rest of the page renders in (react-i18next),
  // not useLanguage() — the two can diverge and would show the wrong locale.
  const isArabic = i18n.language?.startsWith("ar");

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const response = await getProducts(Object.keys(params).length ? params : undefined);
      const allProds: Product[] = response.data || [];
      setAllProducts(allProds);
      setProducts(allProds);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    try {
      // Fetch with backend filter; also apply client-side filter as safety net
      // in case ApiFeatures doesn't cast string 'true' → boolean true
      const response = await getProducts({ bestSeller: 'true', limit: '100' });
      const all: Product[] = response.data || [];
      setRecommendedProducts(all.filter((p: any) => p.bestSeller === true));
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getServices();
      const list: Service[] = response?.data || response || [];
      setServices(Array.isArray(list) ? list.filter((s) => s.active !== false) : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBestSellers();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/`);
      return;
    }
    try {
      await addToCart(productId);
      showSnackbar(t("home.addedToCart"), "success");
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar(t("common.retry"), "error");
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <section className="max-w-7xl mx-auto px-4 py-6">
        <Slider />
      </section>


      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-[#6f1e3d] rounded-[1rem] py-1 px-3 md:px-4 shadow-2xl shadow-[#6f1e3d]/40 border border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col items-center gap-0">
            <div className="flex items-center gap-6">
              <div className="w-16 h-0.5 bg-[#D4AF37] rounded-full"></div>
              <span className="text-lg md:text-2xl font-black text-white uppercase tracking-[0.1em]">{t('home.categories')}</span>
              <div className="w-16 h-0.5 bg-[#D4AF37] rounded-full"></div>
            </div>
            <div className="w-full">
              <CategoriesBar
                onCategorySelect={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[300px] sm:h-[360px] lg:h-[450px] bg-gray-100 rounded-[2rem] sm:rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => router.push(`/products?category=${category._id}`)}
                  className="group relative h-[320px] sm:h-[400px] lg:h-[500px] bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[#5a1832]/10"
                >
                  <Image
                    src={resolveMediaUrl(category.image, "categories")}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5a1832] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-0 right-0 text-center px-6">
                    <h3 className="text-3xl font-black text-white !important mb-4 tracking-tighter" style={{ color: 'white' }}>{category.name}</h3>
                    <div className="inline-block h-1.5 w-12 bg-[#D4AF37] rounded-full group-hover:w-24 transition-all duration-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="bg-[#5a1832] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="text-center mb-8">
              <span className="bg-white/10 text-[#D4AF37] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block border border-white/10">{t('home.newCollection')}</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white !important mb-6" style={{ color: 'white' }}>{t('home.bestSellers')}</h2>
              <div className="w-24 h-2 bg-[#D4AF37] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedProducts.length > 0 ? (
                recommendedProducts.slice(0, 6).map((product) => (
                  <div
                    key={product._id}
                    onClick={() => router.push(`/products/${product._id}`)}
                    className="bg-white rounded-[2.5rem] p-6 shadow-xl group transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  >
                    <div className="relative h-52 sm:h-60 md:h-64 mb-6 rounded-3xl overflow-hidden bg-gray-50">
                      <Image
                        src={resolveMediaUrl(product.imageCover, "products")}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="absolute top-4 right-4 z-10">
                        <Heart productId={product._id} />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#5a1832]">{product.price?.toLocaleString()}</span>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="w-12 h-12 bg-[#5a1832] text-white rounded-2xl flex items-center justify-center hover:bg-[#D4AF37] transition-all active:scale-90"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="text-6xl mb-6 drop-shadow-lg">🔍</div>
                  <h3 className="text-3xl font-black mb-3 tracking-tighter" style={{ color: 'white' }}>{t('home.noProductsMatched')}</h3>
                  <p className="font-bold text-lg" style={{ color: 'white', opacity: 0.9 }}>{t('home.tryAnotherCategory')}</p>
                </div>
              )}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/products')}
                className="bg-white text-[#5a1832] px-10 sm:px-12 py-4 sm:py-5 rounded-full font-black text-lg hover:bg-[#D4AF37] transition-all shadow-xl active:scale-95"
              >
                {t('home.browseAllProducts')}
              </button>
            </div>
          </div>

          <div className="bg-[#D4AF37] p-10 sm:p-14 md:p-20 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-[#5a1832] mb-8 tracking-tighter">{t('home.startYourJourney')}</h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button onClick={() => router.push('/register')} className="bg-[#5a1832] text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-black text-lg sm:text-xl hover:bg-black transition-all shadow-2xl">{t('home.createNewAccount')}</button>
              <button onClick={() => router.push('/login')} className="bg-white/20 border-2 border-[#5a1832] text-[#5a1832] px-10 sm:px-12 py-4 sm:py-5 rounded-full font-black text-lg sm:text-xl hover:bg-white/40 transition-all">{t('home.signIn')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      {services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5a1832]">{t('home.ourServices')}</h2>
            <div className="w-24 h-2 bg-[#D4AF37] mx-auto rounded-full mt-6"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => {
              const title = isArabic ? (s.titleAr || s.title) : (s.title || s.titleAr);
              const desc = isArabic ? (s.descriptionAr || s.description) : (s.description || s.descriptionAr);
              return (
                <div
                  key={s._id || s.id || i}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                  {desc && <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
