"""
Verify backend is up and create SuperAdmin on production.
"""
import paramiko, sys, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=30):
    sys.stdout.write(f'\n>> {cmd[:120]}\n'); sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r: sys.stdout.write(r + '\n'); sys.stdout.flush()
    return r

time.sleep(5)

print('=== Port 3000 check ===')
run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== HTTP health check ===')
run('docker exec postlaa sh -c "curl -sf http://localhost:3000/api/healthz 2>&1 || wget -qO- http://localhost:3000/ 2>&1 | head -5"')

print('\n=== Create SuperAdmin (admin@postlaa.com / Admin@123456) ===')
# bcrypt hash of Admin@123456 generated locally
BCRYPT = '$2b$10$X8.QEECmdyqUBeDwaqDNTuxw88zXWLkXlwmQJkiX7P23KxdVG1sxe'
sql = f"""
DO $$
DECLARE
  uid uuid := gen_random_uuid();
  oid uuid := gen_random_uuid();
BEGIN
  INSERT INTO "User" (id, email, password, "providerName", "providerId", timezone, activated, "isSuperAdmin", "createdAt", "updatedAt", "lastReadNotifications", "lastOnline")
  VALUES (uid, 'admin@postlaa.com', '{BCRYPT}', 'LOCAL', '', 0, true, true, now(), now(), now(), now())
  ON CONFLICT (email) DO UPDATE SET "isSuperAdmin" = true, password = '{BCRYPT}', activated = true RETURNING id INTO uid;
  IF uid IS NOT NULL THEN
    SELECT id INTO uid FROM "User" WHERE email = 'admin@postlaa.com';
    INSERT INTO "Organization" (id, name, "createdAt", "updatedAt") VALUES (oid, 'Postlaa Admin', now(), now());
    INSERT INTO "UserOrganization" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), uid, oid, 'SUPERADMIN', now(), now())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
"""
run(f"docker exec postlaa-postgres psql -U postiz -d postiz_db <<'SQLEOF'\n{sql}\nSQLEOF")

print('\n=== Verify admin user created ===')
run('docker exec postlaa-postgres psql -U postiz -d postiz_db -c "SELECT email, activated, \\"isSuperAdmin\\" FROM \\"User\\" WHERE email = \'admin@postlaa.com\';"')

client.close()
sys.stdout.write('\n=== DONE ===\n'); sys.stdout.flush()
