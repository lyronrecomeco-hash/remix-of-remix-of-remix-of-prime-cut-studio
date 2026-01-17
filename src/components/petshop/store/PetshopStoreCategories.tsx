import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface PetshopStoreCategoriesProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

const PetshopStoreCategories = ({
  categories,
  selectedCategory,
  onSelectCategory
}: PetshopStoreCategoriesProps) => {
  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {/* All */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1.5">🏠</span>
            Todos
          </motion.button>

          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon && <span className="mr-1.5">{category.icon}</span>}
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetshopStoreCategories;
