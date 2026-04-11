import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=15)

def run(cmd, timeout=30):
    _, o, e = c.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode('utf-8', errors='replace')

print("=== HTTPS TEST: postlaa.com ===")
print(run("curl -v -m 10 https://postlaa.com/ 2>&1 | head -40"))

print("=== CERT DETAILS ===")
print(run("echo | openssl s_client -connect postlaa.com:443 -servername postlaa.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>&1"))

c.close()
print("Done.")
