import paramiko, sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=30):
    sys.stdout.write(f'\n>> {cmd[:120]}\n'); sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r: sys.stdout.write(r + '\n'); sys.stdout.flush()
    return r

# 1. Check all temporal namespaces
run('docker exec temporal sh -c "temporal operator namespace list --address 172.21.0.6:7233 2>&1"')

# 2. What TEMPORAL_NAMESPACE does the backend actually see?
run('docker exec postlaa sh -c "grep TEMPORAL /app/.env 2>/dev/null" 2>&1')
run('docker exec postlaa sh -c "printenv | grep TEMPORAL" 2>&1')

# 3. Check default namespace search attributes
run('docker exec temporal sh -c "temporal operator search-attribute list --address 172.21.0.6:7233 --namespace default 2>&1"')

client.close()
