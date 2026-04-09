"""
Full temporal reset:
1. Stop temporal + temporal-postgres
2. Force remove temporal container (to pick up new volumes config)
3. Delete temporal-postgres data volume (fresh Temporal DB = no pre-existing custom search attributes)
4. Restart everything
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

os_path = '/opt/postlaa'

print('=== Step 1: Stop temporal containers ===')
run(f'cd {os_path} && docker compose stop temporal')
run(f'cd {os_path} && docker compose stop temporal-postgres')

print('\n=== Step 2: Remove temporal container (so it gets recreated with new volumes) ===')
run(f'cd {os_path} && docker compose rm -f temporal')

print('\n=== Step 3: Remove temporal-postgres volume (fresh Temporal DB) ===')
run(f'docker volume rm postlaa_temporal-postgres-data 2>&1')

print('\n=== Step 4: Start temporal-postgres fresh ===')
run(f'cd {os_path} && docker compose up -d temporal-postgres')
wait(12, 'waiting for postgres to init')

print('\n=== Step 5: Start temporal with mount ===')
run(f'cd {os_path} && docker compose up -d temporal')
wait(25, 'waiting for Temporal to initialize default namespace and search attributes')

print('\n=== Step 6: Verify dynamicconfig IS mounted now ===')
run('docker exec temporal cat /etc/temporal/config/dynamicconfig/development-sql.yaml 2>&1')

print('\n=== Step 7: Check temporal init logs ===')
run('docker logs temporal 2>&1 | tail -30')

print('\n=== Step 8: Restart postlaa backend ===')
run(f'cd {os_path} && docker compose restart postlaa')
wait(30, 'waiting for backend to start on port 3000')

print('\n=== Step 9: Check if port 3000 is listening ===')
result = run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep :3000 || echo NOT_LISTENING" 2>&1')

print('\n=== Step 10: Check PM2 list ===')
run('docker exec postlaa sh -c "pm2 list 2>/dev/null || npx pm2 list 2>/dev/null" 2>&1')

print('\n=== Step 11: Backend error log (last 20 lines) ===')
run('docker exec postlaa sh -c "tail -20 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -20 ~/.pm2/logs/backend-error.log 2>/dev/null || echo NO_LOG" 2>&1')

client.close()
sys.stdout.write('\n=== ALL DONE ===\n'); sys.stdout.flush()
