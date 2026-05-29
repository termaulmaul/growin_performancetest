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
    local password="$2"
    
    local result
    result=$(echo -n "$password" | "$PT_AUTH" login "$username" 2>/dev/null)
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
        # We actually WANT to init DB and bootstrap if it doesn't exist, not fall back to legacy immediately.
        # But wait, pt-bootstrap-check does exactly that (runs init_db).
        pass=1
    fi

    # Try to verify existing session if PT_USER is set from env
    if [[ -n "$PT_USER" ]] && pt_auth_verify "$PT_USER"; then
        return 0
    fi
    
    while true; do
        # Bootstrap check
        local boot_check
        boot_check=$(python3 "$PT_BIN_DIR/pt-bootstrap-check" 2>/dev/null)
        if [[ "$boot_check" == "needs_bootstrap" ]]; then
            clear
            echo -e "\033[1;33m[!] INITIAL SETUP: No God user found in database.\033[0m\n"
            
            printf "  Create God Username : "
            read -r b_user
            [[ -z "$b_user" ]] && continue
            printf "  Password            : "
            read -rs b_pwd; echo ""
            printf "  Confirm Password    : "
            read -rs b_pwd2; echo ""
            
            if [[ "$b_pwd" != "$b_pwd2" ]]; then
                echo -e "\033[0;31mPasswords do not match.\033[0m"
                sleep 2
                continue
            fi
            
            # Use python to bootstrap
            local b_out
            b_out=$(echo -n "$b_pwd" | python3 "$PT_AUTH" bootstrap "$b_user" 2>&1)
            
            local b_status=$(echo "$b_out" | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('status','error'))")
            if [[ "$b_status" == "ok" ]]; then
                echo -e "\033[0;32mGod user created. Please login.\033[0m"
                sleep 1
            else
                local b_msg=$(echo "$b_out" | python3 -c "import json,sys; raw=sys.stdin.read().strip(); raw=raw[raw.find('{'):] if '{' in raw else '{}'; d=json.loads(raw) if raw else {}; print(d.get('error','Failed'))")
                echo -e "\033[0;31mError: $b_msg\033[0m"
                sleep 2
                continue
            fi
        fi
        
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
        
        printf "  Password : "
        read -rs input_pwd
        echo ""
        
        if pt_auth_login "$input_user" "$input_pwd"; then
            pt_auth_verify "$input_user"
            echo -e "\n  \033[0;32mLogin successful. Role: $PT_ROLE\033[0m"
            sleep 1
            return 0
        fi
        sleep 2
    done
}