import paramiko
import time

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'
REMOTE_DIR = '/opt/postlaa'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS)
print("Connected")

# Force recreate with new image
cmd = f'cd {REMOTE_DIR} && docker compose up -d --force-recreate postlaa 2>&1'
print(f">>> {cmd}")
_, stdout, _ = client.exec_command(cmd, get_pty=False)
stdout.channel.setblocking(True)
out = b""
while not stdout.channel.exit_status_ready():
    if stdout.channel.recv_ready():
        chunk = stdout.channel.recv(4096)
        out += chunk
        print(chunk.decode(errors='replace'), end='', flush=True)
# drain
while stdout.channel.recv_ready():
    chunk = stdout.channel.recv(4096)
    out += chunk
    print(chunk.decode(errors='replace'), end='', flush=True)

print("\nWaiting 20s for container to start...")
time.sleep(20)

# Verify
_, stdout2, _ = client.exec_command('docker inspect postlaa --format "Image: {{.Image}}" ; docker ps --format "{{.Names}}  {{.Status}}" 2>/dev/null | grep postlaa')
print(stdout2.read().decode())

client.close()
print("Done")
