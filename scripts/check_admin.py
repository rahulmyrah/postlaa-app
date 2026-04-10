import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=10)

cmd = 'docker exec postlaa-postgres psql -U postiz -d postiz_db -c \'SELECT email, name, "isSuperAdmin" FROM "User" ORDER BY "createdAt" LIMIT 10;\''
_, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode()
err = stderr.read().decode()
print(out or err or "(no output)")
client.close()
