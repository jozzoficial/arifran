import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Verifica se o user está com sessão iniciada
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  // Limpa cache e redireciona para o login
  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}
