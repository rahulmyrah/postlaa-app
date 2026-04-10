#!/usr/bin/env python3
"""
Comprehensive admin login fix script.
1. Checks actual DB schema and user record
2. Generates bcrypt hash safely (no shell $ expansion issues)
3. Fixes providerName='LOCAL', activated=true, isSuperAdmin=true
4. Verifies the fix and tests login via API
"""

import paramiko

def run_cmd(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

def main():
    PASSWORD = "PostlaaAdmin2026!"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=30)
    print("Connected to server")

    # Step 1: Check User table schema
    print("\n=== Step 1: User table columns ===")
    out, err = run_cmd(ssh, r"""docker exec postlaa-postgres psql -U postiz -d postiz_db -c '\d "User"'""")
    print(out)

    # Step 2: Check current user record
    print("\n=== Step 2: Current admin record ===")
    out, err = run_cmd(ssh, """docker exec postlaa-postgres psql -U postiz -d postiz_db -c 'SELECT id, email, "providerName", activated, "isSuperAdmin", LEFT(password, 20) as pw_start FROM "User" WHERE email = $$admin@postlaa.com$$;'""")
    print("OUT:", out)
    if err:
        print("ERR:", err)

    # Step 3: Generate bcrypt hash via Node.js (hash stored in a temp file to avoid $ expansion)
    print("\n=== Step 3: Generate bcrypt hash ===")
    gen_hash_cmd = f"""docker exec postlaa node -e "
const b = require('bcrypt');
b.hash('{PASSWORD}', 10).then(h => {{
  const fs = require('fs');
  fs.writeFileSync('/tmp/admin_hash.txt', h);
  console.log('Hash written: ' + h.substring(0,7) + '...');
}});
" """
    out, err = run_cmd(ssh, gen_hash_cmd, timeout=30)
    print("Hash gen:", out)
    if err:
        print("Hash err:", err)

    # Copy the hash from container to host
    out, err = run_cmd(ssh, "docker cp postlaa:/tmp/admin_hash.txt /tmp/admin_hash.txt")
    bcrypt_hash_raw, err = run_cmd(ssh, "cat /tmp/admin_hash.txt")
    bcrypt_hash = bcrypt_hash_raw.strip()
    print(f"Hash: {bcrypt_hash[:7]}...{bcrypt_hash[-5:]}")

    if not bcrypt_hash.startswith('$2'):
        print("FATAL: Invalid hash. Aborting.")
        ssh.close()
        return

    # Step 4: Build SQL using heredoc (single-quoted delimiter = no $ expansion)
    print("\n=== Step 4: Applying fix to DB ===")
    # Write SQL to a temp file using quoted heredoc - no shell expansion inside
    write_sql_cmd = f"""cat > /tmp/fix_admin.sql << 'ENDSQL'
UPDATE "User"
SET
  "providerName" = 'LOCAL',
  password = '{bcrypt_hash}',
  activated = true,
  "isSuperAdmin" = true
WHERE email = 'admin@postlaa.com'
RETURNING id, email, "providerName", activated, "isSuperAdmin";
ENDSQL"""
    out, err = run_cmd(ssh, write_sql_cmd)
    if err:
        print("Write SQL err:", err)

    # Run the SQL from file
    out, err = run_cmd(ssh, """docker cp /tmp/fix_admin.sql postlaa-postgres:/tmp/fix_admin.sql""")
    out, err = run_cmd(ssh, """docker exec postlaa-postgres psql -U postiz -d postiz_db -f /tmp/fix_admin.sql""")
    print("Update result:", out)
    if err:
        print("Update err:", err)

    # Step 5: Verify
    print("\n=== Step 5: Verification ===")
    out, err = run_cmd(ssh, """docker exec postlaa-postgres psql -U postiz -d postiz_db -c 'SELECT email, "providerName", activated, "isSuperAdmin", LEFT(password, 7) as pw_prefix FROM "User" WHERE email = $$admin@postlaa.com$$;'""")
    print("Verified:", out)

    # Step 6: Test bcrypt comparison in Node
    print("\n=== Step 6: Bcrypt verify test ===")
    test_cmd = f"""docker exec postlaa node -e "
const b = require('bcrypt');
const hash = require('fs').readFileSync('/tmp/admin_hash.txt', 'utf8').trim();
b.compare('{PASSWORD}', hash).then(r => console.log('Match:', r));
" """
    out, err = run_cmd(ssh, test_cmd, timeout=15)
    print("Comparison:", out)
    if err:
        print("Test err:", err)

    # Step 7: Test login via wget (wget is more commonly available than curl in Alpine)
    print("\n=== Step 7: API login test ===")
    wget_cmd = f"""docker exec postlaa wget -q -O - --post-data='{{"email":"admin@postlaa.com","password":"{PASSWORD}","provider":"LOCAL","providerToken":""}}' --header='Content-Type: application/json' http://localhost:3000/auth/login 2>&1 | head -20"""
    out, err = run_cmd(ssh, wget_cmd, timeout=15)
    print("API test:", out)
    if err:
        print("API err:", err)

    # Cleanup
    run_cmd(ssh, "rm -f /tmp/fix_admin.sql /tmp/admin_hash.txt")
    run_cmd(ssh, "docker exec postlaa-postgres rm -f /tmp/fix_admin.sql")
    run_cmd(ssh, "docker exec postlaa rm -f /tmp/admin_hash.txt")

    ssh.close()
    print("\nDone! Try logging in with:")
    print(f"  Email: admin@postlaa.com")
    print(f"  Password: {PASSWORD}")

if __name__ == '__main__':
    main()
