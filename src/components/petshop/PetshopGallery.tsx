import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

import gallery1 from '@/assets/petshop/gallery-1.jpg';
import gallery2 from '@/assets/petshop/gallery-2.jpg';
import gallery3 from '@/assets/petshop/gallery-3.jpg';
import gallery4 from '@/assets/petshop/gallery-4.jpg';

const PetshopGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
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
    <section id="galeria" className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-petshop-orange/10 text-petshop-orange px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Camera className="w-4 h-4" />
            Galeria
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-petshop-dark mb-4">
            Nossos <span className="text-petshop-orange">xodós</span>
          </h2>
          <p className="text-petshop-gray text-lg">
            Veja alguns dos pets que passaram pelo nosso cuidado
          </p>
        </motion.div>

        {/* Gallery Grid - Clean 2x2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedImage(index)}
              className="relative cursor-pointer group overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-medium text-sm">{image.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12"
        >
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-petshop-orange">5.000+</p>
            <p className="text-petshop-gray text-sm mt-1">Pets atendidos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-petshop-orange">8 anos</p>
            <p className="text-petshop-gray text-sm mt-1">De experiência</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-petshop-orange">4.9★</p>
            <p className="text-petshop-gray text-sm mt-1">No Google</p>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <motion.img
            key={selectedImage}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
            className="max-w-full max-h-[80vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Caption */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full">
            <p className="text-white font-medium">{images[selectedImage].caption}</p>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default PetshopGallery;
