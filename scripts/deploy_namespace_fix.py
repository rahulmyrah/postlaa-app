"""
Deploy updated compose with TEMPORAL_NAMESPACE=postlaa fix.
Also wipe temporal-postgres volume for a truly clean fresh namespace.
"""
import paramiko, sys, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=120):
    sys.stdout.write(f'\n>> {cmd[:100]}\n'); sys.stdout.flush()
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

os_path = '/opt/postlaa'

print('=== Step 1: Upload updated compose (TEMPORAL_NAMESPACE=postlaa) ===')
upload(
    r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\docker-compose.production.yaml',
    f'{os_path}/docker-compose.yml'
)

# Verify the change is in the file
run(f'grep TEMPORAL_NAMESPACE {os_path}/docker-compose.yml')

print('\n=== Step 2: Stop temporal and wipe its data volume ===')
run(f'cd {os_path} && docker compose stop temporal')
run(f'cd {os_path} && docker compose rm -f temporal')
run(f'cd {os_path} && docker compose stop temporal-postgres')
run('docker rm -f temporal-postgres 2>&1 || true')
run('docker volume rm postlaa_temporal-postgres-data 2>&1 || true')

print('\n=== Step 3: Start temporal-postgres fresh ===')
run(f'cd {os_path} && docker compose up -d temporal-postgres')
wait(12, 'postgres init')

print('\n=== Step 4: Start temporal (will create fresh "postlaa" namespace) ===')
run(f'cd {os_path} && docker compose up -d temporal')
wait(30, 'Temporal initializing postlaa namespace')

print('\n=== Step 5: Verify temporal created postlaa namespace ===')
run('docker logs temporal 2>&1 | grep -i "namespace\|search attr\|postlaa\|error" | tail -20')

print('\n=== Step 6: Restart postlaa backend ===')
run(f'cd {os_path} && docker compose restart postlaa')
wait(35, 'backend startup')

print('\n=== Step 7: Check port 3000 ===')
run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== Step 8: Check PM2 list ===')
run('docker exec postlaa sh -c "pm2 list 2>/dev/null" 2>&1')

print('\n=== Step 9: Backend error log ===')
run('docker exec postlaa sh -c "tail -15 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -15 ~/.pm2/logs/backend-error.log 2>/dev/null || echo NO_LOG" 2>&1')

print('\n=== Step 10: Backend output log ===')
run('docker exec postlaa sh -c "tail -10 /root/.pm2/logs/backend-out.log 2>/dev/null || tail -10 ~/.pm2/logs/backend-out.log 2>/dev/null || echo NO_LOG" 2>&1')

client.close()
sys.stdout.write('\n=== DONE ===\n'); sys.stdout.flush()
