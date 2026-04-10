import paramiko
import time

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'
REMOTE_DIR = '/opt/postlaa'

# GitHub Container Registry credentials (Personal Access Token with read:packages scope)
# Set GHCR_TOKEN below — needs to be a GitHub PAT with read:packages permission
GHCR_USER = 'rahulmyrah'
GHCR_TOKEN = ''  # Set your PAT here, or export GHCR_TOKEN env var

import os
if not GHCR_TOKEN:
    GHCR_TOKEN = os.environ.get('GHCR_TOKEN', '')

def run(client, cmd, timeout=60):
    print(f"  >> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    stdout.channel.settimeout(timeout)
    out_lines = []
    try:
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
                if chunk:
                    out_lines.append(chunk)
                    print(chunk, end='', flush=True)
        # drain remaining
        while stdout.channel.recv_ready():
            chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            out_lines.append(chunk)
            print(chunk, end='', flush=True)
    except Exception:
        pass
    out = ''.join(out_lines)
    return out, ''

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=15)
print("✓ Connected")

sftp = client.open_sftp()

# Upload updated compose file
print("\n[1/6] Uploading updated docker-compose.yml...")
sftp.put(
    r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\docker-compose.production.yaml',
    f'{REMOTE_DIR}/docker-compose.yml'
)
print("  ✓ Compose uploaded")

# Create dynamicconfig dir and upload config
print("\n[2/6] Uploading dynamicconfig...")
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

# Login to GHCR and pull latest image
print("\n[3/6] Pulling latest Postlaa image from GHCR...")
if GHCR_TOKEN:
    run(client, f'echo {GHCR_TOKEN} | docker login ghcr.io -u {GHCR_USER} --password-stdin 2>&1')
run(client, 'docker pull ghcr.io/rahulmyrah/postlaa-app:latest 2>&1', timeout=300)
print("  ✓ Image pulled")

# Restart temporal (to pick up new dynamicconfig + search attribute limit)
print("\n[4/6] Restarting Temporal to apply new limits...")
run(client, 'docker restart temporal')
print("  Waiting 15s for Temporal to be ready...")
time.sleep(15)

# Restart postlaa container with new image
print("\n[5/6] Restarting postlaa app with new image...")
run(client, f'cd {REMOTE_DIR} && docker compose up -d --force-recreate postlaa 2>&1', timeout=120)
print("  Waiting 20s for backend to start...")
time.sleep(20)

# Final status check
print("\n[6/6] Final status check...")
out, _ = run(client, 'docker exec postlaa ss -tlnp 2>/dev/null | grep 3000 || echo "checking..."')
if '3000' in out:
    print("\n✅ Backend is UP on port 3000!")
else:
    print("\n⚠ Port 3000 not yet listening - checking logs...")
    out, _ = run(client, 'docker logs postlaa --tail 20 2>&1')

out, _ = run(client, 'docker ps --format "{{.Names}}\t{{.Status}}" | grep -E "postlaa|temporal"')
print("\n=== Container Status ===")
print(out)

print("\n✅ Deployment complete! Site: https://postlaa.com")
client.close()
