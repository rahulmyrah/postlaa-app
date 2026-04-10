#!/usr/bin/env python3
"""Check production deployment status - DB tables and env vars."""
import paramiko

def run(ssh, cmd, timeout=20):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    out = o.read().decode('utf-8', errors='replace').strip()
    err = e.read().decode('utf-8', errors='replace').strip()
    return out, err

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=30)

print("=== DB Tables ===")
out, _ = run(ssh, r"""docker exec postlaa-postgres psql -U postiz -d postiz_db -c '\dt' 2>&1""")
print(out)

print("\n=== Key Env Vars in postlaa container ===")
out, _ = run(ssh, "docker exec postlaa env 2>&1 | sort")
print(out)

ssh.close()
