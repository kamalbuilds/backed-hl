#!/bin/zsh
# critic.sh <round> : independent critique of r<round> shots by codex (read-only sandbox), prompt on stdin
cd /Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web; D=docs/design; N=$1
sed "s/r3-/r$N-/g" $D/review/critic-prompt.md | codex exec -s read-only --skip-git-repo-check -C "$PWD" -i $D/r$N-1440.png -i $D/r$N-390.png -i $D/r$N-1440-full.png -i $D/r$N-390-full.png -i design-research/negative/backed-v1-lime-1440.png -i design-research/negative/backed-v2-terminal-1440.png - > $D/review/critic-r$N.md 2> $D/review/critic-r$N.err
echo CRITIC_DONE $? >> $D/review/critic-r$N.md
