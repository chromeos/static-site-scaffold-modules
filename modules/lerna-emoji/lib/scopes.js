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
const importCwd = require('import-cwd');
const Project = importCwd('@lerna/project');

module.exports = async function getScopes(context) {
  const ctx = context || {};
  const cwd = ctx.cwd || process.cwd();
  const project = new Project(cwd);
  const packages = (await project.getPackages()).map(pkg => ({
    name: pkg.name.charAt(0) === '@' ? pkg.name.split('/')[1] : pkg.name,
    description: pkg.get('description') || '',
  }));

  packages.unshift({
    name: 'root',
    description: 'Root project',
  });

  return packages;
};
