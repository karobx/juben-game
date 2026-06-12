#!/usr/bin/env bash
# Prints GoDaddy DNS steps for game.ange1a.com → Render.
# Usage: ./scripts/godaddy-dns-instructions.sh [render-hostname]
# Example: ./scripts/godaddy-dns-instructions.sh juben-game-xxxx.onrender.com

RENDER_HOST="${1:-YOUR-SERVICE.onrender.com}"

cat <<EOF

GoDaddy DNS setup for game.ange1a.com
=====================================

1. Render Dashboard → your Web Service → Settings → Custom Domains
   → Add: game.ange1a.com
   → Copy the CNAME target (e.g. ${RENDER_HOST})

2. GoDaddy → My Products → ange1a.com → DNS → Manage DNS

3. Add record:
   Type:  CNAME
   Name:  game
   Value: ${RENDER_HOST}
   TTL:   600 (or default)

4. If a record named "game" already exists (A or CNAME), delete it first.

5. Wait 5–30 minutes, then run:
   ./scripts/verify-deployment.sh https://game.ange1a.com

EOF
