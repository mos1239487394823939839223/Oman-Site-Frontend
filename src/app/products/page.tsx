"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts, getCategories, getSubCategories, Product, Category, Subcategory } from "@/services/clientApi";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import CategoriesBar from "@/components/CategoriesBar";
import { resolveMediaUrl } from "@/lib/media";
import { FaSort, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard";

type SubcategoryRef =
  | string
  | Array<string | { _id: string; name: string; image?: string }>
  | { _id: string; name: string; image?: string };

interface ExtendedProduct extends Product {
  // The API returns `subCategories` (plural array); keep `subcategory` as a
  // legacy fallback for any older shapes.
  subCategories?: SubcategoryRef;
  subcategory?: SubcategoryRef;
  patternType?: string;
  isLocal?: boolean;
}

interface SelectedCategoryViewProps {
  products: ExtendedProduct[];
  subCategories: Subcategory[];
  selectedCategory: string;
  selectedSubCategory?: string;
  categories: Category[];
  onProductClick: (id: string) => void;
  onSubCategoryClick: (name: string) => void;
}

function getSubcategoryId(subcategory: SubcategoryRef | undefined): string {
  if (!subcategory) return "";
  if (typeof subcategory === "string") return subcategory;
  if (Array.isArray(subcategory)) {
    const firstItem = subcategory[0];
    if (!firstItem) return "";
    return typeof firstItem === "string" ? firstItem : firstItem._id || "";
  }
  return subcategory._id || "";
}

// The product's subcategory arrives as `subCategories` (plural) from the API;
// fall back to the legacy `subcategory` key just in case.
function getProductSubId(p: ExtendedProduct): string {
  return getSubcategoryId(p.subCategories ?? p.subcategory);
}

function SelectedCategoryView({ 
  products, 
  subCategories, 
  selectedCategory, 
  selectedSubCategory, 
  categories, 
  onProductClick, 
  onSubCategoryClick 
}: SelectedCategoryViewProps) {
  const { i18n } = useTranslation();
  const catName = categories.find((c) => c._id === selectedCategory)?.name || 'القسم المختار';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getSubId = (p: ExtendedProduct): string => {
    return getProductSubId(p);
  };

  const filteredProducts = selectedSubCategory
    ? products.filter((p) => {
      const pSubId = getSubId(p);
      const subObj = subCategories.find(s => s._id === pSubId);
      return subObj?.name === selectedSubCategory;
    })
    : products;

  // All subcategories for this category
  const relatedSubs = subCategories.filter((sub) => {
    const subCatId = typeof sub.category === 'object' ? (sub.category as any)?._id : sub.category;
    return subCatId === selectedCategory;
  });

  const showArrows = relatedSubs.length + 1 > 10;

  // Grouping logic: First by Subcategory, then by Pattern Type
  const subGroups = relatedSubs.map(sub => {
    const subProducts = filteredProducts.filter(p => getSubId(p) === sub._id);

    // Group sub-products by pattern type
    const patterns = ["نقش رفيع", "نقش عريض"];
    const patternGroups = patterns.map(pType => ({
      name: pType,
      products: subProducts.filter(p => p.patternType === pType)
    })).filter(pg => pg.products.length > 0);

    const otherProducts = subProducts.filter(p => !patterns.includes(p.patternType || ''));

    return {
      sub,
      patternGroups,
      otherProducts,
      hasProducts: subProducts.length > 0
    };
  }).filter(sg => sg.hasProducts);

  // Products that are not in any of our subcategories
  const unclassified = filteredProducts.filter(p => {
    const pSubId = getSubId(p);
    return !relatedSubs.find(s => s._id === pSubId);
  });

  return (
    <>
      {/* Sleek, Premium & Compact Header Bar */}
      <div className="bg-[#6f1e3d] backdrop-blur-md rounded-2xl py-3 px-5 mb-6 border border-white/10 shadow-lg shadow-[#6f1e3d]/10 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 overflow-hidden relative">
        {/* Subtle Luxury Glow */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Title Section */}
        <div className="flex items-center gap-4 md:gap-6 z-10">
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-0.5">المنتجات</h1>
            <div className="flex items-center justify-end gap-1.5 text-[#D4AF37]">
              <span className="text-[11px] font-black uppercase tracking-wider">{products.length} تصميم</span>
              <div className="w-5 h-px bg-[#D4AF37]/40"></div>
            </div>
          </div>

          <div className="w-px h-10 bg-white/10 hidden md:block"></div>

          <div className="text-right">
            <h2 className="text-lg md:text-xl font-black text-white">{catName}</h2>
          </div>
        </div>

        {/* Visual Subcategory Filter with Navigation Arrows */}
        <div className="relative flex items-center z-10 w-full md:w-auto overflow-hidden bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
          {/* Scroll Right Button */}
          {showArrows && (
            <button
              onClick={() => handleScroll('right')}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#D4AF37] hover:text-white flex items-center justify-center transition-all duration-300 ml-1 border border-white/5 cursor-pointer"
              aria-label="Scroll Right"
            >
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth p-1 w-full justify-start"
          >
            <button
              onClick={() => onSubCategoryClick("")}
              className={`flex-shrink-0 flex flex-col items-center p-1.5 rounded-xl transition-all duration-300 group ${!selectedSubCategory
                ? 'bg-[#D4AF37] text-[#6f1e3d] shadow-md scale-105'
                : 'hover:bg-white/5 text-white/70 hover:scale-105'
                }`}
            >
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center mb-1 border transition-all duration-300 ${!selectedSubCategory
                ? 'border-[#6f1e3d] bg-white/10'
                : 'border-white/10 bg-white/5 group-hover:border-[#D4AF37]/50'
                }`}>
                <svg className={`w-5 h-5 md:w-6 md:h-6 ${!selectedSubCategory ? 'text-[#6f1e3d]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className={`text-[11px] md:text-xs font-black text-center transition-colors uppercase tracking-tight ${!selectedSubCategory ? 'text-[#6f1e3d]' : 'text-white/70'
                }`}>الكل</span>
            </button>

            {relatedSubs.map((sub) => (
              <button
                key={sub._id}
                onClick={() => onSubCategoryClick(sub.name)}
                className={`flex-shrink-0 flex flex-col items-center p-1.5 rounded-xl transition-all duration-300 group ${selectedSubCategory === sub.name
                  ? 'bg-[#D4AF37] text-[#6f1e3d] shadow-md scale-105'
                  : 'hover:bg-white/5 text-white/70 hover:scale-105'
                  }`}
              >
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden mb-1 border transition-all duration-300 ${selectedSubCategory === sub.name
                  ? 'border-[#6f1e3d]'
                  : 'border-white/10 bg-white/5 group-hover:border-[#D4AF37]/50'
                  }`}>
                  <img
                    src={resolveMediaUrl(sub.image, "subcategories")}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-[11px] md:text-xs font-black text-center transition-colors uppercase tracking-tight ${selectedSubCategory === sub.name ? 'text-[#6f1e3d]' : 'text-white/70'
                  }`}>{sub.name}</span>
              </button>
            ))}
          </div>

          {/* Scroll Left Button */}
          {showArrows && (
            <button
              onClick={() => handleScroll('left')}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#D4AF37] hover:text-white flex items-center justify-center transition-all duration-300 mr-1 border border-white/5 cursor-pointer"
              aria-label="Scroll Left"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#6f1e3d]/5 flex items-center justify-center text-4xl">🛍️</div>
          <h2 className="text-xl font-black text-[#6f1e3d]">لا توجد منتجات في هذا القسم حالياً</h2>
          <p className="text-gray-400 font-medium max-w-sm leading-relaxed text-sm">
            يمكنك اختيار قسم آخر من الأعلى لتصفح المنتجات المتوفرة.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Subcategory Groups */}
          {subGroups.map((group) => (
            <div key={group.sub._id} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center relative py-2">
                <div className="flex items-center justify-center gap-4 mb-1">
                  <div className="w-12 md:w-24 h-[1px] bg-gradient-to-l from-[#c5a059]/50 to-transparent"></div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#c5a059] tracking-wide">{group.sub.name}</h2>
                  <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-[#c5a059]/50 to-transparent"></div>
                </div>
                <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">مجموعة تصاميم {group.sub.name}</p>
              </div>

              {/* Pattern Sections (نقش رفيع / عريض) */}
              <div className="space-y-8 pr-1 md:pr-2">
                {group.patternGroups.map((patternGroup) => (
                  <div key={patternGroup.name} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                      <h3 className="text-base font-black text-gray-800">{patternGroup.name}</h3>
                      <span className="text-[9px] font-black bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                        {patternGroup.products.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                      {patternGroup.products.map((product) => (
                        <div key={product._id} onClick={() => onProductClick(product._id)} className="transition-all duration-300">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Other Products in Subcategory */}
                {group.otherProducts.length > 0 && (
                  <div className="space-y-4">
                    {group.patternGroups.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        <h3 className="text-base font-black text-gray-850">منتجات أخرى في {group.sub.name}</h3>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                      {group.otherProducts.map((product) => (
                        <div key={product._id} onClick={() => onProductClick(product._id)} className="transition-all duration-300">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unclassified products */}
      {unclassified.length > 0 && (
        <div className="space-y-6 mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-center relative py-2">
            <div className="flex items-center justify-center gap-4 mb-1">
              <div className="w-12 md:w-24 h-[1px] bg-gradient-to-l from-[#6f1e3d]/45 to-transparent"></div>
              <h2 className="text-xl md:text-2xl font-black text-[#6f1e3d]">{i18n.language === 'ar' ? 'منتجات إضافية' : 'Additional Products'}</h2>
              <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-[#6f1e3d]/45 to-transparent"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {unclassified.map((product) => (
              <div key={product._id} onClick={() => onProductClick(product._id)} className="transition-all duration-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ProductsPageContent() {
  const { i18n } = useTranslation();
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Subcategory[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize selectedCategory / selectedBrand from URL
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || "");
    setSelectedBrand(searchParams.get('brand') || "");
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedBrand]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { limit: "1000" };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (searchQuery) params.search = searchQuery;
      const response = await getProducts(params);
      let fetched: ExtendedProduct[] = response.data || [];

      // Apply subcategory filter client-side
      if (selectedSubCategory) {
        fetched = fetched.filter((p) => {
          const pSubId = getProductSubId(p);
          if (!pSubId) return false;
          const subObj = subCategories.find(s => s._id === pSubId);
          return subObj?.name === selectedSubCategory;
        });
      }

      setProducts(fetched);
      setDisplayedProducts(20);
    } catch (error) {
      console.error("Error fetching products:", error);
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
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await getSubCategories();
      setSubCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategories([]);
    }
  };

  const handleLoadMore = () => {
    setDisplayedProducts(prev => prev + 20);
  };

  const visibleProducts = products.slice(0, displayedProducts);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-6">
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Sleek Visual Categories Bar (Main Categories) - Maroon Theme */}
          <div className="bg-[#6f1e3d] rounded-2xl py-2 px-4 shadow-lg shadow-[#6f1e3d]/15 border border-white/5 relative overflow-hidden">
            {/* Subtle premium glow */}
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 blur-2xl rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="flex items-center gap-3 pt-1">
                <div className="w-6 h-[1px] bg-[#D4AF37]/40 rounded-full"></div>
                <span className="text-xs md:text-sm font-black text-white/95 uppercase tracking-widest">الأقسام التقليدية</span>
                <div className="w-6 h-[1px] bg-[#D4AF37]/40 rounded-full"></div>
              </div>
              <div className="w-full">
                <CategoriesBar
                  selectedCategory={selectedCategory}
                  onCategorySelect={(id) => {
                    if (id) {
                      setSelectedCategory(id);
                      setSelectedSubCategory(""); // Reset sub when parent changes
                    } else {
                      setSelectedCategory("");
                      setSelectedSubCategory("");
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-16">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm border border-gray-100">
                <div className="bg-gray-150 h-[200px] md:h-[260px] w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-150 h-2.5 rounded w-16 mx-auto"></div>
                  <div className="bg-gray-150 h-4 rounded w-3/4 mx-auto"></div>
                  <div className="bg-gray-150 h-3 rounded w-1/3 mx-auto"></div>
                  <div className="bg-gray-150 h-9 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedCategory ? (
          <SelectedCategoryView
            products={products}
            subCategories={subCategories}
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            categories={categories}
            onProductClick={(id) => router.push(`/products/${id}`)}
            onSubCategoryClick={(name) => setSelectedSubCategory(name)}
          />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="w-16 h-16 rounded-full bg-[#6f1e3d]/5 flex items-center justify-center text-4xl">🔍</div>
            <h2 className="text-xl font-black text-[#6f1e3d]">لا توجد نتائج</h2>
            <p className="text-gray-400 text-sm font-medium">حاول البحث بكلمة مختلفة أو تصفح جميع الأقسام.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-16">
            {visibleProducts.map((product: any) => (
              <div key={product._id} onClick={() => router.push(`/products/${product._id}`)} className="transition-all duration-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!selectedCategory && products.length > displayedProducts && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-[#6f1e3d] text-white hover:bg-[#5a1832] px-8 py-3 rounded-xl font-black transition-all duration-300 shadow-md flex items-center gap-2 mx-auto text-sm"
            >
              {i18n.language === 'ar' ? 'تحميل المزيد' : 'Load More'}
              <FaSort className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6f1e3d]"></div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

