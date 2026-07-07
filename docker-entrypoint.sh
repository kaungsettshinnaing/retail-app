#!/bin/sh

echo "→ Applying database migrations…"
npx prisma migrate deploy
if [ $? -ne 0 ]; then
  echo "→ Migration failed. Aborting."
  exit 1
fi

echo "→ Starting Retail Store app…"
exec "$@"
