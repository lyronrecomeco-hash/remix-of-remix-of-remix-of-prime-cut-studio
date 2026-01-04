-- Função para deduzir créditos do usuário Genesis
CREATE OR REPLACE FUNCTION public.deduct_genesis_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Buscar saldo atual
    SELECT balance INTO v_current_balance
    FROM genesis_credits
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se tem saldo suficiente
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduzir créditos
    UPDATE genesis_credits
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Registrar transação
    INSERT INTO genesis_credit_transactions (user_id, amount, type, description)
    VALUES (p_user_id, -p_amount, 'debit', 'Consumo automático de créditos');
    
    RETURN TRUE;
END;
$$;