import paramiko

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

print("=== ALL CONTAINERS ===")
out, _ = run(client, 'docker ps --format "{{.Names}}\t{{.Status}}" | sort')
print(out)

print("=== POSTLAA SPECIFIC ===")
out, _ = run(client, 'docker ps -a --format "{{.Names}}\t{{.Status}}" | grep -E "postlaa|temporal"')
print(out or "None found yet")

print("=== COMPOSE STATUS ===")
out, err = run(client, 'cd /opt/postlaa && docker compose ps 2>&1')
print(out or err)

print("=== POSTLAA LOGS (last 20) ===")
out, err = run(client, 'docker logs postlaa --tail 20 2>&1')
print(out or err or "Container not running yet")

client.close()
