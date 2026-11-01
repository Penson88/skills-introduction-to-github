#!/usr/bin/env bash
# Publish ONLY atlas/dist to gh-pages, preserving the source worktree and branch history.
# Run from any directory after npm run build. Uses native Git authentication.
set -euo pipefail
repo_root=$(git -C "$(dirname "$0")/../.." rev-parse --show-toplevel)
dist_dir="$repo_root/atlas/dist"
test -f "$dist_dir/index.html"
test -f "$dist_dir/data/countries.geojson"
test -f "$dist_dir/data/research.json"
: > "$dist_dir/.nojekyll"
index_dir=$(mktemp -d)
trap 'rm -rf "$index_dir"' EXIT
export GIT_INDEX_FILE="$index_dir/index"
git -C "$repo_root" --work-tree="$dist_dir" add --all -- .
site_tree=$(git -C "$repo_root" write-tree)
# Guard against publishing repository sources or credential/configuration files.
while IFS= read -r entry; do
  case "$entry" in
    index.html|.nojekyll|assets|data|terrain) ;;
    *) printf 'Unexpected build entry: %s; refusing to publish.\n' "$entry" >&2; exit 1 ;;
  esac
done < <(git -C "$repo_root" ls-tree --name-only "$site_tree")
git -C "$repo_root" cat-file -e "$site_tree:index.html"
git -C "$repo_root" cat-file -e "$site_tree:data/research.json"
# Read the remote branch first; any subsequent race is rejected by a normal push.
remote_head=$(git -C "$repo_root" ls-remote origin refs/heads/gh-pages | cut -f1)
parents=()
if [ -n "$remote_head" ]; then
  git -C "$repo_root" fetch --no-tags origin refs/heads/gh-pages
  parents=(-p "$remote_head")
fi
site_commit=$(git -C "$repo_root" commit-tree "$site_tree" "${parents[@]}" -m 'Publish Submerged Geographies static atlas')
git -C "$repo_root" push origin "$site_commit:refs/heads/gh-pages"
printf 'Published static files to gh-pages commit %s\n' "$site_commit"
printf 'Confirm GitHub Settings > Pages uses gh-pages / (root), then verify the served website.\n'
