-- Disable email confirmation for development environment
-- This allows users to sign in immediately after signup without email verification

-- Update auth.config to disable email confirmation
UPDATE auth.config
SET 
    disable_confirm_email = true,
    updated_at = now()
WHERE id = 'auth.config';

-- If the config doesn't exist, insert it
INSERT INTO auth.config (id, disable_confirm_email, created_at, updated_at)
VALUES ('auth.config', true, now(), now())
ON CONFLICT (id) DO UPDATE
SET 
    disable_confirm_email = true,
    updated_at = now();