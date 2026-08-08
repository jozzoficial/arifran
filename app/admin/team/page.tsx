import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TeamClient } from "@/components/admin/TeamClient"

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createClient()

  // 1. Validar autenticação e autorização
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Bloqueia acesso a quem não for superadmin
  if (!profile || profile.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="font-display-lg text-headline-md text-error mb-4">Acesso Negado 🚫</h1>
        <p className="text-on-surface-variant font-body-lg">
          Apenas o Super Admin tem acesso à gestão da equipa.
        </p>
      </div>
    )
  }

  // 2. Buscar todos os perfis
  const { data: allProfiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Erro a carregar perfis:", error)
  }

  return <TeamClient initialProfiles={allProfiles || []} currentUserId={user.id} />
}
