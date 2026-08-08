"use client"

import { useState } from "react"
import { Shield, ShieldAlert, User as UserIcon, Check } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Profile {
  id: string
  full_name: string
  role: 'superadmin' | 'admin' | 'funcionario'
  created_at: string
}

interface TeamClientProps {
  initialProfiles: Profile[]
  currentUserId: string
}

export function TeamClient({ initialProfiles, currentUserId }: TeamClientProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
    setIsUpdating(userId)
    setSuccessMsg(null)

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error("Error updating role:", error)
      alert("Erro ao atualizar o nível de acesso.")
    } else {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p))
      setSuccessMsg("Perfil atualizado com sucesso!")
      setTimeout(() => setSuccessMsg(null), 3000)
    }
    
    setIsUpdating(null)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-label-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Super Admin</span>
      case 'admin':
        return <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs font-label-bold flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>
      default:
        return <span className="bg-outline-variant/30 text-on-surface-variant px-2 py-1 rounded-full text-xs font-label-bold flex items-center gap-1"><UserIcon className="w-3 h-3" /> Funcionário</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-md text-primary mb-2">Gestão de Equipa</h1>
          <p className="font-body-lg text-on-surface-variant">Gerencie os acessos e funções dos membros da sua equipa.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-success/10 text-success p-4 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-5 h-5" />
          <span className="font-label-bold">{successMsg}</span>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="p-4 font-label-bold text-on-surface-variant uppercase text-xs tracking-wider">Nome</th>
                <th className="p-4 font-label-bold text-on-surface-variant uppercase text-xs tracking-wider">Função Atual</th>
                <th className="p-4 font-label-bold text-on-surface-variant uppercase text-xs tracking-wider">Alterar Acesso</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(profile => {
                const isMe = profile.id === currentUserId
                return (
                  <tr key={profile.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-4">
                      <div className="font-label-bold text-on-surface flex items-center gap-2">
                        {profile.full_name || 'Sem Nome'}
                        {isMe && <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full uppercase tracking-wider">Tu</span>}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-1">Registado a: {new Date(profile.created_at).toLocaleDateString('pt-PT')}</div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(profile.role)}
                    </td>
                    <td className="p-4">
                      {profile.role === 'superadmin' ? (
                        <span className="text-xs text-outline-variant italic">Bloqueado (Dono da loja)</span>
                      ) : (
                        <select
                          className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-50"
                          value={profile.role}
                          disabled={isUpdating === profile.id || isMe}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value as Profile['role'])}
                        >
                          <option value="funcionario">Funcionário</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
