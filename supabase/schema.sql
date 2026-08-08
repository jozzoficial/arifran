-- =====================================================
-- AriFran Glamour: Schema Completo da Base de Dados
-- =====================================================
-- INSTRUÇÕES:
-- 1. Abra o SQL Editor no painel do seu projeto Supabase
-- 2. Cole TODO o conteúdo deste ficheiro
-- 3. Execute (Run)
-- 4. O site ficará funcional imediatamente com dados de exemplo
-- =====================================================

-- =====================================================
-- PARTE 1: TIPOS ENUMERADOS
-- =====================================================

CREATE TYPE user_role AS ENUM ('funcionario', 'admin', 'superadmin');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE expense_type AS ENUM ('fixed', 'variable');
CREATE TYPE approval_action AS ENUM ('insert', 'update', 'delete');

-- =====================================================
-- PARTE 2: TABELAS
-- =====================================================

-- 2.1 Perfis de Utilizador (estende auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT '',
    role user_role DEFAULT 'funcionario' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Configurações do Site (chave-valor flexível)
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    description TEXT, -- Descrição para o admin saber o que cada chave faz
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Banners do Hero (secção principal da homepage)
CREATE TABLE hero_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Comprar Agora',
    cta_link TEXT DEFAULT '/shop',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Categorias de Produto
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    price_purchase NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Preço de compra (sensível)
    price_sale NUMERIC(12, 2) NOT NULL DEFAULT 0,     -- Preço de venda (público)
    stock_initial INTEGER NOT NULL DEFAULT 0,
    stock_current INTEGER NOT NULL DEFAULT 0,
    badge_text TEXT,        -- Ex: "Novo", "Vegan", "Promoção"
    badge_type TEXT,        -- Ex: "new", "vegan", "sale"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sold_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Despesas
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_type expense_type DEFAULT 'variable' NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Aprovações Pendentes
CREATE TABLE pending_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action approval_action NOT NULL,
    old_data JSONB,
    new_data JSONB NOT NULL,
    requested_by UUID REFERENCES profiles(id),
    status approval_status DEFAULT 'pending' NOT NULL,
    reviewed_by UUID REFERENCES profiles(id),
    review_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Destaques / Features da loja (secção "Porquê nós")
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'star', -- Nome do ícone Lucide React
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 3: FUNÇÕES E TRIGGERS
-- =====================================================

-- 3.1 Trigger: Criar perfil ao registar novo utilizador
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'funcionario'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3.2 Trigger: Atualizar coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_site_settings_modtime BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_hero_banners_modtime BEFORE UPDATE ON hero_banners FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_approvals_modtime BEFORE UPDATE ON pending_approvals FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_features_modtime BEFORE UPDATE ON features FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3.3 Trigger: Ao registar venda, deduzir stock automaticamente
CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock_current = stock_current - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sale_created
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE PROCEDURE deduct_stock_on_sale();

-- =====================================================
-- PARTE 4: ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: obter papel do utilizador atual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----- PROFILES -----
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_superadmin" ON profiles
  FOR SELECT USING (get_user_role() = 'superadmin');
CREATE POLICY "profiles_update_superadmin" ON profiles
  FOR UPDATE USING (get_user_role() = 'superadmin');

-- ----- SITE_SETTINGS -----
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "site_settings_superadmin_write" ON site_settings
  FOR UPDATE USING (get_user_role() = 'superadmin');
CREATE POLICY "site_settings_superadmin_insert" ON site_settings
  FOR INSERT WITH CHECK (get_user_role() = 'superadmin');
CREATE POLICY "site_settings_superadmin_delete" ON site_settings
  FOR DELETE USING (get_user_role() = 'superadmin');

-- ----- HERO_BANNERS -----
CREATE POLICY "hero_banners_public_read" ON hero_banners
  FOR SELECT USING (true);
CREATE POLICY "hero_banners_superadmin_insert" ON hero_banners
  FOR INSERT WITH CHECK (get_user_role() = 'superadmin');
CREATE POLICY "hero_banners_superadmin_update" ON hero_banners
  FOR UPDATE USING (get_user_role() = 'superadmin');
CREATE POLICY "hero_banners_superadmin_delete" ON hero_banners
  FOR DELETE USING (get_user_role() = 'superadmin');

-- ----- CATEGORIES -----
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);
CREATE POLICY "categories_superadmin_insert" ON categories
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "categories_superadmin_update" ON categories
  FOR UPDATE USING (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "categories_superadmin_delete" ON categories
  FOR DELETE USING (get_user_role() = 'superadmin');

-- ----- PRODUCTS -----
-- Leitura pública (apenas campos não-sensíveis controlados no frontend)
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);
CREATE POLICY "products_admin_insert" ON products
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "products_admin_update" ON products
  FOR UPDATE USING (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "products_superadmin_delete" ON products
  FOR DELETE USING (get_user_role() = 'superadmin');

-- ----- SALES -----
CREATE POLICY "sales_authenticated_read" ON sales
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_authenticated_insert" ON sales
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sold_by);

