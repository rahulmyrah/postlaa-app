import paramiko
import bcrypt

# New password to set
NEW_PASSWORD = "PostlaaAdmin2026!"

# Generate bcrypt hash
hashed = bcrypt.hashpw(NEW_PASSWORD.encode(), bcrypt.gensalt(rounds=10)).decode()
print(f"New password: {NEW_PASSWORD}")
print(f"Hash: {hashed}")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=10)

sql = f"UPDATE \\\"User\\\" SET password = '{hashed}' WHERE email = 'admin@postlaa.com';"
cmd = f"docker exec postlaa-postgres psql -U postiz -d postiz_db -c \"{sql}\""
_, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()
print(out or err or "(no output)")
client.close()

print(f"\n✅ Super admin credentials:")
print(f"   Email:    admin@postlaa.com")
print(f"   Password: {NEW_PASSWORD}")
