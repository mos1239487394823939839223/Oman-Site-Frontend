// interface Product {
//   _id: string;
//   title: string;
//   price: number;
//   priceAfterDiscount?: number;
//   description: string;
//   imageCover: string;
//   images: string[];
//   category: {
//     _id: string;
//     name: string;
//   };
//   brand: {
//     _id: string;
//     name: string;
//   };
//   ratingsAverage: number;
//   ratingsQuantity: number;
//   quantity: number;
//   sold: number;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Category {
//   _id: string;
//   name: string;
//   image: string;
//   slug: string;
// }

// interface Brand {
//   _id: string;
//   name: string;
//   image: string;
//   slug: string;
// }

// interface Subcategory {
//   _id: string;
//   name: string;
//   image: string;
//   category: string;
//   slug: string;
// }

// export const mockProducts: Product[] = [
//   {
//     _id: "prod1",
//     title: "iPhone 15 Pro",
//     price: 50000,
//     priceAfterDiscount: 45000,
//     description: "Latest iPhone with advanced camera system",
//     imageCover: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
//     images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"],
//     category: { _id: "cat1", name: "Electronics" },
//     brand: { _id: "brand1", name: "Apple" },
//     ratingsAverage: 4.8,
//     ratingsQuantity: 120,
//     quantity: 50,
//     sold: 200,
//     createdAt: "2024-01-15T10:00:00Z",
//     updatedAt: "2024-01-15T10:00:00Z"
//   },
//   {
//     _id: "prod2",
//     title: "Samsung Galaxy S24",
//     price: 20000,
//     description: "Powerful Android smartphone",
//     imageCover: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
//     images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400"],
//     category: { _id: "cat1", name: "Electronics" },
//     brand: { _id: "brand2", name: "Samsung" },
//     ratingsAverage: 4.6,
//     ratingsQuantity: 95,
//     quantity: 30,
//     sold: 150,
//     createdAt: "2024-01-10T10:00:00Z",
//     updatedAt: "2024-01-10T10:00:00Z"
//   },
//   {
//     _id: "prod3",
//     title: "MacBook Pro 16-inch",
//     price: 50000,
//     priceAfterDiscount: 42000,
//     description: "Professional laptop for developers and creators",
//     imageCover: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
//     images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
//     category: { _id: "cat2", name: "Computers" },
//     brand: { _id: "brand1", name: "Apple" },
//     ratingsAverage: 4.9,
//     ratingsQuantity: 80,
//     quantity: 25,
//     sold: 100,
//     createdAt: "2024-01-05T10:00:00Z",
//     updatedAt: "2024-01-05T10:00:00Z"
//   }
// ];

// export const mockCategories: Category[] = [
//   {
//     _id: "cat1",
//     name: "Electronics",
//     image: "https://images.unsplash.com/photo-1498049794561-7780c7234d60?w=300",
//     slug: "electronics"
//   },
//   {
//     _id: "cat2",
//     name: "Computers",
//     image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
//     slug: "computers"
//   },
//   {
//     _id: "cat3",
//     name: "Fashion",
//     image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300",
//     slug: "fashion"
//   }
// ];

// export const mockBrands: Brand[] = [
//   {
//     _id: "brand1",
//     name: "Apple",
//     image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200",
//     slug: "apple"
//   },
//   {
//     _id: "brand2",
//     name: "Samsung",
//     image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200",
//     slug: "samsung"
//   },
//   {
//     _id: "brand3",
//     name: "Nike",
//     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
//     slug: "nike"
//   }
// ];

// export const mockSubcategories: Subcategory[] = [
//   {
//     _id: "sub1",
//     name: "Smartphones",
//     image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200",
//     category: "cat1",
//     slug: "smartphones"
//   },
//   {
//     _id: "sub2",
//     name: "Laptops",
//     image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200",
//     category: "cat2",
//     slug: "laptops"
//   },
//   {
//     _id: "sub3",
//     name: "Shoes",
//     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
//     category: "cat3",
//     slug: "shoes"
//   }
// ];

