"""
Pre-create organizationId and postId as Keyword type in the postlaa Temporal namespace.
The backend's TemporalRegister.onModuleInit() only checks if the key EXISTS, not its type.
So if they already exist (even as Keyword instead of Text), it skips registration = no crash.
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

# Get temporal container's IP on the internal network
print('=== Step 1: Get temporal container IP ===')
ip = run("docker inspect temporal --format '{{ (index .NetworkSettings.Networks \"postlaa-internal\").IPAddress }}'")
ip = ip.strip()
print(f'  Temporal IP: {ip}')

if not ip:
    # Fallback: try default network
    ip = run("docker inspect temporal --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'")
    ip = ip.strip().split('\n')[0]
    print(f'  Fallback IP: {ip}')

addr = f'{ip}:7233'

print(f'\n=== Step 2: List search attributes on postlaa namespace (addr={addr}) ===')
run(f"docker exec temporal temporal operator search-attribute list --address {addr} --namespace postlaa 2>&1")

print('\n=== Step 3: Create organizationId as Keyword type ===')
r = run(f"docker exec temporal temporal operator search-attribute create --name organizationId --type Keyword --address {addr} --namespace postlaa 2>&1")

print('\n=== Step 4: Create postId as Keyword type ===')
r = run(f"docker exec temporal temporal operator search-attribute create --name postId --type Keyword --address {addr} --namespace postlaa 2>&1")

print('\n=== Step 5: Verify both attributes now exist ===')
run(f"docker exec temporal temporal operator search-attribute list --address {addr} --namespace postlaa 2>&1")

print('\n=== Step 6: Restart postlaa backend ===')
run('cd /opt/postlaa && docker compose restart postlaa')
wait(35, 'backend startup')

print('\n=== Step 7: Check port 3000 ===')
run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== Step 8: Backend error log (most recent) ===')
run('docker exec postlaa sh -c "tail -5 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -5 ~/.pm2/logs/backend-error.log 2>/dev/null || echo NO_LOG" 2>&1')

print('\n=== Step 9: Backend output log (most recent) ===')
run('docker exec postlaa sh -c "tail -5 /root/.pm2/logs/backend-out.log 2>/dev/null || tail -5 ~/.pm2/logs/backend-out.log 2>/dev/null || echo NO_LOG" 2>&1')

client.close()
sys.stdout.write('\n=== DONE ===\n'); sys.stdout.flush()
