import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Camera } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function MemoriesPage() {
  const supabase = await createClient()

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-surface-container-lowest py-20 px-6 text-center border-b border-outline-variant/30">
          <div className="max-w-container-max mx-auto">
            <h1 className="font-display-lg text-display-lg text-primary mb-6 tracking-tight">Wall of Fame</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Momentos especiais e memórias inesquecíveis partilhadas com os nossos clientes. 
              A vossa beleza é a nossa maior inspiração.
            </p>
          </div>
        </section>

        {/* Masonry / Grid Gallery */}
        <section className="py-20 px-6 md:px-margin-desktop max-w-container-max mx-auto">
          {!memories || memories.length === 0 ? (
            <div className="text-center py-24 bg-surface rounded-2xl border border-outline-variant/30">
              <Camera className="w-16 h-16 text-outline-variant mx-auto mb-6 opacity-50" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Ainda sem memórias</h3>
              <p className="text-on-surface-variant">A nossa galeria está à espera da sua fotografia maravilhosa!</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {memories.map((memory) => (
                <div key={memory.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <div className="relative w-full overflow-hidden">
                    {/* The image height adjusts to content in masonry layout, so we use object-cover with auto height */}
                    <img 
                      src={memory.image_url} 
                      alt={memory.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white font-label-bold text-lg mb-1 drop-shadow-md">
                      {memory.title}
                    </p>
                    <p className="text-white/80 text-xs font-body-md uppercase tracking-widest drop-shadow-md">
                      {new Date(memory.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
