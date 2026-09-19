-- Enable 2FA for ALL users (existing and future)
UPDATE users SET two_factor_enabled = true;

-- Verify the update
SELECT email, two_factor_enabled FROM users;
