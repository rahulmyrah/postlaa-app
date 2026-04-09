import paramiko, sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=30):
    sys.stdout.write(f'\n>> {cmd[:120]}\n'); sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r: sys.stdout.write(r + '\n'); sys.stdout.flush()
    return r

# Password: Admin@123456 (bcrypt hash)
BCRYPT = r'$2b$10$X8.QEECmdyqUBeDwaqDNTuxw88zXWLkXlwmQJkiX7P23KxdVG1sxe'

sql = f"""DO $$
DECLARE
  uid uuid := gen_random_uuid();
  oid uuid := gen_random_uuid();
BEGIN
  DELETE FROM "User" WHERE email = 'admin@postlaa.com';
  INSERT INTO "User" (id, email, password, "providerName", "providerId", timezone, activated, "isSuperAdmin", "createdAt", "updatedAt", "lastReadNotifications", "lastOnline")
  VALUES (uid, 'admin@postlaa.com', '{BCRYPT}', 'LOCAL', '', 0, true, true, now(), now(), now(), now());
  INSERT INTO "Organization" (id, name, "createdAt", "updatedAt")
  VALUES (oid, 'Postlaa Admin', now(), now());
  INSERT INTO "UserOrganization" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), uid, oid, 'SUPERADMIN', now(), now());
  RAISE NOTICE 'SuperAdmin created: uid=%, oid=%', uid, oid;
END $$;
"""

sftp = client.open_sftp()
with sftp.open('/tmp/create_admin.sql', 'w') as f:
    f.write(sql)
sftp.close()

print('=== Create SuperAdmin ===')
run('docker exec -i postlaa-postgres psql -U postiz -d postiz_db < /tmp/create_admin.sql 2>&1')

print('\n=== Verify admin ===')
run('docker exec postlaa-postgres psql -U postiz -d postiz_db -c "SELECT email, activated, \\\"isSuperAdmin\\\", id FROM \\\"User\\\" WHERE email = \'admin@postlaa.com\';" 2>&1')

client.close()
sys.stdout.write('\n=== DONE ===\n'); sys.stdout.flush()
