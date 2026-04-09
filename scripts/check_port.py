import paramiko, sys, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=30):
    sys.stdout.write(f'\n>> {cmd[:120]}\n'); sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r: sys.stdout.write(r + '\n'); sys.stdout.flush()
    return r

print('=== PM2 status ===')
run('docker exec postlaa pm2 list 2>&1')

print('\n=== Backend ERROR log (full last 30 lines) ===')
run('docker exec postlaa sh -c "tail -30 /root/.pm2/logs/backend-error.log 2>/dev/null || tail -30 ~/.pm2/logs/backend-error.log 2>/dev/null"')

print('\n=== Backend OUT log (last 20 lines) ===')
run('docker exec postlaa sh -c "tail -20 /root/.pm2/logs/backend-out.log 2>/dev/null || tail -20 ~/.pm2/logs/backend-out.log 2>/dev/null"')

print('\n=== TCP ports from container (all methods) ===')
run('docker exec postlaa sh -c "cat /proc/net/tcp6 2>/dev/null | awk \'{print $2}\' | grep -v local_address | head -20"')

print('\n=== Check if node process is actually listening ===')
# 0x0BB8 = 3000 decimal
run('docker exec postlaa sh -c "grep -i 0BB8 /proc/net/tcp6 /proc/net/tcp 2>/dev/null | head -5"')

client.close()
