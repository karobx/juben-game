#!/usr/bin/env bash
# Prints GoDaddy DNS steps for game.ange1a.com → hosting provider.
# Usage: ./scripts/godaddy-dns-instructions.sh [cname-target]
# Example: ./scripts/godaddy-dns-instructions.sh juben-game.apps.hostingguru.io

CNAME_TARGET="${1:-YOUR-SERVICE.apps.hostingguru.io}"

cat <<EOF

GoDaddy DNS setup for game.ange1a.com
=====================================

1. Hosting platform (Render / HostingGuru) → Custom Domains
   → Add: game.ange1a.com
   → Copy the CNAME target (e.g. ${CNAME_TARGET})

2. GoDaddy → My Products → ange1a.com → DNS → Manage DNS

3. Add record:
   Type:  CNAME
   Name:  game
   Value: ${CNAME_TARGET}
   TTL:   600 (or default)

4. If a record named "game" already exists (A or CNAME), delete it first.

5. Wait 5–30 minutes, then run:
   ./scripts/verify-deployment.sh https://game.ange1a.com

EOF
