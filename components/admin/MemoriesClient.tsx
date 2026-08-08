"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, X, Save, Camera, Trash2, EyeOff, Eye, Loader2 } from "lucide-react"

interface Memory {
  id: string
  title: string
  image_url: string
  is_active: boolean
  created_at: string
}

export function MemoriesClient({ initialMemories }: { initialMemories: Memory[] }) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories)
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const resetForm = () => {
    setTitle('')
    setImageFile(null)
    setShowAddForm(false)
  }

  const handleAdd = async () => {
    if (!title || !imageFile) return
    setLoading(true)

    try {
      // 1. Upload to Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `memories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('arifran-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('arifran-images')
        .getPublicUrl(filePath)

      // 3. Insert into memories table
      const { data, error: dbError } = await supabase
        .from('memories')
        .insert({
          title,
          image_url: publicUrlData.publicUrl,
        })
        .select()
        .single()

      if (dbError) throw dbError

      setMemories([data, ...memories])
      resetForm()
    } catch (err: any) {
      alert('Erro ao guardar memória: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { data, error } = await supabase
      .from('memories')
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setMemories(memories.map(m => m.id === id ? data : m))
    }
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta memória?')) {
      // Remover da BD
      const { error } = await supabase.from('memories').delete().eq('id', id)
      if (error) {
        alert('Erro ao eliminar: ' + error.message)
        return
      }

      // Tentar remover do bucket também
      try {
        const urlParts = imageUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        await supabase.storage.from('arifran-images').remove([`memories/${fileName}`])
      } catch (e) {
        console.error('Falha ao apagar ficheiro do storage:', e)
      }

      setMemories(memories.filter(m => m.id !== id))
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display-lg text-headline-sm text-on-surface">Gestão de Memórias</h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Memória
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-display-lg text-headline-sm text-primary">Adicionar Foto</h4>
              <button onClick={resetForm} className="text-outline hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Pequeno Título / Legenda *</label>
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Ex: A Maria adorou o nosso novo Gloss!"
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-label-bold text-on-surface-variant mb-1">Fotografia *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary/20 outline-none" 
                />
              </div>

              <button 
                onClick={handleAdd}
                disabled={!title || !imageFile || loading}
                className="w-full mt-4 bg-primary text-on-primary py-3 rounded-lg font-label-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'A guardar e enviar imagem...' : 'Publicar Memória'}
              </button>
            </div>
          </div>
        </div>
      )}

      {memories.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <Camera className="w-12 h-12 text-outline-variant mx-auto mb-4" />
          <p className="text-on-surface-variant">Nenhuma memória adicionada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map(m => (
            <div key={m.id} className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-md border border-outline-variant/10 relative group ${!m.is_active && 'opacity-60 grayscale'}`}>
              <div className="h-48 w-full relative overflow-hidden bg-surface-variant">
                <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-label-bold text-on-surface line-clamp-2 mb-2">{m.title}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  {new Date(m.created_at).toLocaleDateString('pt-PT')}
                </p>
              </div>
              
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toggleStatus(m.id, m.is_active)}
                  className="bg-white p-2 rounded-full shadow-md text-on-surface-variant hover:text-secondary transition-colors"
                  title={m.is_active ? 'Ocultar do site' : 'Mostrar no site'}
                >
                  {m.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleDelete(m.id, m.image_url)}
                  className="bg-white p-2 rounded-full shadow-md text-on-surface-variant hover:text-error transition-colors"
                  title="Eliminar permanentemente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
