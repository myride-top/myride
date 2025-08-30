-- Add support tracking fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_supported_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_supporter BOOLEAN DEFAULT FALSE;

-- Create support_transactions table
CREATE TABLE IF NOT EXISTS support_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0), -- Amount in cents
    payment_intent_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_transactions_supporter_id ON support_transactions(supporter_id);
CREATE INDEX IF NOT EXISTS idx_support_transactions_creator_id ON support_transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_support_transactions_status ON support_transactions(status);
CREATE INDEX IF NOT EXISTS idx_support_transactions_created_at ON support_transactions(created_at);

-- Create unique constraint to prevent duplicate support transactions
CREATE UNIQUE INDEX IF NOT EXISTS idx_support_transactions_unique_supporter_creator 
ON support_transactions(supporter_id, creator_id, payment_intent_id);

-- Add RLS policies for support_transactions table
ALTER TABLE support_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own support transactions (as supporter)
CREATE POLICY "Users can view their own support transactions" ON support_transactions
    FOR SELECT USING (auth.uid() = supporter_id);

-- Users can view support transactions where they are the creator
CREATE POLICY "Creators can view support transactions" ON support_transactions
    FOR SELECT USING (auth.uid() = creator_id);

-- Only authenticated users can insert support transactions
CREATE POLICY "Authenticated users can create support transactions" ON support_transactions
    FOR INSERT WITH CHECK (auth.uid() = supporter_id);

-- Only system/admin can update support transaction status
CREATE POLICY "Only system can update support transactions" ON support_transactions
    FOR UPDATE USING (false);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for support_transactions table
CREATE TRIGGER update_support_transactions_updated_at 
    BEFORE UPDATE ON support_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
