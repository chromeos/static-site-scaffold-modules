const importCwd = require('import-cwd');
const Project = importCwd('@lerna/project');

module.exports = async function getPackages(context) {
  const ctx = context || {};
  const cwd = ctx.cwd || process.cwd();
  const project = new Project(cwd);
  const packages = (await project.getPackages()).map(pkg => pkg.name).map(name => (name.charAt(0) === '@' ? name.split('/')[1] : name));
  packages.unshift('root');
  return packages;
};
