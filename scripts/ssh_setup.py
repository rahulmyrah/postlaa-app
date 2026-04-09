import paramiko
import sys
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
print("✓ Connected to server")

# Step 1: Check networks and containers
print("\n=== DOCKER NETWORKS ===")
out, _ = run(client, 'docker network ls --format "{{.Name}}"')
print(out)

print("=== RUNNING CONTAINERS ===")
out, _ = run(client, 'docker ps --format "{{.Names}}"')
print(out)

# Step 2: Check Traefik config
print("=== TRAEFIK CONFIG ===")
out, err = run(client, 'docker exec traefik-yrqh-traefik-1 cat /etc/traefik/traefik.yml 2>/dev/null || echo "NO_YML"')
print(out or err)

out, err = run(client, 'docker exec traefik-yrqh-traefik-1 cat /etc/traefik/traefik.yaml 2>/dev/null || echo "NO_YAML"')
print(out or err)

# Check traefik command args for certresolver
out, err = run(client, 'docker inspect traefik-yrqh-traefik-1 2>/dev/null | grep -i "certresolver\|letsencrypt\|acme\|certificat" | head -20')
print("=== CERTRESOLVER HINTS ===")
print(out or err or "none found")

# Check traefik network name
out, err = run(client, 'docker inspect traefik-yrqh-traefik-1 2>/dev/null | grep -A2 "Networks" | head -20')
print("=== TRAEFIK NETWORKS ===")
print(out or err)

client.close()
print("\nDone gathering info.")
