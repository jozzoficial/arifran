-- 1. Criar a tabela de Memórias (Wall of Fame)
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ligar a Segurança (RLS) na tabela memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (para os clientes verem no site)
CREATE POLICY "Public Memories Read Access" ON memories
  FOR SELECT USING (is_active = true);

-- Permitir gestão total para Admins e Superadmins
CREATE POLICY "Admin Memories Access" ON memories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('superadmin', 'admin')
    )
  );


-- 2. Configurar o Storage (Bucket de Imagens)
-- Inserir o bucket público chamado 'arifran-images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('arifran-images', 'arifran-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir a leitura pública das imagens
CREATE POLICY "Imagens públicas para visualização" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'arifran-images' );

-- Permitir upload de imagens apenas a utilizadores com sessão iniciada (Admins/Funcionários)
CREATE POLICY "Upload permitido apenas a utilizadores autenticados" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'arifran-images' );

-- Permitir edição de imagens aos utilizadores autenticados
CREATE POLICY "Atualização permitida a autenticados" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'arifran-images' );

-- Permitir exclusão de imagens aos utilizadores autenticados
CREATE POLICY "Exclusão permitida a autenticados" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'arifran-images' );
