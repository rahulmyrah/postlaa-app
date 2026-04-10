import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=10)

_, stdout, _ = client.exec_command('cat /opt/postlaa/.env 2>/dev/null | grep -i admin')
print(stdout.read().decode() or '(no admin vars in .env)')

# Also get the password hash from the DB
_, stdout, stderr = client.exec_command(
    "docker exec postlaa-postgres psql -U postiz -d postiz_db -c "
    "'SELECT email, password FROM \"User\" WHERE \"isSuperAdmin\" = true LIMIT 5;'"
)
print(stdout.read().decode())
print(stderr.read().decode())
client.close()
