"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ShoppingCart, Plus, Calendar, Save, DollarSign } from "lucide-react"

interface Product {
  id: string
  name: string
  price_sale: number
  stock_current: number
}

interface Sale {
  id: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
  products: { name: string } | null
  profiles: { full_name: string } | null
}

export function SalesClient({ initialSales, products, userId }: { initialSales: Sale[], products: Product[], userId: string }) {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const supabase = createClient()

  const formatKZS = (value: number) => Number(value).toLocaleString('pt-AO') + ' KZS'
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  const product = products.find(p => p.id === selectedProduct)
  const total = product ? product.price_sale * quantity : 0

  const handleRegisterSale = async () => {
    if (!product || quantity <= 0 || quantity > product.stock_current) return

    const { data, error } = await supabase.from('sales').insert({
      product_id: product.id,
      quantity,
      unit_price: product.price_sale,
      sold_by: userId
    }).select('*, products(name), profiles(full_name)').single()

    if (error) {
      alert('Erro ao registar venda: ' + error.message)
    } else if (data) {
      setSales([data, ...sales])
      setSelectedProduct('')
      setQuantity(1)
      alert('Venda registada com sucesso!')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      {/* Formulário de Venda */}
      <div className="lg:col-span-1">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30 sticky top-24">
          <h3 className="font-headline-md text-headline-sm text-primary mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nova Venda
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-label-bold text-on-surface-variant mb-2">Produto</label>
              <select 
                value={selectedProduct} 
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="">Selecione um produto</option>
                {products.filter(p => p.stock_current > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({formatKZS(p.price_sale)}) - {p.stock_current} em stock</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-label-bold text-on-surface-variant mb-2">Quantidade</label>
              <input 
                type="number" 
                min="1" 
                max={product?.stock_current || 1}
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!selectedProduct}
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none disabled:bg-surface-container disabled:opacity-70"
              />
            </div>

            <div className="pt-4 border-t border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <span className="font-label-bold text-on-surface-variant uppercase">Total</span>
                <span className="font-display-lg text-headline-sm text-primary">{formatKZS(total)}</span>
              </div>
              <button 
                onClick={handleRegisterSale}
                disabled={!selectedProduct || quantity <= 0}
                className="w-full py-4 bg-gradient-to-r from-secondary to-[#b340ed] text-white font-bold rounded-lg shadow-lg hover:shadow-secondary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
              >
                <Save className="w-5 h-5" /> Registar Venda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Vendas */}
      <div className="lg:col-span-2">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30 h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-md text-headline-sm text-primary flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Histórico Recente
            </h3>
            <span className="bg-primary-container text-primary font-label-bold text-xs px-3 py-1 rounded-full">
              {sales.length} registos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant">
                  <th className="pb-4 font-label-bold text-[11px] uppercase tracking-widest">Data / Hora</th>
                  <th className="pb-4 font-label-bold text-[11px] uppercase tracking-widest">Produto</th>
                  <th className="pb-4 font-label-bold text-[11px] uppercase tracking-widest">Qtd</th>
                  <th className="pb-4 font-label-bold text-[11px] uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-on-surface-variant">
                      Nenhuma venda registada ainda.
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-surface-bright transition-colors">
                      <td className="py-4 font-body-md text-sm text-on-surface-variant flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {formatDate(sale.created_at)}
                      </td>
                      <td className="py-4">
                        <p className="font-label-bold text-on-surface">{sale.products?.name || 'Produto Removido'}</p>
                        <p className="text-xs text-on-surface-variant">Vendido por: {sale.profiles?.full_name || 'Desconhecido'}</p>
                      </td>
                      <td className="py-4 font-label-bold">{sale.quantity}</td>
                      <td className="py-4 text-right font-label-bold text-secondary">
                        +{formatKZS(sale.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
