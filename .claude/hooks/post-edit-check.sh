#!/bin/bash
# PostToolUse hook (Edit|Write): auto-format the edited TypeScript file and
# feed any remaining ESLint errors back to Claude (exit 2 => stderr goes to Claude).

file_path=$(node -e '
let d = "";
process.stdin.on("data", (c) => (d += c)).on("end", () => {
  try {
    console.log(JSON.parse(d).tool_input.file_path ?? "");
  } catch {
    /* no-op: malformed input means nothing to check */
  }
});
')

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"

case "$file_path" in
  "$project_dir"/src/*.ts | "$project_dir"/tests/*.ts) ;;
  *) exit 0 ;;
esac

bin="$project_dir/node_modules/.bin"
[ -x "$bin/prettier" ] && [ -x "$bin/eslint" ] || exit 0

"$bin/prettier" --log-level warn --write "$file_path" >/dev/null 2>&1

if ! lint_output=$(cd "$project_dir" && "$bin/eslint" --fix "$file_path" 2>&1); then
  {
    echo "ESLint found problems in $file_path that --fix could not resolve. Fix them:"
    echo "$lint_output"
  } >&2
  exit 2
fi

exit 0
