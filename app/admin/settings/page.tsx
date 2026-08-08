import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/admin/SettingsClient"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Verificar Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Verificar Permissões (Apenas superadmin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-error text-6xl mb-4">🚫</div>
        <h2 className="font-display-lg text-headline-md text-on-surface mb-2">Acesso Restrito</h2>
        <p className="text-on-surface-variant">Apenas o Super Admin tem permissões para alterar as definições da loja.</p>
      </div>
    )
  }

  // 3. Carregar Definições da Loja
  const { data: settingsRes } = await supabase
    .from('site_settings')
    .select('*')
    .order('key', { ascending: true })

  // Converter o array num objeto { key: { value, description } } para ser mais fácil de usar no Cliente
  const settingsObj: Record<string, { value: string, description: string | null }> = {}
  
  if (settingsRes) {
    settingsRes.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description
      }
    })
  }

  return (
    <>
      <div className="mb-8">
        <p className="font-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Configurações</p>
        <h2 className="font-display-lg text-headline-md text-on-surface">Definições Globais</h2>
        <p className="text-on-surface-variant mt-2">
          Atualize os dados principais da loja. Estas alterações refletem-se imediatamente em todo o site.
        </p>
      </div>

      <SettingsClient initialSettings={settingsObj} />
    </>
  )
}
