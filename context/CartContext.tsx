"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantityToAdd?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem('arifran-cart')
        if (savedCart) {
          const parsed = JSON.parse(savedCart)
          if (Array.isArray(parsed)) {
            setItems(parsed as CartItem[])
          }
        }
      } catch (e) {
        console.error('Failed to load cart from local storage', e)
      }
      setIsInitialized(true)
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])

  // Save to local storage when items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('arifran-cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(item => item.id === product.id)
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        )
      }
      return [...currentItems, { ...product, quantity: quantityToAdd }]
    })
    setIsCartOpen(true) // Obre o carrinho automaticamente ao adicionar
  }

  const removeFromCart = (id: string) => {
    setItems((currentItems) => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems((currentItems) =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
