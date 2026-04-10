import paramiko

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=15)

def run(cmd):
    _, out, err = client.exec_command(cmd, timeout=30)
    return (out.read() + err.read()).decode()

print("=== Containers ===")
print(run('docker ps --format "{{.Names}}\t{{.Status}}"'))

print("\n=== DNS postlaa.com ===")
print(run('getent hosts postlaa.com 2>/dev/null || dig +short postlaa.com 2>/dev/null || nslookup postlaa.com 2>/dev/null | tail -4'))

print("\n=== Traefik ===")
print(run('docker ps --format "{{.Names}}" | grep -i traefik || echo "no traefik container"'))
print(run('ls /etc/traefik 2>/dev/null || ls /opt/traefik 2>/dev/null || echo "no traefik config found"'))

print("\n=== Server IP ===")
print(run('curl -s ifconfig.me 2>/dev/null || hostname -I | awk "{print $1}"'))

client.close()
print("Done")
