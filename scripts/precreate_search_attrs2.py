"""
Pre-create organizationId and postId as Keyword type - fixed IP extraction.
"""
import paramiko, sys, time, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=60):
    sys.stdout.write(f'\n>> {cmd[:120]}\n'); sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r: sys.stdout.write(r + '\n'); sys.stdout.flush()
    return r

def wait(secs, msg=''):
    sys.stdout.write(f'\n[Waiting {secs}s - {msg}]\n'); sys.stdout.flush()
    time.sleep(secs)

# Get temporal container's IP
print('=== Step 1: Get temporal IP ===')
ip_json = run("docker inspect temporal 2>&1")
try:
    data = json.loads(ip_json)
    nets = data[0]['NetworkSettings']['Networks']
    ip = list(nets.values())[0]['IPAddress']
    print(f'  Temporal IP: {ip}')
except Exception as e:
    # Fallback via grep
    ip_raw = run("docker inspect temporal 2>&1 | grep '\"IPAddress\"' | grep -v '\"\"' | head -1")
    ip = ip_raw.split('"')[3] if '"' in ip_raw else ''
    print(f'  Fallback IP: {ip}')

if not ip or 'error' in ip.lower():
    # Try grep from startup logs
    log = run("docker logs temporal 2>&1 | grep 'TEMPORAL_ADDRESS' | head -1")
    # "TEMPORAL_ADDRESS is not set, setting it to 172.21.0.5:7233"
    if ':7233' in log:
        ip = log.split('to ')[-1].split(':')[0].strip()
    print(f'  Log IP: {ip}')

addr = f'{ip}:7233'
print(f'  Using address: {addr}')

print(f'\n=== Step 2: List existing search attrs in postlaa namespace ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute list --address {addr} --namespace postlaa 2>&1"')

print(f'\n=== Step 3: Create organizationId as Keyword ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute create --name organizationId --type Keyword --address {addr} --namespace postlaa 2>&1"')

print(f'\n=== Step 4: Create postId as Keyword ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute create --name postId --type Keyword --address {addr} --namespace postlaa 2>&1"')

print(f'\n=== Step 5: Verify attributes exist ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute list --address {addr} --namespace postlaa 2>&1"')

print('\n=== Step 6: Restart postlaa backend ===')
run('cd /opt/postlaa && docker compose restart postlaa')
wait(35, 'backend startup')

print('\n=== Step 7: Check port 3000 ===')
run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== Step 8: Backend error log (last 3) ===')
run('docker exec postlaa sh -c "tail -3 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -3 ~/.pm2/logs/backend-error.log 2>/dev/null || echo CLEAN" 2>&1')

client.close()
sys.stdout.write('\n=== DONE ===\n'); sys.stdout.flush()
