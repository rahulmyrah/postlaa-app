"""
Final fix:
1. Pre-create organizationId + postId as Keyword in 'default' namespace (no Text limit)
2. Upload updated compose (reverted to TEMPORAL_NAMESPACE=default)
3. Force-recreate postlaa container to pick up env changes
"""
import paramiko, sys, time

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

def upload(local, remote):
    sftp = client.open_sftp()
    sftp.put(local, remote)
    sftp.close()
    sys.stdout.write(f'  Uploaded {local} -> {remote}\n'); sys.stdout.flush()

TEMPORAL_IP = '172.21.0.6'
ADDR = f'{TEMPORAL_IP}:7233'

print('=== Step 1: Pre-create organizationId as Keyword in default namespace ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute create --name organizationId --type Keyword --address {ADDR} --namespace default 2>&1"')

print('\n=== Step 2: Pre-create postId as Keyword in default namespace ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute create --name postId --type Keyword --address {ADDR} --namespace default 2>&1"')

print('\n=== Step 3: Verify both exist in default namespace ===')
run(f'docker exec temporal sh -c "temporal operator search-attribute list --address {ADDR} --namespace default 2>&1" | grep -E "organizationId|postId|CustomString|CustomText"')

print('\n=== Step 4: Upload updated compose (TEMPORAL_NAMESPACE=default) ===')
upload(
    r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\docker-compose.production.yaml',
    '/opt/postlaa/docker-compose.yml'
)
run('grep TEMPORAL_NAMESPACE /opt/postlaa/docker-compose.yml')

print('\n=== Step 5: Force-recreate postlaa (picks up env vars properly) ===')
run('cd /opt/postlaa && docker compose up -d --force-recreate postlaa')
wait(35, 'backend startup on port 3000')

print('\n=== Step 6: Check port 3000 ===')
result = run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== Step 7: PM2 status ===')
run('docker exec postlaa sh -c "pm2 list 2>/dev/null" 2>&1')

print('\n=== Step 8: Backend error log (most recent) ===')
run('docker exec postlaa sh -c "tail -3 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -3 ~/.pm2/logs/backend-error.log 2>/dev/null || echo CLEAN_OR_NO_FILE" 2>&1')

print('\n=== Step 9: Backend output log (last lines - should show NestJS up) ===')
run('docker exec postlaa sh -c "tail -10 /root/.pm2/logs/backend-out.log 2>/dev/null || tail -10 ~/.pm2/logs/backend-out.log 2>/dev/null || echo NO_LOG" 2>&1')

if 'NOT_LISTENING' not in result:
    print('\n=== BACKEND IS UP ON PORT 3000! ===')
    print('\n=== Step 10: Quick HTTP smoke test ===')
    run('docker exec postlaa sh -c "wget -qO- http://localhost:3000/api/healthz 2>&1 || curl -s http://localhost:3000/api/healthz 2>&1"')

client.close()
sys.stdout.write('\n=== DONE ===\n'); sys.stdout.flush()
