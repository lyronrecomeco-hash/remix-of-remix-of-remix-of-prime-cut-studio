-- Create transactions table for Genesis credits
CREATE TABLE IF NOT EXISTS public.genesis_credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.genesis_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund', 'subscription')),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genesis_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions"
ON public.genesis_credit_transactions
FOR SELECT
USING (user_id IN (
    SELECT id FROM public.genesis_users WHERE auth_user_id = auth.uid()
));

-- Create index for performance
CREATE INDEX idx_genesis_credit_transactions_user_id ON public.genesis_credit_transactions(user_id);
CREATE INDEX idx_genesis_credit_transactions_created_at ON public.genesis_credit_transactions(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.genesis_credit_transactions;