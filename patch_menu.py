import sys
content = open('pt-menu.sh').read()

if 'Set Brrr Webhook' not in content:
    # 1. Add env_val echo
    old1 = 'echo -e "  ${CYN}Teams   :${RST} $(env_val TEAMS_WEBHOOK \'<unset>\')"'
    new1 = old1 + '\n  echo -e "  ${CYN}Brrr    :${RST} $(env_val BRRR_WEBHOOK \'<unset>\')"'
    content = content.replace(old1, new1)

    # 2. Add choice
    old2 = '"Set Teams Webhook"'
    new2 = old2 + '\n    "Set Brrr Webhook"'
    content = content.replace(old2, new2)

    # 3. Add case
    old3 = '    "Set Teams Webhook")\n      printf "  Teams URL: "; read -r url\n      [[ -z "$url" ]] && return\n      set_env_val "TEAMS_WEBHOOK" "$url"\n      echo -e "  ${GRN}✓ saved TEAMS_WEBHOOK${RST}"\n      ;;'
    new3 = old3 + '\n    "Set Brrr Webhook")\n      printf "  Brrr URL: "; read -r url\n      [[ -z "$url" ]] && return\n      set_env_val "BRRR_WEBHOOK" "$url"\n      echo -e "  ${GRN}✓ saved BRRR_WEBHOOK${RST}"\n      ;;'
    content = content.replace(old3, new3)

    # 4. Add to target choices
    old4 = '[[ -n "$(env_val TEAMS_WEBHOOK "")" ]] && target_choices+=("Teams")'
    new4 = old4 + '\n      [[ -n "$(env_val BRRR_WEBHOOK "")" ]] && target_choices+=("Brrr")'
    content = content.replace(old4, new4)

    # 5. Add to target cases
    old5 = '        "Teams")\n          wh=$(env_val TEAMS_WEBHOOK "")\n          print_run_header "Teams Webhook Test" "Teams"\n          set +e\n          node "$PROJECT_DIR/docker-local-pt/scripts/webhook-tester.mjs" teams "$wh" 2>&1\n          print_run_footer "$?"\n          ;;'
    new5 = old5 + '\n        "Brrr")\n          wh=$(env_val BRRR_WEBHOOK "")\n          print_run_header "Brrr Webhook Test" "Brrr"\n          set +e\n          node "$PROJECT_DIR/docker-local-pt/scripts/webhook-tester.mjs" brrr "$wh" 2>&1\n          print_run_footer "$?"\n          ;;'
    content = content.replace(old5, new5)

    # 6. Add to print_run_footer condition
    old6 = '|| -n "$(env_val TEAMS_WEBHOOK \'\')" ]]'
    new6 = '|| -n "$(env_val TEAMS_WEBHOOK \'\')" || -n "$(env_val BRRR_WEBHOOK \'\')" ]]'
    content = content.replace(old6, new6)

    # 7. Add execution line to print_run_footer
    old7 = '[[ -n "$(env_val DISCORD_WEBHOOK \'\')" ]] && node "$PROJECT_DIR/docker-local-pt/scripts/send-summary-webhook.mjs" "$res" --type discord --webhook "$(env_val DISCORD_WEBHOOK \'\')" 2>/dev/null'
    new7 = old7 + '\n    [[ -n "$(env_val BRRR_WEBHOOK \'\')" ]] && node "$PROJECT_DIR/docker-local-pt/scripts/send-summary-webhook.mjs" "$res" --type brrr --webhook "$(env_val BRRR_WEBHOOK \'\')" 2>/dev/null'
    content = content.replace(old7, new7)

    open('pt-menu.sh', 'w').write(content)
    print("Patched pt-menu.sh")
else:
    print("Already patched")
