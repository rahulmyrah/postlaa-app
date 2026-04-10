import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=10)

# Check backend error logs
print('=== Backend Error Logs (last 30 lines) ===')
_, stdout, _ = client.exec_command('docker exec postlaa cat /root/.pm2/logs/backend-error.log 2>/dev/null | tail -30')
print(stdout.read().decode() or '(empty)')

# Check backend stdout logs
print('\n=== Backend Out Logs (last 20 lines) ===')
_, stdout, _ = client.exec_command('docker exec postlaa cat /root/.pm2/logs/backend-out.log 2>/dev/null | tail -20')
print(stdout.read().decode() or '(empty)')

# Check DB record
print('\n=== DB User Record ===')
_, stdout, _ = client.exec_command(
    "docker exec postlaa-postgres psql -U postiz -d postiz_db -c "
    "'SELECT email, provider, \"isSuperAdmin\", LEFT(password,30) as pw_preview FROM \"User\" WHERE email = '\"'\"'admin@postlaa.com'\"'\"';'"
)
print(stdout.read().decode())

client.close()
