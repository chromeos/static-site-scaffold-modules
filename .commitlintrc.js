const Project = require('@lerna/project');

async function getPackages(context) {
  const ctx = context || {};
  const cwd = ctx.cwd || process.cwd();
  const project = new Project(cwd);
  const packages = (await project.getPackages()).map(pkg => pkg.name).map(name => (name.charAt(0) === '@' ? name.split('/')[1] : name));
  packages.push('root');
  return packages;
}

module.exports = {
  extends: ['gitmoji'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)(?:\s)(?:\((.*?)\))?\s((?:.*(?=\())|.*)(?:\(#(\d*)\))?/,
      headerCorrespondence: ['type', 'scope', 'subject', 'ticket'],
    },
  },
  utils: { getPackages },
  rules: {
    'scope-enum': ctx => getPackages(ctx).then(packages => [2, 'always', packages]),
  },
};
