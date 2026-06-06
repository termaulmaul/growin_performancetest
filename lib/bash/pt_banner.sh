#!/usr/bin/env bash
# lib/bash/pt_banner.sh — Shared ASCII banner
# LOW FIX (L2): Single source of truth for ASCII art

pt_ascii_banner() {
  echo -e "${CYN:-\033[0;36m}${BLD:-\033[1m}"
  echo '┏━╸┏━┓┏━┓╻ ╻╻┏┓╻   ┏━┓╺┳╸   ┏━╸┏━┓┏━┓┏┳┓┏━╸╻ ╻┏━┓┏━┓╻┏ '
  echo '┃╺┓┣┳┛┃ ┃┃╻┃┃┃┗┫   ┣━┛ ┃    ┣╸ ┣┳┛┣━┫┃┃┃┣╸ ┃╻┃┃ ┃┣┳┛┣┻┓'
  echo '┗━┛╹┗╸┗━┛┗┻┛╹╹ ╹   ╹   ╹    ╹  ╹┗╸╹ ╹╹ ╹┗━╸┗┻┛┗━┛╹┗╸╹ ╹'
  echo -e "${RST:-\033[0m}"
}
