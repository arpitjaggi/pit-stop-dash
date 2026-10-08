#!/usr/bin/env bash
# Verifies the migrations, triggers and row-level security on a throwaway local Postgres.
# Needs Postgres server binaries (initdb, pg_ctl) and a non-root user to run them.
set -euo pipefail
cd "$(dirname "$0")/../.."
BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
[ -z "$BIN" ] && BIN="$(dirname "$(command -v initdb)")"
WORK="${PGVERIFY_DIR:-$(mktemp -d)}"
PORT="${PGVERIFY_PORT:-54329}"
RUNAS=()
if [ "$(id -u)" = "0" ]; then
  chmod 755 "$WORK"; chown postgres "$WORK"
  RUNAS=(runuser -u postgres --)
fi
cleanup() { "${RUNAS[@]}" "$BIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true; }
trap cleanup EXIT
"${RUNAS[@]}" "$BIN/initdb" -D "$WORK/data" -A trust -U postgres >/dev/null
"${RUNAS[@]}" "$BIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" -w start >/dev/null
PSQL=(psql -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -c "create database verify" >/dev/null
PSQL+=(-d verify)
"${PSQL[@]}" -f supabase/tests/shim.sql
for f in supabase/migrations/*.sql; do echo "applying $f"; "${PSQL[@]}" -f "$f"; done
"${PSQL[@]}" -f supabase/tests/rls.sql
