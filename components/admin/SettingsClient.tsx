"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Save, Loader2, AlertCircle } from "lucide-react"

type SettingsData = Record<string, { value: string, description: string | null }>

interface SettingsClientProps {
  initialSettings: SettingsData
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const supabase = createClient()

  const handleInputChange = (key: string, newValue: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: newValue
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccessMsg("")
    
    try {
      // O Supabase tem um método 'upsert', mas como os dados já existem, vamos fazer uma série de updates.
      // Como não são muitos campos, Promise.all com múltiplos updates é rápido o suficiente.
      const updatePromises = Object.entries(settings).map(([key, data]) => {
        return supabase
          .from('site_settings')
          .update({ value: data.value })
          .eq('key', key)
      })

      await Promise.all(updatePromises)
      
      setSuccessMsg("Definições atualizadas com sucesso!")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (err: any) {
      alert("Erro ao guardar definições: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper para agrupar chaves por lógica
  const groups = [
    {
      title: "Identidade da Loja",
      keys: ['store_name', 'store_slogan']
    },
    {
      title: "Contactos e Redes Sociais",
      keys: ['whatsapp_number', 'email_contact', 'tiktok_url']
    },
    {
      title: "Financeiro",
      keys: ['currency', 'fixed_rent']
    }
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.05)] border border-outline-variant/30 animate-in fade-in">
      
      {successMsg && (
        <div className="mb-6 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg font-label-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="space-y-10">
        {groups.map(group => (
          <div key={group.title} className="border-b border-outline-variant/20 pb-8 last:border-0 last:pb-0">
            <h3 className="font-display-lg text-headline-sm text-primary mb-6">{group.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.keys.map(key => {
                const setting = settings[key]
                if (!setting) return null

                // Determinar o tipo de input
                const isNumber = key === 'fixed_rent'
                const isUrl = key.includes('url')
                const isEmail = key.includes('email')

                return (
                  <div key={key} className="bg-surface-container/30 p-5 rounded-xl border border-outline-variant/20">
                    <label className="block text-sm font-label-bold text-on-surface mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <p className="text-xs text-on-surface-variant mb-3 h-8">
                      {setting.description}
                    </p>
                    
                    <input 
                      type={isNumber ? 'number' : isUrl ? 'url' : isEmail ? 'email' : 'text'}
                      value={setting.value}
                      onChange={e => handleInputChange(key, e.target.value)}
                      className="w-full bg-white border border-outline-variant/30 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none font-body-md transition-shadow"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? 'A Guardar...' : 'Guardar Todas as Alterações'}
        </button>
      </div>
    </div>
  )
}
