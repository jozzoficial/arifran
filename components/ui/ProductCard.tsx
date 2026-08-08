"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"

interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
  rating?: number
  reviewsCount?: number
  badge?: {
    text: string
    type: 'new' | 'vegan' | 'sale'
  }
}

export function ProductCard({ id, name, price, imageUrl, rating = 5, reviewsCount = 0, badge }: ProductCardProps) {
  const { addToCart } = useCart()
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-AO') + ' KZS'
  }

  return (
    <div className="bg-surface rounded-xl overflow-hidden product-card-shadow group flex flex-col h-full">
      <Link href={`/product/${id}`} className="relative h-80 overflow-hidden bg-white p-6 block">
        <Image 
          src={imageUrl} 
          alt={name} 
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        {badge && (
          <span className={`absolute top-4 left-4 text-[10px] font-label-bold px-3 py-1 rounded-full uppercase ${
            badge.type === 'new' ? 'bg-tertiary text-on-tertiary' : 
            badge.type === 'vegan' ? 'bg-primary text-white' : 
            'bg-secondary text-white'
          }`}>
            {badge.text}
          </span>
        )}
      </Link>
      <div className="p-6 text-center flex flex-col flex-grow">
        <Link href={`/product/${id}`}>
          <h3 className="font-display-lg text-headline-sm mb-2 hover:text-secondary transition-colors">{name}</h3>
        </Link>
        <div className="flex justify-center items-center gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? 'text-tertiary-container fill-tertiary-container' : 'text-outline-variant'}`}
            />
          ))}
          <span className="text-on-surface-variant text-xs ml-1.5">({reviewsCount})</span>
        </div>
        <p className="font-display-lg text-headline-sm text-secondary mb-6 mt-auto">
          {formatPrice(price)}
        </p>
        <button 
          onClick={(e) => {
            e.preventDefault(); // Prevent navigating to product details
            addToCart({
              id,
              name,
              price,
              imageUrl,
            })
          }}
          className="w-full border-2 border-outline-variant hover:border-secondary hover:bg-secondary hover:text-white transition-all py-3 rounded-lg font-label-bold uppercase text-xs tracking-widest active:scale-95 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar
        </button>
      </div>
    </div>
  )
}
