"""
Full temporal reset - fixed version:
1. Stop temporal first
2. Stop temporal-postgres
3. Delete temporal-postgres volume (fresh Temporal DB)
4. Upload correct docker.yaml dynamicconfig
5. Restart everything
"""
import paramiko, sys, time, os

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
    sys.stdout.write(f'  Uploaded: {local} -> {remote}\n'); sys.stdout.flush()

os_path = '/opt/postlaa'

print('=== Step 1: Upload docker.yaml (correct Temporal dynamicconfig filename) ===')
run(f'mkdir -p {os_path}/dynamicconfig')
upload(
    r'c:\Users\rahul\Documents\Rahul Web and Mobile Apps\Postiz Agents\dynamicconfig\docker.yaml',
    f'{os_path}/dynamicconfig/docker.yaml'
)
run(f'cat {os_path}/dynamicconfig/docker.yaml')

print('\n=== Step 2: Stop temporal ===')
run(f'cd {os_path} && docker compose stop temporal')
run(f'cd {os_path} && docker compose rm -f temporal 2>&1')

print('\n=== Step 3: Stop temporal-postgres ===')
run(f'cd {os_path} && docker compose stop temporal-postgres')

print('\n=== Step 4: Remove temporal-postgres volume (fresh DB) ===')
result = run('docker volume rm postlaa_temporal-postgres-data 2>&1')
if 'in use' in result:
    sys.stdout.write('  Volume still in use - forcing container removal\n'); sys.stdout.flush()
    run('docker rm -f temporal-postgres 2>&1')
    run('docker volume rm postlaa_temporal-postgres-data 2>&1')

print('\n=== Step 5: Start temporal-postgres fresh ===')
run(f'cd {os_path} && docker compose up -d temporal-postgres')
wait(12, 'waiting for postgres to init')

print('\n=== Step 6: Start temporal (now with docker.yaml mounted) ===')
run(f'cd {os_path} && docker compose up -d temporal')
wait(30, 'waiting for Temporal to fully initialize')

print('\n=== Step 7: Verify docker.yaml IS mounted ===')
run('docker exec temporal cat /etc/temporal/config/dynamicconfig/docker.yaml 2>&1')

print('\n=== Step 8: Check temporal logs (should not have yaml error) ===')
run('docker logs temporal 2>&1 | tail -20')

print('\n=== Step 9: Check temporal is running (not restarting) ===')
run('docker inspect temporal --format "Status: {{.State.Status}} Restarts: {{.RestartCount}}" 2>&1')

print('\n=== Step 10: Restart postlaa backend ===')
run(f'cd {os_path} && docker compose restart postlaa')
wait(35, 'waiting for backend to start on port 3000')

print('\n=== Step 11: Check if port 3000 is listening ===')
run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== Step 12: Backend error log (last 20 lines) ===')
run('docker exec postlaa sh -c "tail -20 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -20 ~/.pm2/logs/backend-error.log 2>/dev/null || echo NO_LOG" 2>&1')

print('\n=== Step 13: Backend output log (last 10 lines) ===')
run('docker exec postlaa sh -c "tail -10 /root/.pm2/logs/backend-out.log 2>/dev/null || tail -10 ~/.pm2/logs/backend-out.log 2>/dev/null || echo NO_LOG" 2>&1')

client.close()
sys.stdout.write('\n=== ALL DONE ===\n'); sys.stdout.flush()
