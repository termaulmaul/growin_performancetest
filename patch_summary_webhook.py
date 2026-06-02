import sys
content = open('docker-local-pt/scripts/send-summary-webhook.mjs').read()
old = "} else {"
new = "} else if (type === 'brrr') {\n  body = txt;\n  headers = { 'Content-Type': 'text/plain; charset=utf-8' };\n} else {"
if new not in content:
    open('docker-local-pt/scripts/send-summary-webhook.mjs', 'w').write(content.replace(old, new))
print("Patched summary webhook")
