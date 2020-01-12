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
import { matchPrecache } from 'workbox-precaching';

/**
 * Normalizes requests that end with a backslash (/) to request the same resource
 * From https://github.com/GoogleChrome/workbox/issues/2217#issuecomment-528023769
 *
 * @param {object} param0 - An object containing a Workbox request object
 * @return {request} Either the original request or a normalized request
 */
async function normalizeIfNeeded({ request }) {
  // Clean out query parameters, and add a trailing '/' if missing.
  const url = new URL(request.url);
  let cleanUrl = url.origin + url.pathname;
  if (!cleanUrl.endsWith('/')) {
    cleanUrl += '/';
  }
  return new Request(cleanUrl);
}

const includesRegExp = /(<!--\s*#include\s*virtual=['|"]\S*['|"]-->)/gm;
const includesFileRegExp = /<!--\s*#include\s*virtual=['|"](\S*)['|"]-->/gm;
const endIncludeRegExp = /<!--\s*#endinclude\s*-->/gm;
const endIncludeWithLeadingRegExp = /[\s\S]*<!--\s*#endinclude\s*-->/gm;

/**
 * Takes a cached response and replaces includes with precached items
 *
 * @param {response} param0 - The response from the cache
 */
async function serviceWorkerInclude({ cachedResponse }) {
  if (!cachedResponse) {
    return null;
  }

  const content = await cachedResponse.text();
  const matches = [...new Set(content.match(includesRegExp))];
  const neededIncludes = await Promise.all(
    matches
      .map(i => i.split(includesFileRegExp)[1])
      .map(async key => {
        const cachedInclude = await matchPrecache(key);
        return cachedInclude.text();
      }),
  );

  const includes = {};

  matches.forEach((include, i) => (includes[include] = neededIncludes[i]));

  const rebuild = content
    .split(includesRegExp)
    .map(i => {
      if (matches.includes(i)) {
        return includes[i];
      }

      return i;
    })
    .join('');

  return new Response(rebuild, { headers: cachedResponse.headers });
}

/**
 * Removes service worker includes before saving items to cache
 *
 * @param {response} param0 - The response that will update the cache
 */
async function swiCleanup({ response }) {
  const content = await response.text();

  const matches = content.match(includesRegExp);
  // const neededIncludes = [...new Set(matches)].map(i => i.split(includesFileRegExp)[1]);
  let open = 0;
  const rebuild = content
    .split(includesRegExp)
    .map(i => {
      // If the current item is the include and it's not included from within
      if (matches && i === matches[0]) {
        matches.shift();
        open++;
        if (open > 1) return '';
        return i;
      }

      const endIncludeSplit = i.split(endIncludeWithLeadingRegExp);
      if (endIncludeSplit.length === 1 && open !== 0) {
        return '';
      }

      const count = i.match(endIncludeRegExp);

      open = open - (count ? count.length : 0);

      return endIncludeSplit.join('');
    })
    .join('');

  return new Response(rebuild, { headers: response.headers });
}

export const navigationNormalizationPlugin = {
  cacheKeyWillBeUsed: normalizeIfNeeded,
  requestWillFetch: normalizeIfNeeded,
  cachedResponseWillBeUsed: serviceWorkerInclude,
  cacheWillUpdate: swiCleanup,
};
