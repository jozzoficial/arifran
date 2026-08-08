"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Save, X, Edit, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
  is_active: boolean
  display_order: number
}

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  display_order: number
  is_active: boolean
}

export function StorefrontClient({ initialBanners, initialCategories }: { initialBanners: Banner[], initialCategories: Category[] }) {
  const [activeTab, setActiveTab] = useState<'banners' | 'categories'>('banners')
  
  // Banners State
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null)
  
  // Categories State
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const supabase = createClient()

  // --- Funções de Upload ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: 'banners' | 'categories', callback: (url: string) => void) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      
      setUploadingImage(true)
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('arifran-images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('arifran-images').getPublicUrl(fileName)
      
      callback(publicUrl)
    } catch (err: any) {
      alert("Erro ao fazer upload da imagem: " + err.message)
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = '' // Limpa o input
    }
  }

  // --- Funções de Banners ---
  const saveBanner = async () => {
    if (!editingBanner?.title || !editingBanner?.image_url) {
      alert("Título e Imagem são obrigatórios!")
      return
    }
    
    setLoading(true)
    try {
      if (editingBanner.id) {
        const { error } = await supabase.from('hero_banners').update(editingBanner).eq('id', editingBanner.id)
        if (error) throw error
        setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...editingBanner } as Banner : b))
      } else {
        const { data, error } = await supabase.from('hero_banners').insert({
          ...editingBanner,
          display_order: editingBanner.display_order || banners.length + 1
        }).select().single()
        if (error) throw error
        setBanners([...banners, data])
      }
      setEditingBanner(null)
    } catch (err: any) {
      alert("Erro ao guardar banner: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm("Tem a certeza que deseja apagar este banner?")) return
    try {
      const { error } = await supabase.from('hero_banners').delete().eq('id', id)
      if (error) throw error
      setBanners(banners.filter(b => b.id !== id))
    } catch (err: any) {
      alert("Erro ao apagar banner: " + err.message)
    }
  }

  // --- Funções de Categorias ---
  const saveCategory = async () => {
    if (!editingCategory?.name || !editingCategory?.slug) {
      alert("Nome e Slug são obrigatórios!")
      return
    }
    
    setLoading(true)
    try {
      if (editingCategory.id) {
        const { error } = await supabase.from('categories').update(editingCategory).eq('id', editingCategory.id)
        if (error) throw error
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...editingCategory } as Category : c))
      } else {
        const { data, error } = await supabase.from('categories').insert({
          ...editingCategory,
          display_order: editingCategory.display_order || categories.length + 1
        }).select().single()
        if (error) throw error
        setCategories([...categories, data])
      }
      setEditingCategory(null)
    } catch (err: any) {
      alert("Erro ao guardar categoria: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Tem a certeza que deseja apagar esta categoria? NOTA: Produtos associados ficarão sem categoria.")) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      setCategories(categories.filter(c => c.id !== id))
    } catch (err: any) {
      alert("Erro ao apagar categoria: " + err.message)
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-outline-variant/30 pb-4">
        <button 
          onClick={() => setActiveTab('banners')}
          className={`font-label-bold px-6 py-2 rounded-full transition-colors ${activeTab === 'banners' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}`}
        >
          Banners Principais
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`font-label-bold px-6 py-2 rounded-full transition-colors ${activeTab === 'categories' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}`}
        >
          Categorias
        </button>
      </div>

      {/* ================= BANNERS TAB ================= */}
      {activeTab === 'banners' && (
        <div className="animate-in fade-in">
          {!editingBanner ? (
            <div className="mb-6 flex justify-end">
              <button 
                onClick={() => setEditingBanner({ is_active: true })}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Novo Banner
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">{editingBanner.id ? 'Editar Banner' : 'Novo Banner'}</h3>
                <button onClick={() => setEditingBanner(null)} className="text-on-surface-variant hover:text-error"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-label-bold mb-1">Título *</label>
                    <input 
                      value={editingBanner.title || ''} 
                      onChange={e => setEditingBanner({...editingBanner, title: e.target.value})}
                      className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:border-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-label-bold mb-1">Subtítulo</label>
                    <textarea 
                      value={editingBanner.subtitle || ''} 
                      onChange={e => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                      className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:border-primary outline-none resize-none" 
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-label-bold mb-1">Texto do Botão</label>
                      <input 
                        value={editingBanner.cta_text || ''} 
                        onChange={e => setEditingBanner({...editingBanner, cta_text: e.target.value})}
                        className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:border-primary outline-none" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-label-bold mb-1">Link do Botão</label>
                      <input 
                        value={editingBanner.cta_link || ''} 
                        onChange={e => setEditingBanner({...editingBanner, cta_link: e.target.value})}
                        className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:border-primary outline-none" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-label-bold mb-1">Imagem * (Upload)</label>
                    <div className="flex flex-col gap-3">
                      {editingBanner.image_url ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-outline-variant/30 bg-surface">
                          <Image src={editingBanner.image_url} alt="Preview" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-xl border-2 border-dashed border-outline-variant/50 bg-surface flex flex-col items-center justify-center text-on-surface-variant">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-sm">Nenhuma imagem selecionada</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-label-bold flex items-center gap-2 hover:bg-secondary hover:text-white transition-colors">
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          {uploadingImage ? 'A carregar...' : 'Escolher do Computador'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={uploadingImage}
                            onChange={(e) => handleImageUpload(e, 'banners', (url) => setEditingBanner({...editingBanner, image_url: url}))} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <input 
                      type="checkbox" 
                      id="activeBanner"
                      checked={editingBanner.is_active !== false}
                      onChange={e => setEditingBanner({...editingBanner, is_active: e.target.checked})}
                      className="w-4 h-4 text-primary"
                    />
                    <label htmlFor="activeBanner" className="font-label-bold">Banner Ativo (Visível na Loja)</label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 border-t border-outline-variant/20 pt-6">
                <button onClick={() => setEditingBanner(null)} className="px-4 py-2 font-label-bold text-on-surface-variant">Cancelar</button>
                <button 
                  onClick={saveBanner}
                  disabled={loading}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Gravar Banner
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className={`bg-surface-container-lowest rounded-xl overflow-hidden border ${banner.is_active ? 'border-primary/30' : 'border-outline-variant/30 opacity-60'} shadow-sm flex flex-col`}>
                <div className="relative aspect-[21/9] w-full bg-surface">
                  <Image src={banner.image_url} alt={banner.title} fill className="object-cover" />
                  {!banner.is_active && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-error text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Inativo</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-label-bold text-lg mb-1">{banner.title}</h4>
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{banner.subtitle}</p>
                  
                  <div className="flex justify-end gap-2 border-t border-outline-variant/20 pt-4 mt-auto">
                    <button onClick={() => setEditingBanner(banner)} className="p-2 text-on-surface-variant hover:text-primary bg-surface-container rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteBanner(banner.id)} className="p-2 text-on-surface-variant hover:text-error bg-surface-container rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CATEGORIES TAB ================= */}
      {activeTab === 'categories' && (
        <div className="animate-in fade-in">
          {!editingCategory ? (
            <div className="mb-6 flex justify-end">
              <button 
                onClick={() => setEditingCategory({ is_active: true })}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nova Categoria
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-primary">{editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <button onClick={() => setEditingCategory(null)} className="text-on-surface-variant hover:text-error"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-label-bold mb-1">Nome da Categoria *</label>
                    <input 
                      value={editingCategory.name || ''} 
                      onChange={e => {
                        const name = e.target.value
                        // Generate slug automatically based on name
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                        setEditingCategory({...editingCategory, name, slug})
                      }}
                      className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:border-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-label-bold mb-1">Slug (Identificador URL) *</label>
                    <input 
                      value={editingCategory.slug || ''} 
                      onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})}
                      className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:border-primary outline-none font-mono text-sm" 
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="activeCategory"
                      checked={editingCategory.is_active !== false}
                      onChange={e => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                      className="w-4 h-4 text-primary"
                    />
                    <label htmlFor="activeCategory" className="font-label-bold">Categoria Ativa</label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-label-bold mb-1">Imagem Circular (Upload)</label>
                    <div className="flex flex-col gap-3">
                      {editingCategory.image_url ? (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-outline-variant/30 bg-surface">
                          <Image src={editingCategory.image_url} alt="Preview" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full border-2 border-dashed border-outline-variant/50 bg-surface flex flex-col items-center justify-center text-on-surface-variant">
                          <ImageIcon className="w-6 h-6 opacity-50" />
                        </div>
                      )}
                      
                      <div>
                        <label className="inline-flex cursor-pointer bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-label-bold items-center gap-2 hover:bg-secondary hover:text-white transition-colors text-sm">
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          {uploadingImage ? 'A carregar...' : 'Upload'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={uploadingImage}
                            onChange={(e) => handleImageUpload(e, 'categories', (url) => setEditingCategory({...editingCategory, image_url: url}))} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 border-t border-outline-variant/20 pt-6">
                <button onClick={() => setEditingCategory(null)} className="px-4 py-2 font-label-bold text-on-surface-variant">Cancelar</button>
                <button 
                  onClick={saveCategory}
                  disabled={loading}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Gravar Categoria
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <div key={category.id} className={`bg-surface-container-lowest rounded-xl p-6 border ${category.is_active ? 'border-outline-variant/30' : 'border-outline-variant/30 opacity-60'} shadow-sm flex flex-col items-center text-center`}>
                <div className="relative w-24 h-24 rounded-full bg-surface border border-outline-variant/20 mb-4 overflow-hidden">
                  {category.image_url ? (
                    <Image src={category.image_url} alt={category.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline-variant bg-surface-container">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
                <h4 className="font-label-bold text-lg mb-1">{category.name}</h4>
                <p className="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded mb-4">/{category.slug}</p>
                
                {!category.is_active && (
                  <span className="bg-error/10 text-error px-2 py-1 rounded-full text-xs font-bold uppercase mb-4">Inativa</span>
                )}
                
                <div className="flex gap-2 w-full mt-auto">
                  <button onClick={() => setEditingCategory(category)} className="flex-1 py-2 text-on-surface-variant hover:text-primary bg-surface-container rounded-lg flex justify-center">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(category.id)} className="flex-1 py-2 text-on-surface-variant hover:text-error bg-surface-container rounded-lg flex justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
