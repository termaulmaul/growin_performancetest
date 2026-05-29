#!/bin/bash
# Rebuild ssh_menu to auto-discover all suites in Script/

cat << 'INNER_EOF' > /tmp/menu-patch.awk
/local scripts=\(/ {
  print "  local scripts=()"
  print "  while IFS= read -r s; do"
  print "    [[ -z \"$s\" ]] && continue"
  print "    scripts+=(\"Suite: $s\")"
  print "  done < <(find Script -maxdepth 1 -mindepth 1 -type d -exec basename {} \\; | sort)"
  print "  scripts+=(\"Custom Command\" \"Only Connect (Interactive Shell)\")"
  in_scripts = 1
  next
}
in_scripts && /\)/ { in_scripts = 0; next }
in_scripts { next }

/case "\$script_sel" in/ {
  print "  case \"$script_sel\" in"
  print "    \"Suite: \"*) "
  print "       local suite_name=\"${script_sel#Suite: }\""
  print "       run_cmd=\"bash docker-local-pt/scripts/run-mock-suite.sh \\\"$suite_name\\\" Web\""
  print "       ;;"
  print "    \"Custom Command\") printf \"Command: \"; read -r run_cmd ;;"
  print "  esac"
  in_case = 1
  next
}
in_case && /esac/ { in_case = 0; next }
in_case { next }
{ print }
INNER_EOF

awk -f /tmp/menu-patch.awk pt-menu.sh > pt-menu.tmp
mv pt-menu.tmp pt-menu.sh
chmod +x pt-menu.sh
