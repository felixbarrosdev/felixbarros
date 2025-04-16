module.exports = {
    writerOpts: {
      transform: (commit, context) => {
        const emojiMap = {
          feat: '✨',
          fix: '🐛',
          docs: '📝',
          style: '💄',
          refactor: '♻️',
          perf: '⚡️',
          test: '✅',
          chore: '🤖',
          init: '🚀'
        };
  
        if (commit.type && emojiMap[commit.type]) {
          commit.type = `${emojiMap[commit.type]} ${commit.type}`;
        }
  
        // Actualiza el header para reflejar el tipo transformado con emoji.
        commit.header = `${commit.type}: ${commit.subject}`;
        
        return commit;
      },
      groupBy: 'version',
      commitPartial: '- {{header}} ([{{hash}}](https://github.com/felixbarrosdev/felixbarros/commit/{{hash}}))\n'
    }
  };
  