// ==UserScript==
// @name         Cookie Clicker Sync
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://orteil.dashnet.org/cookieclicker/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dashnet.org
// @grant        none
// ==/UserScript==

interface FetchJsonpOptions {
  method?: 'GET' | 'POST';
  body?: string;
}

interface FetchJsonpParams extends FetchJsonpOptions {
  callback: string;
}

interface CookieClickerSaveData {
  CookieClickerGame: string;
}

interface PostSaveDataResponse {
  status: 'success' | 'failed'
}


(function () {
  'use strict';

  const apiUrl = '';
  const loadSucceededTimeKey = 'CookieClickerSyncLoadingSucceededAt';

  const saveNoteKey = [
    'saved',
    '保存'
  ];

  const saveDataKey = 'CookieClickerGame';

  let saveNoteDisplayed = false;

  function fetchJsonp<T>(url: string, params?: FetchJsonpOptions): Promise<T> {
    return new Promise((resolve) => {
      let cbFunctionName = 'callback_';
      while ((window as any)[cbFunctionName]) {
        cbFunctionName += '_';
      }
      const queryParams: FetchJsonpParams = {
        method: params?.method || 'GET',
        body: params?.body,
        callback: cbFunctionName
      };
      const script = document.createElement('script');
      const paramStr = Object
        .entries(queryParams)
        .map(([k, v]: [string, string]) => v && `${k}=${v}`)
        .filter(v => v)
        .join('&');
      script.src = `${url}?${paramStr}`;
      (window as any)[cbFunctionName] = (response: T) => {
        delete (window as any)[cbFunctionName];
        resolve(response);
      };
      document.body.appendChild(script);
    });
  }

  function setAutoSave() {
    setInterval(() => {
      const saveNoteMessage = document.getElementById('notes')!.innerHTML;
      const saveNoteDisplaying = saveNoteKey.some(k => saveNoteMessage.includes(k));
      if (!saveNoteDisplayed && saveNoteDisplaying) {
        onSaveNotePoped();
      }
      saveNoteDisplayed = saveNoteDisplaying;
    }, 500);
  }

  async function onSaveNotePoped() {
    const localSaveData = localStorage.getItem(saveDataKey);
    try {
      const res = await fetchJsonp<PostSaveDataResponse>(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          [saveDataKey]: localSaveData
        })
      });
      if (res.status === 'success') {
        console.log('save success!');
      } else {
        console.error(res);
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function loadRemoteSaveData() {
    const localSaveData = localStorage.getItem(saveDataKey);
    try {
      const json = await fetchJsonp<CookieClickerSaveData>(apiUrl, {
        method: 'GET'
      });
      const remoteSaveData = json[saveDataKey];
      if (remoteSaveData && localSaveData !== remoteSaveData) {
        localStorage.setItem(saveDataKey, remoteSaveData);
        localStorage.setItem(loadSucceededTimeKey, Date.now().toString());
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function onScriptLoaded() {
    const loadedAt = parseInt(localStorage.getItem(loadSucceededTimeKey) ?? '0');
    if (Date.now() - loadedAt <= 1000) {
      setAutoSave();
    } else {
      loadRemoteSaveData();
    }
  }

  onScriptLoaded();
})();