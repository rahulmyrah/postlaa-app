import paramiko
import time

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'
REMOTE_DIR = '/opt/postlaa'

def run(client, cmd, timeout=60):
    print(f"  >> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    combined = (out + err).strip()
    if combined:
        print(combined)
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=15)
print("✓ Connected")

sftp = client.open_sftp()

# Upload updated compose file
print("\n[1/5] Uploading updated docker-compose.yml (JWT fix + dynamicconfig mount)...")
sftp.put(
    r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\docker-compose.production.yaml',
    f'{REMOTE_DIR}/docker-compose.yml'
)
print("  ✓ Compose uploaded")

# Create dynamicconfig dir and upload config
print("\n[2/5] Uploading dynamicconfig...")
try:
    sftp.mkdir(f'{REMOTE_DIR}/dynamicconfig')
except:
    pass  # already exists

sftp.put(
    r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\dynamicconfig\development-sql.yaml',
    f'{REMOTE_DIR}/dynamicconfig/development-sql.yaml'
)
print("  ✓ Dynamicconfig uploaded")
sftp.close()

# Restart temporal (to pick up new dynamicconfig + search attribute limit)
print("\n[3/5] Restarting Temporal to apply new limits...")
run(client, 'docker restart temporal')
print("  Waiting 15s for Temporal to be ready...")
time.sleep(15)

# Restart postlaa container to pick up new JWT_SECRET
print("\n[4/5] Restarting postlaa app (picks up new JWT_SECRET)...")
run(client, f'cd {REMOTE_DIR} && docker compose up -d --force-recreate postlaa 2>&1', timeout=120)
print("  Waiting 20s for backend to start...")
time.sleep(20)

# Final status check
print("\n[5/5] Final status check...")
out, _ = run(client, 'docker exec postlaa ss -tlnp | grep 3000')
if '3000' in out:
    print("\n✅ Backend is UP on port 3000!")
else:
    print("\n⚠ Port 3000 not yet listening - checking logs...")
    out, _ = run(client, 'docker logs postlaa --tail 15 2>&1')

out, _ = run(client, 'docker ps --format "{{.Names}}\t{{.Status}}" | grep -E "postlaa|temporal"')
print("\n=== Container Status ===")
print(out)

client.close()
