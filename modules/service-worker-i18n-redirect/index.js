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

/**
 *
 * @param {Array} languages - Array of langcodes to include
 * @param {Object} preferences - An object that contains a 'get' method
 * @param {String<Promise>} preferences.get - The preferred language to use
 * @param {Object} cachingStrategy - A Workbox caching strategy
 *
 * @return {Function} A function to handle the incoming request, which will either redirect a user based on chosen language or will use the htmlCachingStrategy to resolve the request
 */
export function i18nHandler(languages, preferences, cachingStrategy) {
  return async function i18nRouteHandler({ event }) {
    const lang = await preferences.get('lang');
    const { request } = event;

    const urlLang = request.url.replace(self.location.origin, '').split('/');
    const currentLang = urlLang[1];
    const isALanguage = languages.includes(currentLang);
    const isRightLanguage = currentLang !== lang;
    const shouldRefresh = new URL(request.url).searchParams.get('locale_redirect') !== 'false';

    if (isALanguage && isRightLanguage && shouldRefresh) {
      urlLang[1] = lang;
      const redirectURL = `${self.location.origin}${urlLang.join('/')}`;
      return Response.redirect(redirectURL, 302);
    }

    return cachingStrategy.handle({ event, request });
  };
}
