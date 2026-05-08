import Link from "next/link";

interface Brand {
  _id: string;
  name: string;
  image?: string;
}

interface BrandListProps {
  brands: Brand[];
}

export default function BrandList({ brands }: BrandListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {brands.map((brand) => (
        <Link 
          key={brand._id} 
          href={`/products?brand=${brand._id}`}
          className="group"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
              {brand.image ? (
                <img 
                  src={brand.image} 
                  alt={brand.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                />
              ) : (
                <img 
                  src="/placeholder.svg" 
                  alt={brand.name}
                  className="w-full h-full object-contain opacity-60" 
                />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-center group-hover:text-primary transition-colors">
              {brand.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}


