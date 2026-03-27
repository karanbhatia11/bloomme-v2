import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group bloom-hover bg-surface-container-lowest p-4 rounded-3xl cursor-pointer"
    >
      <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 bloom-image-trigger relative">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-bold mb-1">{product.title}</h3>
      <p className="text-sm text-on-surface-variant mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-primary">{product.price}</span>
        <span className="material-symbols-outlined text-primary-container">
          add_circle
        </span>
      </div>
    </motion.div>
  );
};
