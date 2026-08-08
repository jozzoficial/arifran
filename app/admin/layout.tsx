import { type ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex">
      <AdminSidebar 
        userName={profile.full_name || user.email || 'Utilizador'} 
        userRole={profile.role} 
      />
      <main className="md:ml-64 flex-1 p-6 md:p-margin-desktop min-w-0 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  )
}
