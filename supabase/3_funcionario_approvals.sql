-- =====================================================
-- AriFran Glamour: Update pending_approvals RLS
-- =====================================================

-- 1. Apagar as políticas antigas para a tabela pending_approvals
DROP POLICY IF EXISTS "approvals_own_read" ON pending_approvals;
DROP POLICY IF EXISTS "approvals_admin_insert" ON pending_approvals;
DROP POLICY IF EXISTS "approvals_superadmin_update" ON pending_approvals;

-- 2. Leitura: Funcionário vê os seus próprios pedidos. Admin e Superadmin veem todos.
CREATE POLICY "approvals_read" ON pending_approvals
  FOR SELECT USING (auth.uid() = requested_by OR get_user_role() IN ('admin', 'superadmin'));

-- 3. Inserção: Qualquer pessoa pode criar um pedido (desde que associe o seu próprio ID)
CREATE POLICY "approvals_insert" ON pending_approvals
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

-- 4. Atualização: Apenas Admins e Superadmins podem aprovar ou rejeitar (update)
CREATE POLICY "approvals_update" ON pending_approvals
  FOR UPDATE USING (get_user_role() IN ('admin', 'superadmin'));

-- 5. Função de utilidade (se necessário no frontend)
-- Como a tabela expenses bloqueia inserção para funcionários,
-- Apenas Admins e Superadmins poderão criar as expenses após aprovar.
