import sys

def patch_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # The warning block to remove
    warning_old = '''    cardBody.push({
      "type": "TextBlock",
      "text": "⚠️ Kolom Max, Min disembunyikan untuk keterbacaan di Teams.",
      "size": "Small",
      "color": "Warning",
      "wrap": true,
      "spacing": "Small"
    });'''

    # The threshold info block to add instead
    threshold_new = '''    cardBody.push({
      "type": "TextBlock",
      "text": "🎯 **Thresholds:** Avg < 200ms | Err < 0.1% | RPS > 381",
      "size": "Small",
      "color": "Accent",
      "wrap": true,
      "spacing": "Small"
    });'''

    if warning_old in content:
        content = content.replace(warning_old, threshold_new)
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Patched {file_path} successfully!")
    else:
        # Also handle the slightly different format in webhook-tester.mjs
        warning_old_tester = '''            {
              "type": "TextBlock",
              "text": "⚠️ Kolom Max, Min disembunyikan untuk keterbacaan di Teams.",
              "size": "Small",
              "color": "Warning",
              "wrap": true,
              "spacing": "Small"
            }'''
        threshold_new_tester = '''            {
              "type": "TextBlock",
              "text": "🎯 **Thresholds:** Avg < 200ms | Err < 0.1% | RPS > 381",
              "size": "Small",
              "color": "Accent",
              "wrap": true,
              "spacing": "Small"
            }'''
        
        if warning_old_tester in content:
            content = content.replace(warning_old_tester, threshold_new_tester)
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"Patched {file_path} successfully (tester format)!")
        else:
            print(f"Could not find warning text in {file_path}.")

patch_file('docker-local-pt/scripts/send-summary-webhook.mjs')
patch_file('docker-local-pt/scripts/webhook-tester.mjs')
