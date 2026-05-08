import { api } from "@/services/api";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {categories.map((category) => (
        <Link 
          key={category._id} 
          href={`/products?category=${category._id}`}
          className="group"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square mb-4 overflow-hidden rounded-lg">
              <img 
                src={category.image || "/placeholder.svg"} 
                alt={category.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <h3 className="font-semibold text-gray-900 text-center group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}


