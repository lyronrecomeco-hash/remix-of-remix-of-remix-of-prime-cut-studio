import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Heart } from 'lucide-react';

import gallery1 from '@/assets/petshop/gallery-1.jpg';
import gallery2 from '@/assets/petshop/gallery-2.jpg';
import gallery3 from '@/assets/petshop/gallery-3.jpg';
import gallery4 from '@/assets/petshop/gallery-4.jpg';

const PetshopGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    { src: gallery1, alt: 'Pet após tosa', caption: 'Luna - Shih Tzu' },
    { src: gallery2, alt: 'Gatinho fofo', caption: 'Mimi - Persa' },
    { src: gallery3, alt: 'Cachorro feliz', caption: 'Thor - Bulldog' },
    { src: gallery4, alt: 'Yorkshire no banho', caption: 'Mel - Yorkshire' },
  ];

  const handlePrev = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <section id="galeria" className="py-12 sm:py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-petshop-orange/10 to-amber-500/10 text-petshop-orange px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 border border-petshop-orange/20">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Galeria
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-petshop-dark mb-3 sm:mb-4">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-petshop-orange to-amber-500">xodós</span>
          </h2>
          <p className="text-petshop-gray text-sm sm:text-lg px-4">
            Veja alguns dos pets que passaram pelo nosso cuidado 🐾
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedImage(index)}
              className="relative cursor-pointer group overflow-hidden rounded-xl sm:rounded-2xl aspect-square shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-xs sm:text-sm flex items-center gap-1">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
                  {image.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto"
        >
          {[
            { value: '5.000+', label: 'Pets atendidos' },
            { value: '10 anos', label: 'Experiência' },
            { value: '4.9★', label: 'No Google' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-petshop-orange to-amber-500">{stat.value}</p>
              <p className="text-petshop-gray text-[10px] sm:text-sm mt-0.5 sm:mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <img src={images[selectedImage].src} alt={images[selectedImage].alt} className="max-w-full max-h-[80vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white font-medium text-sm">{images[selectedImage].caption}</p>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default PetshopGallery;
