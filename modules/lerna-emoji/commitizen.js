const scopes = require('./lib/scopes');
const emoji = require('./lib/emoji');
const fuse = require('fuse.js');
const wrap = require('wrap-ansi');

/**
 * @return {Object[]} Array of objects
 */
function getEmojiChoices() {
  const maxNameLength = emoji.reduce((maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength), 0);

  return emoji.map(choice => ({
    name: `${choice.name.padEnd(maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: choice.emoji,
    code: choice.code,
  }));
}

/**
 *
 */
async function createQuestions() {
  const choices = getEmojiChoices();

  const fuzzy = new fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name', 'code'],
  });

  const questions = [
    {
      type: 'autocomplete',
      name: 'type',
      message: "Select the type of change you're committing:",
      source(answersSoFar, query) {
        return Promise.resolve(query ? fuzzy.search(query) : choices);
      },
    },
    {
      type: 'list',
      name: 'scope',
      message: 'Specify a scope:',
      choices: scopes,
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Write a short description:',
      validate(input) {
        return input.length > 3 && input.length <= 50;
      },
    },
    {
      type: 'input',
      name: 'body',
      message: 'Provide a longer description:',
    },
    {
      type: 'input',
      name: 'issues',
      message: 'List any issue closed (1, 2, 3, ...):',
    },
  ];

  return questions;
}

/**
 *
 * @param {object} answers - Answers from incoming stuff
 *
 * @return {array} - Array of head/body/foot
 */
function format(answers) {
  const head = `${answers.type} (${answers.scope.trim()}) ${answers.subject.trim()}`;
  const body = wrap(answers.body || '', 100);
  const footer = answers.issues ? `Closes #${answers.issues.split(', ').join(', closes #')}` : '';

  return [head, body, footer]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

module.exports = {
  prompter(cz, commit) {
    cz.prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    createQuestions()
      .then(cz.prompt)
      .then(format)
      .then(commit);
  },
};
