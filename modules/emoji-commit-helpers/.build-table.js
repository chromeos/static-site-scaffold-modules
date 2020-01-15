const emoji = require('./emoji');

const output = `| Type | Emoji | Code | Description |\n| :--- | :---: | :--- | :--- |\n${emoji.map(e => `| ${e.name} | ${e.emoji} | \`${e.code}\` | ${e.description} |`).join('\n')}`;

console.log(output);
