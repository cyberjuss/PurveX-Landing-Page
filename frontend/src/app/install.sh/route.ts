import { NextResponse } from "next/server";

// Served at /install.sh so the copy-paste command on /get-purvex reads as
// "curl https://purvex-llc.com/install.sh | bash" instead of a raw
// "git clone github.com/..." -- the repo is public either way, this is
// purely about not putting a bare GitHub URL in front of a customer as the
// first thing they type. Falls back to a tarball download (no git
// required) if git isn't on the machine.
const REPO_OWNER = "cyberjuss";
const REPO_NAME = "PurveX";
const REPO_BRANCH = "main";

const SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
TARBALL_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${REPO_BRANCH}.tar.gz"
TARGET_DIR="\${PURVEX_INSTALL_DIR:-PurveX}"

echo "==> Installing PurveX into ./\${TARGET_DIR}"

if [ -e "$TARGET_DIR" ]; then
  echo "ERROR: ./\${TARGET_DIR} already exists. Remove it, or set PURVEX_INSTALL_DIR to install elsewhere." >&2
  exit 1
fi

if command -v git >/dev/null 2>&1; then
  git clone --depth 1 "$REPO_URL" "$TARGET_DIR"
else
  echo "==> git not found -- downloading a source archive instead"
  mkdir -p "$TARGET_DIR"
  curl -fsSL "$TARBALL_URL" | tar -xz -C "$TARGET_DIR" --strip-components=1
fi

cd "$TARGET_DIR"
cp .env.example .env
chmod +x scripts/purvex.sh

echo "==> Installing dependencies (this can take a few minutes)"
./scripts/purvex.sh --setup

echo "==> Starting PurveX"
./scripts/purvex.sh --start
`;

export async function GET() {
  return new NextResponse(SCRIPT, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
