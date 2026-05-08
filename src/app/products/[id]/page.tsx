"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getProduct, Product } from "@/services/clientApi";
import { FaStar, FaShoppingCart, FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";
import Heart from "@/components/Heart";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useWishlist } from "@/components/WishlistProvider";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Context hooks
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const result = await getProduct(params.id as string);
        const productData = result.data;
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < (product?.quantity || 1)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      window.location.href = "/login";
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product._id, quantity);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = 'Product added to cart successfully! 🛒';
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
    } finally {
      setIsAddingToCart(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 aspect-square rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-6 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
              <div className="bg-gray-200 h-12 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  const allImages = [product.imageCover, ...(product.images || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={allImages[selectedImage]}
              alt={product.title}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                console.error('Image load error:', e);
                // Fallback to placeholder
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {/* Wishlist Button */}
            {product && (
              <Heart 
                productId={product._id}
                className="absolute top-4 right-4"
                size="md"
              />
            )}
          </div>

          {/* Thumbnail Images */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-blue-500' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.error('Thumbnail image load error:', e);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Brand */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            {product.brand && (
              <p className="text-lg text-gray-600">by {product.brand.name}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.ratingsAverage || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.ratingsAverage || 0}) • {product.ratingsQuantity || 0} reviews
            </span>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-gray-900">
            ${product.price}
          </div>

          {/* Category */}
          {product.category && (
            <div className="text-sm text-gray-600">
              Category: <span className="font-medium">{product.category.name}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity and Stock */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= (product.quantity || 1)}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {product.quantity && product.quantity > 0 ? (
                <span className="text-primary">
                  ✓ {product.quantity} items in stock
                </span>
              ) : (
                <span className="text-red-600">✗ Out of stock</span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.quantity || product.quantity === 0 || isAddingToCart}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            {isAddingToCart ? 'Adding...' : (product.quantity && product.quantity > 0 ? 'Add to Cart' : 'Out of Stock')}
          </button>
        </div>
      </div>
    </div>
  );
}