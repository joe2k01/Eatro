#!/usr/bin/env bash
# Rebuild the Yarn patch for ts-pattern from source (fork with P.string.notEmpty).
#
# The published npm package only ships dist/, so yarn patch cannot compile TS in place.
# This clones the upstream repo (https://github.com/gvergnaud/ts-pattern), merges your
# fork branch on top (PR https://github.com/gvergnaud/ts-pattern/pull/348), runs the
# build, copies dist/ into the patch workspace, then yarn patch-commit.
#
# Usage (from repo root): bash scripts/rebuild-ts-pattern-patch.sh
# Optional env:
#   TS_PATTERN_VERSION=5.9.0
#   TS_PATTERN_UPSTREAM=https://github.com/gvergnaud/ts-pattern.git
#   TS_PATTERN_UPSTREAM_REF=main
#   TS_PATTERN_FORK=https://github.com/joe2k01/ts-pattern.git  (fallback: TS_PATTERN_REMOTE)
#   TS_PATTERN_BRANCH=feature/p-string-not-empty

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${TS_PATTERN_VERSION:-5.9.0}"
UPSTREAM="${TS_PATTERN_UPSTREAM:-https://github.com/gvergnaud/ts-pattern.git}"
UPSTREAM_REF="${TS_PATTERN_UPSTREAM_REF:-main}"
FORK="${TS_PATTERN_FORK:-${TS_PATTERN_REMOTE:-https://github.com/joe2k01/ts-pattern.git}}"
BRANCH="${TS_PATTERN_BRANCH:-feature/p-string-not-empty}"
CACHE="${REPO_ROOT}/node_modules/.cache/ts-pattern-not-empty-src"

echo ">> Clone upstream ${UPSTREAM} (${UPSTREAM_REF}) -> ${CACHE}"
rm -rf "${CACHE}"
mkdir -p "$(dirname "${CACHE}")"
git clone --branch "${UPSTREAM_REF}" "${UPSTREAM}" "${CACHE}"

cd "${CACHE}"
echo ">> Fetch fork ${FORK} (${BRANCH}) and merge onto ${UPSTREAM_REF}"
git remote add fork "${FORK}"
git fetch fork "${BRANCH}"
git merge "fork/${BRANCH}" --no-edit -m "Merge ${BRANCH} for Eatro Yarn patch rebuild"

echo ">> Install & build ts-pattern"
npm install
npm run build

if [[ ! -d dist ]]; then
  echo "error: expected dist/ after build" >&2
  exit 1
fi

cd "${REPO_ROOT}"
echo ">> yarn patch ts-pattern@${VERSION}"
PATCH_MSG="$(yarn patch "ts-pattern@npm:${VERSION}" 2>&1)" || true
PATCH_DIR="$(echo "${PATCH_MSG}" | sed -n 's/.*following folder: \(.*\)/\1/p' | head -1 | tr -d '\r')"

if [[ -z "${PATCH_DIR}" || ! -d "${PATCH_DIR}" ]]; then
  echo "Could not parse patch folder from yarn. Output:" >&2
  echo "${PATCH_MSG}" >&2
  exit 1
fi

echo ">> Copy built dist -> ${PATCH_DIR}/dist"
rm -rf "${PATCH_DIR}/dist"
cp -R "${CACHE}/dist" "${PATCH_DIR}/dist"

echo ">> yarn patch-commit"
yarn patch-commit -s "${PATCH_DIR}"

echo ">> Done. Review and commit .yarn/patches/*.patch and package.json."
