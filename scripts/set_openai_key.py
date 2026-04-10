#!/usr/bin/env python3
"""
Set OPENAI_API_KEY in the running postlaa container.
Usage:  python scripts/set_openai_key.py sk-proj-XXXX...
"""
import sys
import paramiko
import subprocess

if len(sys.argv) < 2:
    print("Usage: python scripts/set_openai_key.py <your-openai-api-key>")
    sys.exit(1)

api_key = sys.argv[1].strip()
if not api_key.startswith('sk-'):
    print(f"WARNING: Key '{api_key[:8]}...' doesn't look like an OpenAI key (should start with 'sk-').")

print(f"Setting OPENAI_API_KEY ({api_key[:8]}...) on production server...")

def run(ssh, cmd, timeout=30):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    out = o.read().decode('utf-8', errors='replace').strip()
    err = e.read().decode('utf-8', errors='replace').strip()
    return out, err

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('89.116.228.186', username='root', password='Rah@sri58961', timeout=30)

# Write the key to a temp file (avoids $ expansion in shell strings)
run(ssh, f"echo '{api_key}' > /tmp/openai_key.txt")

# Inject into running container env via /app/.env (loaded by dotenv-cli at PM2 start)
out, err = run(ssh, """docker exec postlaa sh -c "grep -v OPENAI_API_KEY /app/.env > /tmp/env_clean && mv /tmp/env_clean /app/.env" """)
out, err = run(ssh, """docker exec postlaa sh -c "cat /tmp/openai_key.txt | while read k; do echo OPENAI_API_KEY=$k >> /app/.env; done" """)
run(ssh, "docker cp /tmp/openai_key.txt postlaa:/tmp/openai_key.txt")
out, err = run(ssh, """docker exec postlaa sh -c "echo 'OPENAI_API_KEY='$(cat /tmp/openai_key.txt) >> /app/.env && rm -f /tmp/openai_key.txt" """)

# Verify it's written
out, err = run(ssh, "docker exec postlaa grep OPENAI_API_KEY /app/.env")
print("Wrote to /app/.env:", out[:40] + "..." if out else "(empty)")

# Restart PM2 processes inside the container to pick up the new env var
print("Restarting backend and frontend processes...")
out, err = run(ssh, "docker exec postlaa pm2 restart backend", timeout=20)
if err:
    print("Backend restart:", err[:200])
else:
    print("Backend restarted:", out[:80])

out, err = run(ssh, "docker exec postlaa pm2 status", timeout=10)
print("\nPM2 status:")
print(out[:600])

# Cleanup
run(ssh, "rm -f /tmp/openai_key.txt")
ssh.close()

print("\nDone! The OPENAI_API_KEY has been set and backend restarted.")
print("Also update your docker-compose.production.yaml with your key for future deployments.")
