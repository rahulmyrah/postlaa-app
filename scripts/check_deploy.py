import paramiko

HOST = '89.116.228.186'
USER = 'root'
PASS = 'Rah@sri58961'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS)

cmds = [
    'docker ps --format "{{.Names}}  {{.Status}}" | grep -E "postlaa|temporal"',
    'docker inspect postlaa --format "Image: {{.Image}}" 2>/dev/null | head -c 80',
    'docker exec postlaa ss -tlnp 2>/dev/null | grep 3000 || echo "port 3000 not ready"',
]
for cmd in cmds:
    _, stdout, _ = client.exec_command(cmd)
    out = stdout.read().decode().strip()
    print(f">>> {cmd[:60]}")
    print(out)
    print()

client.close()
print("Done")
