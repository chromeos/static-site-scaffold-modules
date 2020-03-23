/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const config = require('./lib/config');
const Fuse = require('fuse.js');
const wrap = require('wrap-ansi');

/**
 * @param {Object[]} options - Array of objects
 * @return {Object[]} Array of objects
 */
function generateAutocomplete(options) {
  const maxNameLength = options.reduce((maxLength, option) => (option.name.length > maxLength ? option.name.length : maxLength), 0);

  return options.map(choice => {
    let name = `${choice.name.padEnd(maxNameLength)}  ${choice.emoji || '|'}  ${choice.description}`;
    if (name.length > 80) {
      name = name.substring(0, 79) + '…';
    }

    return {
      name,
      value: choice.emoji || choice.name,
      description: choice.description,
      code: choice.code || '',
    };
  });
}

/**
 *
 */
async function createQuestions() {
  const choices = generateAutocomplete(config.emoji);
  const scopeChoices = generateAutocomplete(await config.scopes());

  const fuzzy = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name', 'code'],
  });

  const fuzzyScope = new Fuse(scopeChoices, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['name', 'description'],
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
      type: 'autocomplete',
      name: 'scope',
      message: 'Specify a scope:',
      source(answersSoFar, query) {
        return Promise.resolve(query ? fuzzyScope.search(query) : scopeChoices);
      },
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Write a short description:',
      validate(input) {
        if (input.length < 3) return 'Subject must be at least 3 characters long';
        if (input.length > 50) return 'Subject must not exceed 50 characters';
        return true;
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
