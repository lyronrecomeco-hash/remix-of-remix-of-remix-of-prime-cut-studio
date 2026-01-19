import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Star } from 'lucide-react';
import gallery1 from '@/assets/starpetshop/gallery-1.jpg';
import gallery2 from '@/assets/starpetshop/gallery-2.jpg';
import gallery3 from '@/assets/starpetshop/gallery-3.jpg';
import gallery4 from '@/assets/starpetshop/gallery-4.jpg';
import gallery5 from '@/assets/starpetshop/gallery-5.jpg';
import gallery6 from '@/assets/starpetshop/gallery-6.jpg';

const StarpetshopGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    { src: gallery1, alt: 'Atendimento odontológico veterinário', caption: 'Cuidado dental especializado' },
    { src: gallery2, alt: 'Pet feliz após tratamento', caption: 'Sorriso saudável' },
    { src: gallery3, alt: 'Consulta veterinária', caption: 'Atendimento humanizado' },
    { src: gallery4, alt: 'Antes e depois dental', caption: 'Resultados que transformam' },
    { src: gallery5, alt: 'Pet após banho e tosa', caption: 'Cuidado completo' },
    { src: gallery6, alt: 'Clínica Star Petshop', caption: 'Nossa estrutura' },
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
    <section id="galeria" className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-red-600 font-semibold mb-4">
            <Camera className="w-5 h-5" />
            GALERIA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Momentos Especiais
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conheça nossa estrutura e veja alguns dos nossos pacientes mais especiais.
          </p>
        </motion.div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-medium text-sm">{image.caption}</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-red-600 text-white p-2 rounded-full">
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-red-400 transition-colors bg-white/10 p-3 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-red-400 transition-colors bg-white/10 p-3 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <p className="text-white text-center mt-4 text-lg">
                {images[selectedImage].caption}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default StarpetshopGallery;
