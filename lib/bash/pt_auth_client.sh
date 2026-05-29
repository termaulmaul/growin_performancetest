#!/bin/bash

# PT Auth Client Wrapper for Bash

PT_BIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../bin" && pwd)"
PT_AUTH="$PT_BIN_DIR/pt-auth"
PT_RBAC="$PT_BIN_DIR/pt-rbac"
PT_SESSION_DIR="$HOME/.pt/sessions"

# Cache variables for fast verification
export PT_USER=""
export PT_ROLE=""

pt_auth_login() {
    local username="$1"
    
    # stty is handled inside Python using getpass
    local result
    result=$("$PT_AUTH" login "$username" 2>/dev/null)
    local rc=$?
    
    local status=$(echo "$result" | jq -r '.status // "error"')
    local msg=$(echo "$result" | jq -r '.message // .error // "Unknown error"')
    
    if [[ "$status" == "ok" ]]; then
        export PT_USER=$(echo "$result" | jq -r '.data.username')
        return 0
    else
        echo -e "\033[0;31mLogin failed: $msg\033[0m" >&2
        return 1
    fi
}

pt_auth_verify() {
    local username="$1"
    local token_file="$PT_SESSION_DIR/${username}.token"
    
    # Fast path: check file existence
    if [[ ! -f "$token_file" ]]; then
        return 1
    fi
    
    local result
    result=$("$PT_AUTH" verify-session "$username" 2>/dev/null)
    local rc=$?
    
    local status=$(echo "$result" | jq -r '.status // "error"')
    
    if [[ "$status" == "ok" ]]; then
        export PT_USER=$(echo "$result" | jq -r '.data.username')
        export PT_ROLE=$(echo "$result" | jq -r '.data.role')
        return 0
    else
        return 1
    fi
}

pt_require_auth() {
    if [[ "${PT_AUTH_BYPASS:-0}" == "1" ]]; then
        export PT_USER="bypass_user"
        export PT_ROLE="god"
        return 0
    fi
    
    # Fallback to legacy if DB not exists
    if [[ ! -f "$HOME/.pt/var/pt.db" ]]; then
        echo -e "\033[1;33mWARNING: Legacy mode. PT database not found.\033[0m" >&2
        export PT_USER="legacy_user"
        export PT_ROLE="god"
        return 0
    fi

    # Try to verify existing session if PT_USER is set from env
    if [[ -n "$PT_USER" ]] && pt_auth_verify "$PT_USER"; then
        return 0
    fi
    
    # Otherwise prompt for login
    while true; do
        clear
        echo -e "\033[0;36m\033[1m"
        echo '┏━╸┏━┓┏━┓╻ ╻╻┏┓╻   ┏━┓╺┳╸   ┏━╸┏━┓┏━┓┏┳┓┏━╸╻ ╻┏━┓┏━┓╻┏ '
        echo '┃╺┓┣┳┛┃ ┃┃╻┃┃┃┗┫   ┣━┛ ┃    ┣╸ ┣┳┛┣━┫┃┃┃┣╸ ┃╻┃┃ ┃┣┳┛┣┻┓'
        echo '┗━┛╹┗╸┗━┛┗┻┛╹╹ ╹   ╹   ╹    ╹  ╹┗╸╹ ╹╹ ╹┗━╸┗┻┛┗━┛╹┗╸╹ ╹'
        echo -e "\033[0m"
        echo -e "  \033[2mWelcome to Growin Performance Test Framework (Secure Mode)\033[0m\n"
        
        printf "  Username : "
        read -r input_user
        [[ -z "$input_user" ]] && continue
        
        if pt_auth_login "$input_user"; then
            pt_auth_verify "$input_user"
            echo -e "\n  \033[0;32mLogin successful. Role: $PT_ROLE\033[0m"
            sleep 1
            return 0
        fi
        sleep 2
    done
}

pt_auth_check_perm() {
    local resource="$1"
    local action="$2"
    
    if [[ "${PT_AUTH_BYPASS:-0}" == "1" || ! -f "$HOME/.pt/var/pt.db" ]]; then
        return 0
    fi
    
    local result
    result=$("$PT_RBAC" check "$PT_USER" "$resource" "$action" 2>/dev/null)
    local status=$(echo "$result" | jq -r '.status // "error"')
    
    if [[ "$status" == "ok" ]]; then
        return 0
    else
        return 1
    fi
}
