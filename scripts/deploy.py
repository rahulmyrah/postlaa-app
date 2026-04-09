import paramiko
import time
import sys

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'
COMPOSE_LOCAL = r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\docker-compose.production.yaml'
REMOTE_DIR = '/opt/postlaa'
REMOTE_COMPOSE = '/opt/postlaa/docker-compose.yml'

def run(client, cmd, timeout=60):
    print(f"  >> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out.strip())
    if err.strip():
        print(f"  [stderr] {err.strip()}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=15)
print("✓ Connected to server")

# Step 1: Create deployment directory
print("\n[1/5] Creating /opt/postlaa directory...")
run(client, f'mkdir -p {REMOTE_DIR}')

# Step 2: Upload compose file
print("\n[2/5] Uploading docker-compose.yml...")
sftp = client.open_sftp()
sftp.put(COMPOSE_LOCAL, REMOTE_COMPOSE)
sftp.close()
print("  ✓ Uploaded successfully")

# Step 3: Verify DNS resolves (warn if not)
print("\n[3/5] Checking DNS for posts.aitoolsfactory.com...")
out, _ = run(client, 'getent hosts posts.aitoolsfactory.com 2>/dev/null || echo "DNS_NOT_RESOLVED"')
if 'DNS_NOT_RESOLVED' in out or not out.strip():
    print("  ⚠ WARNING: posts.aitoolsfactory.com does not resolve yet.")
    print("  ⚠ Add an A record: posts.aitoolsfactory.com → 89.116.228.186")
    print("  ⚠ Continuing anyway - Traefik SSL cert will be issued once DNS is set.")
else:
    print(f"  ✓ DNS resolves: {out.strip()}")

# Step 4: Deploy
print("\n[4/5] Deploying all containers...")
out, err = run(client, f'cd {REMOTE_DIR} && docker compose up -d 2>&1', timeout=180)

# Step 5: Check status
print("\n[5/5] Checking container status...")
time.sleep(8)
out, _ = run(client, 'docker ps --format "{{.Names}}\\t{{.Status}}" | grep -E "postlaa|temporal"')

print("\n✓ Deployment complete!")
print("\nNext step: Register at https://posts.aitoolsfactory.com/auth")
print("Then run scripts/make_admin.py to create SuperAdmin")

client.close()
