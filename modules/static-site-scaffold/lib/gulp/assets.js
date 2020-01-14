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
const gulpif = require('gulp-if');
const cache = require('gulp-cached');
const htmlmin = require('gulp-htmlmin');
const critical = require('critical').stream;
const sync = require('browser-sync');
const { folders, assets, optimize, images } = require('config');
const path = require('path');

const { workbox } = require('./workbox.js');

const production = process.env.NODE_ENV === 'production';

/**
 * Build Source and Destination for assets
 *
 * @param {object} asset - Asset set to work on
 * @param {array|string} asset.src - Source glob for the asset
 * @param {string} asset.dest - Destination for the output
 *
 * @return {object} - Object including source and destination for the asset
 */
function buildSrcDest(asset) {
  return {
    src: Array.isArray(asset.src) ? asset.src.map(w => path.join(folders.source, w)) : path.join(folders.source, asset.src),
    dest: path.join(folders.output, asset.dest),
  };
}

/**
 * Optimizes and moves images
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function imagesTask(gulp) {
  return function optimizeImages() {
    return gulp
      .src(path.join(folders.output, images.watch.dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Moves videos
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function videosTask(gulp) {
  const { src, dest } = buildSrcDest(assets.videos);
  return function moveVideos() {
    return gulp
      .src(src)
      .pipe(cache('videos'))
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Moves fonts
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function fontsTask(gulp) {
  const { src, dest } = buildSrcDest(assets.fonts);
  return function moveFonts() {
    return gulp
      .src(src)
      .pipe(cache('fonts'))
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Moves manifest
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {function} Gulp task
 */
function manifestTask(gulp) {
  const { src, dest } = buildSrcDest(assets.manifest);
  return function moveFonts() {
    return gulp
      .src(src)
      .pipe(cache('manifest'))
      .pipe(gulp.dest(dest))
      .pipe(sync.stream())
      .on('end', workbox);
  };
}

/**
 * Optimizes HTML using Critical and minimizes output, if in production
 *
 * @param {object} gulp - User instance of Gulp
 * @param {object} config - Configuration of the function
 * @param {string} config.src - Source file glob
 * @param {string} config.dest - Output destination
 *
 * @return {function} Gulp task
 */
function htmlTask(gulp) {
  return function optimizeHTML() {
    const src = path.join(folders.output, '**/*.html');
    const dest = folders.output;
    optimize.critical.base = dest;
    return gulp
      .src(src)
      .pipe(gulpif(production, critical(optimize.critical)))
      .pipe(gulpif(production, htmlmin(optimize.htmlmin)))
      .pipe(gulp.dest(dest));
  };
}

module.exports = {
  imagesTask,
  videosTask,
  fontsTask,
  htmlTask,
  manifestTask,
  buildSrcDest,
};