-- ----- EXPENSES -----
CREATE POLICY "expenses_admin_read" ON expenses
  FOR SELECT USING (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "expenses_admin_insert" ON expenses
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "expenses_superadmin_update" ON expenses
  FOR UPDATE USING (get_user_role() = 'superadmin');
CREATE POLICY "expenses_superadmin_delete" ON expenses
  FOR DELETE USING (get_user_role() = 'superadmin');

-- ----- PENDING_APPROVALS -----
CREATE POLICY "approvals_own_read" ON pending_approvals
  FOR SELECT USING (auth.uid() = requested_by OR get_user_role() = 'superadmin');
CREATE POLICY "approvals_admin_insert" ON pending_approvals
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "approvals_superadmin_update" ON pending_approvals
  FOR UPDATE USING (get_user_role() = 'superadmin');

-- ----- FEATURES -----
CREATE POLICY "features_public_read" ON features
  FOR SELECT USING (true);
CREATE POLICY "features_superadmin_insert" ON features
  FOR INSERT WITH CHECK (get_user_role() = 'superadmin');
CREATE POLICY "features_superadmin_update" ON features
  FOR UPDATE USING (get_user_role() = 'superadmin');
CREATE POLICY "features_superadmin_delete" ON features
  FOR DELETE USING (get_user_role() = 'superadmin');

-- =====================================================
-- PARTE 5: DADOS INICIAIS (SEED)
-- =====================================================

-- 5.1 Configurações do Site
INSERT INTO site_settings (key, value, description) VALUES
  ('store_name', 'AriFran Glamour', 'Nome da loja'),
  ('store_slogan', 'Cosméticos de Luxo', 'Slogan da loja'),
  ('whatsapp_number', '+244936356057', 'Número do WhatsApp Business (com código do país)'),
  ('tiktok_url', 'https://www.tiktok.com/@arifran_glam', 'Link do perfil TikTok'),
  ('email_contact', 'arifranglam@gmail.com', 'E-mail de contacto'),
  ('currency', 'KZS', 'Moeda utilizada na loja'),
  ('fixed_rent', '10000', 'Renda fixa mensal em KZS');

-- 5.2 Banner Hero
INSERT INTO hero_banners (title, subtitle, image_url, cta_text, cta_link, is_active, display_order) VALUES
  (
    'Beleza que Reflete sua Essência',
    'Descubra uma curadoria exclusiva de cosméticos premium que celebram a sua identidade única com sofisticação e cuidado.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC-AAVJL5J4WIy0dxQPotUj9y6Ns0ICeha9cs3Y072bj8scuQpc7b83zxX6hUfZT3uKhp-gMblFj-Y7TPCplREpVrAv62q4bD-7c4XkrdFKva-Ner2ngk6Z7-jH0iDqoUnHJ7o-9vwCYwRguUtwtxPn4RoQqs3G6UtTMfVtIRZJ6_OYU6Fh0rZ8hCpjimUFCAY82RbFmMOeyHR7d6GKk5GqIywR_VBJEAOt8SHxOLLzsjo_GicJXiAEseSJqAzpsb1ymqWDCOdmb9E',
    'Comprar Agora',
    '/shop',
    true,
    1
  );

-- 5.3 Categorias
INSERT INTO categories (name, slug, image_url, display_order) VALUES
  ('Body Oils', 'body-oils', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzRDU_nmeCYULxJLPVSU4jpm3hLlN4JK-5ch3fDbjaNcCA2CzgYtIcYUKeOD5fQNyayUFn2WyLxGq-DPsQW1KaSzg3NLlhJ8Kh3gvScCSsd13JOTEqFBa6h1CXu8H4WkpOLxn9-0m-M3en1h2p0m0-mGlsdhImuMuGHX5rNcrtiq3yDHEO3QVIAnNG9p_DbkHjypGbZJbpAUKvqq5D86oF4wwIiHhNY1JO8HzMsom0v-oDRfkzwia4GV3dqPmcpAapRnqBULJkG7I', 1),
  ('Creams', 'creams', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBikJaz6-3_nQJjFX0rWOen_uPyv56JPCj0QAAfS6VFB_oNnxyjBvycm3jzxLvKenPlN4FaIkXIbOg1JC4lb-ZS5cnvrbDGzSihTSKg2kbIEaqmiWy9ALHDi0dabxmUGMQFype96MP-tYGKdQ_wx4iXkfFCTbuNdn8YLsibPs4GTuXyIUuPdP9nPg5rMky2M6th7INWzojmO0XFNXjUZXqDnVTxvjKS6sBBz7hLB4iMcgCsXRUV0fGPLuyF2xgMgDigo2yTkFCJmQg', 2),
  ('Gels', 'gels', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXik8mrNazBFHTfOTE1suJt9Te8vW2wXDmdw85hX8p1iWf2YKaDw-5_Ww1-CEvtimjQSiBg7oWDjIrwGe2SQjenQcTGqM4TBz8LV5dZu7t6vdy11KrxuJTnirQcn4tZ6nCpvano__J5QfLBWH7mv01OGtvQmsn4W610ZcxLYXFvUJL_JRW8cxqxLF2sKx5yZujW4ve_FCL49Qoz84OCucE0HrGx0Cf-xVErMauzvEw6Bih8Of7GAFP9-wzQdpwZXH8mFmvsgwk57Y', 3),
  ('Cosmetics', 'cosmetics', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKYUyUeKKWr5sP41v-F9-WeW6GKUiwPhFKeU4Omo1BvbzFIl44M7yxLzW8z2VCnKwajwqCbXidLKL_vYQbNruOZiCkJwvKcwaGlzHDfEEcqK_5JvYFpCrKWOfjr97iXttK-ay3Jtw82gzUi2uebXPyH_e9iOvs1EnSDzHqNQKUWUdgKQyr2081qvROtdqiHW-NwyQc7gf_1vebr2P4bS6KB80LkEK65olGsMSv9MvrLlpeOwZZb_TgboBbjRfdW3reRkxW3Ww8nYU', 4);

-- 5.4 Produtos de Exemplo
-- (Usamos subconsulta para associar à categoria correta pelo slug)
INSERT INTO products (name, description, category_id, image_url, price_purchase, price_sale, stock_initial, stock_current, badge_text, badge_type, is_active) VALUES
  (
    'Orchid Essence Oil',
    'Óleo corporal premium com essência de orquídea, para uma pele radiante e hidratada. Fórmula leve e de rápida absorção.',
    (SELECT id FROM categories WHERE slug = 'body-oils'),
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBOxzsm-nfacKNu16XchmUYD-1Ly3bXyPzbXHnb5jzZxCvNAFWZ-dWVZEQvyNRkrgDMtx0triBHOvO6CGNdNiEYdYp9T6oUIc1gCIuSHiknGnV5oMn0otmibn1qiPg2G2VUJ7RiPABB0w5CnPPx_pv9dlZGJt5PeEoMZBsW8F-JDOmp46wMp13aiu0VeOamxoH17UT4r79Ud5jmti5Hnik6TuAfSUB6lWVFDIe08ChZkYoggGIGkko1vz2GHojYNMOcHnXRR-Syuyo',
    7500, 12500, 24, 24, 'Novo', 'new', true
  ),
  (
    'Glamour Hydra Cream',
    'Creme hidratante de luxo com fórmula enriquecida em vitamina E e ácido hialurónico. Ideal para todos os tipos de pele.',
    (SELECT id FROM categories WHERE slug = 'creams'),
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDpvWTEqb-oIRbZF3kQuPnMTLYt0UT7jds09GEwY1Qfo5bPlrJkUxZGpWYnrWQLkq2n4WpMxpFRpg6LWaj7u4r5796XwJTSAboY8itPXFMWtk3f-MnzAeFG_NvfapIrnitj10AaRsEm28kPYzQQDt2vXdxmQWFeie23FRhbfmlzLrifXbIKGq2RKt9NfChD_B54FMIA8Xjqwi6BomuYhpXJPPDuBY1DffaXFWuOROPWYyp9-JF71bxTSRiZ_cP01JYpac_saQdEgWQ',
    5800, 9800, 36, 36, NULL, NULL, true
  ),
  (
    'Rejuvenate Lotion',
    'Loção corporal rejuvenescedora com ingredientes 100% veganos. Fórmula nutritiva que devolve a elasticidade à pele.',
    (SELECT id FROM categories WHERE slug = 'creams'),
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDiWxzu3x_f6mHd95RwFlLz806nugCFUJxYuc3YilYsn6QzCdn4Na9f8DcEfdLA47MdUySp2ZUqWnCrQiEHdAlHuT17JbxMUrqpxmmyAwysQi2HB6LXlESHhlAkEyqXj_pTcx-bC8ZAiwhWD5woCiQhCCGbbbljmz3ST7gwQi6fbG2xu1v8vu_vOrIrOrsM8AYhMddmFeWRnAAbLyffUrm2z0seYJB8nlCCrvl_UGFtdL6KuvdS_NUd4dbz_4wtqg1XW1dm_3a_rxg',
    9000, 15000, 18, 18, 'Vegan', 'vegan', true
  ),
  (
    'Glow Lip Gloss Kit',
    'Kit de glosses labiais com acabamento brilhante e hidratante. Inclui 3 tons universais que realçam qualquer tom de pele.',
    (SELECT id FROM categories WHERE slug = 'cosmetics'),
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDHT_Dijn1PBFwj4TA87ow6F8INLeWOVWdz32ydIVvAh508Qa8c6yBQ2vi5K8yWvp6eyR-D0F1tTwipLILXTOUMMVBCR6XBjTd18TY6vAZV5iePuG5bMxyVeSlFMadxpIPpdC9D8QrpGTTLjMGZ4FvrkRJ-4nmT-lqyI4zNX7828LOYWRUIEEjVC90CP8qx3VLw-bY2e5a3JuJr2PvbuLmvj84Ks0eUKZyi6Apd-8MH7LXqEWy6aYPMYFwSwm2J-ceFdDioj4rbTKo',
    5000, 8500, 30, 30, NULL, NULL, true
  );

-- 5.5 Features / Destaques da Loja
INSERT INTO features (title, description, icon_name, display_order) VALUES
  ('Entrega Rápida', 'Logística ágil para que seus produtos cheguem com rapidez e segurança em sua porta.', 'truck', 1),
  ('Produtos Originais', 'Garantia absoluta de autenticidade em cada item da nossa curadoria de luxo.', 'shield-check', 2),
  ('Suporte Personalizado', 'Nossa equipe de especialistas está pronta para auxiliar sua jornada de beleza.', 'headphones', 3);

-- 5.6 Despesa Fixa Mensal (Renda)
INSERT INTO expenses (description, amount, expense_type, is_recurring) VALUES
  ('Renda fixa mensal da loja', 10000, 'fixed', true);

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
-- Após executar este ficheiro:
-- 1. Crie um utilizador no Supabase Auth (Authentication > Users > Add User)
-- 2. Depois, no SQL Editor, promova-o a superadmin:
--    UPDATE profiles SET role = 'superadmin' WHERE id = 'SEU_USER_ID_AQUI';
-- =====================================================
