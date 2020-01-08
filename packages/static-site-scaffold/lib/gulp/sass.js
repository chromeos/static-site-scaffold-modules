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
const lazypipe = require('lazypipe');
const gulpif = require('gulp-if');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sassLint = require('gulp-sass-lint');
const sourcemaps = require('gulp-sourcemaps');
const sync = require('browser-sync');
const { folders, sass: sassConfig } = require('config');
const path = require('path');

const { workbox } = require('./workbox.js');

const production = process.env.NODE_ENV === 'production';

const lintSass = lazypipe()
  .pipe(sassLint)
  .pipe(sassLint.format)
  .pipe(() => gulpif(production, sassLint.failOnError()));

/**
 * Compiles Sass files to CSS
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task to lint and compile Sass
 */
function sassTask(gulp) {
  const src = path.join(folders.input, sassConfig.src);
  const dest = path.join(folders.output, sassConfig.dest);
  return function compileSass() {
    return gulp
      .src(src)
      .pipe(gulpif(sassConfig.lint, lintSass()))
      .pipe(sourcemaps.init())
      .pipe(gulpif(production, sass(sassConfig.config), sass(sassConfig.config).on('error', sass.logError)))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

module.exports = {
  lintSass,
  sassTask,
};
