module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'body-max-line-length': [2, 'always', 100]  // sigue validando normalmente
    },
    ignores: [
        // omite la comprobación si el header empieza por "chore(release):"
        (commit) => commit.startsWith('chore(release):')
    ]
};
  