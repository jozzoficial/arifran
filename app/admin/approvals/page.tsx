import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ApprovalsClient } from "@/components/admin/ApprovalsClient"

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: approvals } = await supabase
    .from('pending_approvals')
    .select(`
      *,
      requester:profiles!pending_approvals_requested_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="mb-8">
        <p className="font-label-bold text-primary mb-1 uppercase tracking-[0.2em]">Workflows</p>
        <h2 className="font-display-lg text-headline-md text-on-surface">Aprovações e Pedidos</h2>
      </div>
      
      <ApprovalsClient 
        initialApprovals={approvals || []} 
        userRole={profile?.role || 'funcionario'} 
        userId={user.id}
      />
    </>
  )
}
