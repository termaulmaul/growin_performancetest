import sys
content = open('docker-local-pt/scripts/webhook-tester.mjs').read()
old = "} else {"
new = "} else if (type === 'brrr') {\n  body = text;\n  headers = { 'Content-Type': 'text/plain; charset=utf-8' };\n} else {"
if new not in content:
    open('docker-local-pt/scripts/webhook-tester.mjs', 'w').write(content.replace(old, new))
print("Patched tester")
