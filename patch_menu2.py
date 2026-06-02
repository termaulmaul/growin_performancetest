import sys

def patch_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # The previous python patch failed to parse choices array properly due to missing webhook_menu!
    # I accidentally overwrote pt-menu.sh without webhook_menu definition because the git checkout earlier wiped it out.
    # So I just need to add webhook_menu() before main_menu().

    webhook_menu_code = '''
# ── Webhook Menu ───────────────────────────────────────────────────────────
webhook_menu() {
  banner
  section_header "Webhook Notifications"

  echo -e "  \\${CYN}Telegram:\\${RST} \\$(env_val TELEGRAM_WEBHOOK '<unset>')"
  echo -e "  \\${CYN}Discord :\\${RST} \\$(env_val DISCORD_WEBHOOK '<unset>')"
  echo -e "  \\${CYN}Teams   :\\${RST} \\$(env_val TEAMS_WEBHOOK '<unset>')"
  echo -e "  \\${CYN}Brrr    :\\${RST} \\$(env_val BRRR_WEBHOOK '<unset>')"
  echo -e "  \\${CYN}Notify  :\\${RST} \\$(env_val NOTIFY_TEAMS 'false')"
  echo ""

  local choices=(
    "Set Telegram Webhook"
    "Set Discord Webhook"
    "Set Teams Webhook"
    "Set Brrr Webhook"
    "Toggle Teams Notify"
    "Test Webhook (Send Sample)"
    "← Back"
  )
  local sel; sel=\\$(pick_fzf "Webhook>" "\\${choices[@]}")
  [[ -z "\\$sel" || "\\$sel" == "← Back" ]] && return

  case "\\$sel" in
    "Set Telegram Webhook")
      printf "  Telegram URL: "; read -r url
      [[ -z "\\$url" ]] && return
      set_env_val "TELEGRAM_WEBHOOK" "\\$url"
      echo -e "  \\${GRN}✓ saved TELEGRAM_WEBHOOK\\${RST}"
      ;;
    "Set Discord Webhook")
      printf "  Discord URL: "; read -r url
      [[ -z "\\$url" ]] && return
      set_env_val "DISCORD_WEBHOOK" "\\$url"
      echo -e "  \\${GRN}✓ saved DISCORD_WEBHOOK\\${RST}"
      ;;
    "Set Teams Webhook")
      printf "  Teams URL: "; read -r url
      [[ -z "\\$url" ]] && return
      set_env_val "TEAMS_WEBHOOK" "\\$url"
      echo -e "  \\${GRN}✓ saved TEAMS_WEBHOOK\\${RST}"
      ;;
    "Set Brrr Webhook")
      printf "  Brrr URL: "; read -r url
      [[ -z "\\$url" ]] && return
      set_env_val "BRRR_WEBHOOK" "\\$url"
      echo -e "  \\${GRN}✓ saved BRRR_WEBHOOK\\${RST}"
      ;;
    "Toggle Teams Notify")
      local cur next
      cur=\\$(env_val NOTIFY_TEAMS 'false')
      [[ "\\$cur" == "true" ]] && next="false" || next="true"
      set_env_val "NOTIFY_TEAMS" "\\$next"
      echo -e "  \\${GRN}✓ NOTIFY_TEAMS=\\${next}\\${RST}"
      ;;
    "Test Webhook (Send Sample)")
      local target_choices=()
      [[ -n "\\$(env_val TELEGRAM_WEBHOOK "")" ]] && target_choices+=("Telegram")
      [[ -n "\\$(env_val DISCORD_WEBHOOK "")" ]] && target_choices+=("Discord")
      [[ -n "\\$(env_val TEAMS_WEBHOOK "")" ]] && target_choices+=("Teams")
      [[ -n "\\$(env_val BRRR_WEBHOOK "")" ]] && target_choices+=("Brrr")
      target_choices+=("← Back")
      
      local target_sel; target_sel=\\$(pick_fzf "Select Target>" "\\${target_choices[@]}")
      [[ -z "\\$target_sel" || "\\$target_sel" == "← Back" ]] && return
      
      local wh
      case "\\$target_sel" in
        "Telegram")
          wh=\\$(env_val TELEGRAM_WEBHOOK "")
          print_run_header "Telegram Webhook Test" "Telegram"
          set +e
          node "\\$PROJECT_DIR/docker-local-pt/scripts/webhook-tester.mjs" telegram "\\$wh" 2>&1
          print_run_footer "\\$?"
          ;;
        "Discord")
          wh=\\$(env_val DISCORD_WEBHOOK "")
          print_run_header "Discord Webhook Test" "Discord"
          set +e
          node "\\$PROJECT_DIR/docker-local-pt/scripts/webhook-tester.mjs" discord "\\$wh" 2>&1
          print_run_footer "\\$?"
          ;;
        "Teams")
          wh=\\$(env_val TEAMS_WEBHOOK "")
          print_run_header "Teams Webhook Test" "Teams"
          set +e
          node "\\$PROJECT_DIR/docker-local-pt/scripts/webhook-tester.mjs" teams "\\$wh" 2>&1
          print_run_footer "\\$?"
          ;;
        "Brrr")
          wh=\\$(env_val BRRR_WEBHOOK "")
          print_run_header "Brrr Webhook Test" "Brrr"
          set +e
          node "\\$PROJECT_DIR/docker-local-pt/scripts/webhook-tester.mjs" brrr "\\$wh" 2>&1
          print_run_footer "\\$?"
          ;;
      esac
      ;;
  esac

  read -r -p $'\\nPress Enter...'
}
'''
    
    # insert before main_menu()
    idx = content.find('# ── Main Menu ───────────────────────────────────────────────────────────────\nmain_menu() {')
    if idx != -1:
        if 'webhook_menu()' not in content:
            new_content = content[:idx] + webhook_menu_code + '\n' + content[idx:]
            with open(file_path, 'w') as f:
                f.write(new_content)
            print('Patched successfully')
        else:
            print('webhook_menu already exists')
    else:
        print('Could not find main_menu to patch')

patch_file('pt-menu.sh')
