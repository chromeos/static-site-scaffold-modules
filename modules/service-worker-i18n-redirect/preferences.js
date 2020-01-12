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
import * as db from 'idb-keyval';

/**
 * Preference Storage
 */
class PreferenceStore {
  /**
   * Creates a new Key/Val Indexed DB store for Preferences
   */
  constructor() {
    this.store = new db.Store('preferences', 'preferences');
  }

  /**
   * Retrieves the value of a given key
   * @param {string} key - Key of preference being queried
   *
   * @return {*} - A promise that resolves to the key's value
   */
  get(key) {
    return db.get(key, this.store);
  }

  /**
   *
   * @param {string} key - Key of preference to update
   * @param {*} value - Value to set the preference to
   *
   * @return {null} - Promise that resolves to nothing
   */
  set(key, value) {
    return db.set(key, value, this.store);
  }

  // keys() {
  //   return db.keys(this.store);
  // }

  // del(key) {
  //   return db.del(key, this.store);
  // }

  // clear() {
  //   return db.clear(this.store);
  // }
}

export const preferences = new PreferenceStore();
