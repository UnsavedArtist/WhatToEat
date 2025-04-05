-- Query all tables
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Accounts', COUNT(*) FROM "Account"
UNION ALL
SELECT 'Sessions', COUNT(*) FROM "Session"
UNION ALL
SELECT 'VerificationTokens', COUNT(*) FROM "VerificationToken";

-- Show User details
SELECT id, name, email, "emailVerified", image 
FROM "User"; 