import paramiko, sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=30):
    sys.stdout.write(f'\n>> {cmd[:90]}\n'); sys.stdout.flush()
    _, out, err = client.exec_command(cmd, timeout=timeout)
    r = (out.read() + err.read()).decode('utf-8', errors='replace').strip()
    if r: sys.stdout.write(r + '\n'); sys.stdout.flush()
    return r

# Check the compose file on server - temporal section
run('cat /opt/postlaa/docker-compose.yml | grep -A 20 "image: temporalio" 2>&1')

# List dynamicconfig dir
run('ls -la /opt/postlaa/dynamicconfig/ 2>&1')

# Check temporal container mounts
run('docker inspect temporal 2>&1 | python3 -c "import sys,json; data=json.load(sys.stdin); m=data[0][\'Mounts\']; print(m)"')

client.close()
