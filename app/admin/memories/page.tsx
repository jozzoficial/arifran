import { createClient } from "@/utils/supabase/server"
import { MemoriesClient } from "@/components/admin/MemoriesClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminMemoriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'funcionario') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="font-display-lg text-headline-md text-error mb-4">Acesso Negado 🚫</h1>
        <p className="text-on-surface-variant font-body-lg">
          Não tem permissões para aceder à Gestão de Memórias.
        </p>
      </div>
    )
  }

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="mb-8">
        <p className="font-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Wall of Fame</p>
        <h2 className="font-display-lg text-headline-md text-on-surface">Momentos & Memórias</h2>
      </div>
      
      <MemoriesClient initialMemories={memories || []} />
    </>
  )
}
