module.exports = {
    bracketSpacing: false,
    jsxBracketSameLine: true,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    tabWidth: 4,
    printWidth: 100,
    overrides: [
        {
            files: ['*.md', '*.MD'],
            options: {
                tabWidth: 1,
            },
        },
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
