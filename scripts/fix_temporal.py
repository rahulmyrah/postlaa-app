"""
Fix Temporal search attribute limit by wiping the temporal-postgres volume.
This gives us a fresh Temporal namespace with no custom search attributes.
"""
import paramiko
import time
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=120, show=True):
    if show:
        print(f'\n>> {cmd}')
        sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r and show:
        print(r)
        sys.stdout.flush()
    return r

def wait(secs, msg=''):
    print(f'\n[Waiting {secs}s{": " + msg if msg else ""}...]')
    sys.stdout.flush()
    time.sleep(secs)

print('=== Step 1: Check dynamicconfig inside temporal container ===')
run('docker exec temporal cat /etc/temporal/config/dynamicconfig/development-sql.yaml 2>&1')

print('\n=== Step 2: Check temporal container volume mounts ===')
run("docker inspect temporal --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}|{{end}}' 2>&1")

print('\n=== Step 3: Stop temporal containers ===')
run('cd /opt/postlaa && docker compose stop temporal')

print('\n=== Step 4: Stop temporal-postgres ===')
run('cd /opt/postlaa && docker compose stop temporal-postgres')

print('\n=== Step 5: Remove temporal-postgres volume (fresh Temporal DB) ===')
run('docker volume rm postlaa_temporal-postgres-data 2>&1')

print('\n=== Step 6: Start temporal-postgres fresh ===')
run('cd /opt/postlaa && docker compose up -d temporal-postgres')
wait(10, 'waiting for postgres to be ready')

print('\n=== Step 7: Check temporal-postgres health ===')
run('docker inspect postlaa-temporal-postgres --format "{{.State.Health.Status}}" 2>&1 || docker inspect temporal-postgres --format "{{.State.Health.Status}}" 2>&1')

wait(5, 'extra wait for postgres init')

print('\n=== Step 8: Start temporal ===')
run('cd /opt/postlaa && docker compose up -d temporal')
wait(20, 'waiting for Temporal to initialize namespace and search attributes')

print('\n=== Step 9: Check temporal logs for initialization ===')
run('docker logs temporal --tail 30 2>&1')

print('\n=== Step 10: Restart postlaa backend ===')
run('cd /opt/postlaa && docker compose restart postlaa')
wait(25, 'waiting for backend to start')

print('\n=== Step 11: Check if port 3000 is listening ===')
result = run('docker exec postlaa sh -c "netstat -tlnp 2>/dev/null | grep 3000 || ss -tlnp 2>/dev/null | grep 3000 || nc -z localhost 3000 && echo PORT_OPEN || echo PORT_CLOSED" 2>&1')

print('\n=== Step 12: Check PM2 status ===')
run('docker exec postlaa sh -c "cd /app && pnpm run pm2-list 2>&1 || npx pm2 list 2>&1 || pm2 list 2>&1"')

print('\n=== Step 13: Check postlaa backend error log ===')
run('docker exec postlaa sh -c "cat /root/.pm2/logs/backend-error.log 2>/dev/null | tail -20 || cat /app/.pm2/logs/backend-error.log 2>/dev/null | tail -20 || cat ~/.pm2/logs/backend-error.log 2>/dev/null | tail -20"')

print('\n=== Step 14: Check postlaa backend output log ===')
run('docker exec postlaa sh -c "cat /root/.pm2/logs/backend-out.log 2>/dev/null | tail -20 || cat ~/.pm2/logs/backend-out.log 2>/dev/null | tail -20"')

client.close()
print('\n=== DONE ===')
