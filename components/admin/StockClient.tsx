"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Edit2, X, Save, Package, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string | null
  category_id: string | null
  image_url: string | null
  price_purchase: number
  price_sale: number
  stock_initial: number
  stock_current: number
  badge_text: string | null
  badge_type: string | null
  is_active: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

interface StockClientProps {
  initialProducts: Product[]
  categories: Category[]
  userRole: string
}

export function StockClient({ initialProducts, categories, userRole }: StockClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '', description: '', category_id: '', image_url: '',
    price_purchase: 0, price_sale: 0, stock_initial: 0, stock_current: 0,
    badge_text: '', badge_type: '', is_active: true
  })
  
  const supabase = createClient()

  const formatKZS = (value: number) => Number(value).toLocaleString('pt-AO') + ' KZS'

  const resetForm = () => {
    setFormData({
      name: '', description: '', category_id: '', image_url: '',
      price_purchase: 0, price_sale: 0, stock_initial: 0, stock_current: 0,
      badge_text: '', badge_type: '', is_active: true
    })
    setImageFile(null)
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleUploadImage = async () => {
    if (!imageFile) return null
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('arifran-images')
      .upload(filePath, imageFile)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('arifran-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleAdd = async () => {
    setLoading(true)
    try {
      let uploadedUrl = formData.image_url
      if (imageFile) {
        uploadedUrl = await handleUploadImage() || ''
      }

      const { data, error } = await supabase.from('products').insert({
        ...formData,
        image_url: uploadedUrl,
        stock_current: formData.stock_initial,
        category_id: formData.category_id || null,
        badge_text: formData.badge_text || null,
        badge_type: formData.badge_type || null,
      }).select().single()
      
      if (data && !error) {
        setProducts([data, ...products])
        resetForm()
      } else {
        alert('Erro ao adicionar produto: ' + error?.message)
      }
    } catch (err: any) {
      alert('Erro no upload da imagem: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setFormData({
      name: p.name, description: p.description || '', category_id: p.category_id || '',
      image_url: p.image_url || '', price_purchase: p.price_purchase, price_sale: p.price_sale,
      stock_initial: p.stock_initial, stock_current: p.stock_current,
      badge_text: p.badge_text || '', badge_type: p.badge_type || '', is_active: p.is_active
    })
  }

  const handleUpdate = async (id: string) => {
    setLoading(true)
    try {
      let uploadedUrl = formData.image_url
      if (imageFile) {
        uploadedUrl = await handleUploadImage() || ''
      }

      const { data, error } = await supabase.from('products').update({
        ...formData,
        image_url: uploadedUrl,
        category_id: formData.category_id || null,
        badge_text: formData.badge_text || null,
        badge_type: formData.badge_type || null,
      }).eq('id', id).select().single()

      if (data && !error) {
        setProducts(products.map(p => p.id === id ? data : p))
        resetForm()
      } else {
        alert('Erro ao atualizar: ' + error?.message)
      }
    } catch (err: any) {
      alert('Erro no upload da imagem: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o produto "${name}"? Esta ação não pode ser desfeita.`)) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      
      if (!error) {
        setProducts(products.filter(p => p.id !== id))
        alert('Produto eliminado com sucesso!')
      } else {
        alert('Erro ao eliminar produto: ' + error.message)
      }
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display-lg text-headline-sm text-on-surface">Gestão de Stock</h3>
        <button 
          onClick={() => { resetForm(); setShowAddForm(true) }}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold text-label-bold hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingId) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-display-lg text-headline-sm text-primary">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h4>
              <button onClick={resetForm} className="text-outline hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Nome *</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3}
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Categoria</label>
                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Fotografia do Produto</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary/20 outline-none" 
                />
                {editingId && formData.image_url && !imageFile && (
                  <p className="text-xs text-on-surface-variant mt-2">O produto já tem uma imagem. Carregue uma nova apenas se quiser alterar.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Preço Compra (KZS) *</label>
                  <input type="number" value={formData.price_purchase} onChange={e => setFormData({...formData, price_purchase: Number(e.target.value)})}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Preço Venda (KZS) *</label>
                  <input type="number" value={formData.price_sale} onChange={e => setFormData({...formData, price_sale: Number(e.target.value)})}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Stock Inicial</label>
                  <input type="number" value={formData.stock_initial} onChange={e => setFormData({...formData, stock_initial: Number(e.target.value)})}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Stock Actual</label>
                  <input type="number" value={editingId ? formData.stock_current : formData.stock_initial} 
                    onChange={e => setFormData({...formData, stock_current: Number(e.target.value)})}
                    disabled={!editingId}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none disabled:bg-surface-container" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Badge (texto)</label>
                  <input value={formData.badge_text} onChange={e => setFormData({...formData, badge_text: e.target.value})} placeholder="Ex: Novo, Vegan"
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Badge (tipo)</label>
                  <select value={formData.badge_type} onChange={e => setFormData({...formData, badge_type: e.target.value})}
                    className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="">Nenhum</option>
                    <option value="new">Novo (dourado)</option>
                    <option value="vegan">Vegan (rosa)</option>
                    <option value="sale">Promoção (violeta)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                disabled={!formData.name || !formData.price_sale || loading}
                className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'A processar...' : (editingId ? 'Guardar Alterações' : 'Adicionar Produto')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-right">P. Compra</th>
                <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-right">P. Venda</th>
                <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-right">Lucro/Unid</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Package className="w-12 h-12 text-outline-variant mx-auto mb-3" />
                    <p className="text-on-surface-variant">Nenhum produto cadastrado.</p>
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center overflow-hidden relative shrink-0">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-outline" />
                        )}
                      </div>
                      <span className="font-display-lg text-body-lg text-on-surface">{p.name}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`font-body-md px-3 py-1 rounded-full ${
                        p.stock_current <= 10 ? 'text-error bg-error-container' : 'text-on-surface-variant bg-surface-container'
                      }`}>
                        {p.stock_current} unid.
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right font-body-md text-on-surface-variant">{formatKZS(p.price_purchase)}</td>
                    <td className="px-6 py-6 text-right font-body-md text-on-surface-variant">{formatKZS(p.price_sale)}</td>
                    <td className="px-6 py-6 text-right font-label-bold text-label-bold text-secondary">
                      +{formatKZS(Number(p.price_sale) - Number(p.price_purchase))}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(p)} className="text-outline hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {userRole === 'superadmin' && (
                          <button onClick={() => handleDelete(p.id, p.name)} className="text-outline hover:text-error transition-colors" title="Eliminar produto">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
