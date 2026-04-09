import paramiko
import time

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'

def run(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=15)

# Check if backend port 3000 is listening
print("=== PORT 3000 STATUS ===")
out, _ = run(client, 'docker exec postlaa ss -tlnp | grep 3000')
print(out or "Port 3000 NOT listening - backend crashed")

# Check PM2 status
print("\n=== PM2 STATUS ===")
out, _ = run(client, 'docker exec postlaa pm2 list')
print(out)

# Check if JWT_SECRET got set correctly
print("\n=== JWT_SECRET VALUE ===")
out, _ = run(client, 'docker exec postlaa env | grep JWT_SECRET')
print(out or "JWT_SECRET not set!")

# Check full backend error log
print("\n=== BACKEND ERROR LOG ===")
out, _ = run(client, 'docker exec postlaa cat /root/.pm2/logs/backend-error.log 2>/dev/null | tail -20')
print(out or "(empty)")

# Check backend out log 
print("\n=== BACKEND OUT LOG (last 10) ===")
out, _ = run(client, 'docker exec postlaa cat /root/.pm2/logs/backend-out.log 2>/dev/null | tail -10')
print(out or "(empty)")

client.close()
