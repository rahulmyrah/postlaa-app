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

print("=== All server IPs ===")
print(run('ip addr show | grep "inet " | awk "{print $2}"'))

print("\n=== Traefik config/certresolver ===")
print(run('docker inspect traefik-yrqh-traefik-1 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin)[0]; cmd=d[\'Config\'][\'Cmd\']; [print(c) for c in cmd]"'))

print("\n=== Traefik labels on postlaa container ===")
print(run('docker inspect postlaa 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin)[0]; labels=d[\'Config\'][\'Labels\']; [print(k,\'=\',v) for k,v in labels.items() if \'traefik\' in k]"'))

print("\n=== postlaa env (URLs only) ===")
print(run('docker inspect postlaa 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin)[0]; envs=d[\'Config\'][\'Env\']; [print(e) for e in envs if any(x in e for x in [\'URL\',\'DOMAIN\'])]"'))

print("\n=== Is site accessible? ===")
print(run('curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ 2>/dev/null || echo "not reachable on 5000"'))

client.close()
print("Done")
