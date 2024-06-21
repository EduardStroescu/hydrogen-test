import {type HydrogenSession} from '@shopify/hydrogen';
import {
  createCookieSessionStorageFactory,
  createCookieFactory,
} from '@remix-run/server-runtime';
import type {
  SignFunction,
  UnsignFunction,
  SessionStorage,
  Session,
} from '@remix-run/server-runtime';

const encoder = new TextEncoder();

export const sign: SignFunction = async (value, secret) => {
  const data = encoder.encode(value);
  const key = await createKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(
    /=+$/,
    '',
  );

  return value + '.' + hash;
};

export const unsign: UnsignFunction = async (cookie, secret) => {
  const value = cookie.slice(0, cookie.lastIndexOf('.'));
  const hash = cookie.slice(cookie.lastIndexOf('.') + 1);

  const data = encoder.encode(value);
  const key = await createKey(secret, ['verify']);
  const signature = byteStringToUint8Array(atob(hash));
  const valid = await crypto.subtle.verify('HMAC', key, signature, data);

  return valid ? value : false;
};

async function createKey(secret: string, usages: CryptoKey['usages']) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    usages,
  );

  return key;
}

function byteStringToUint8Array(byteString: string): Uint8Array {
  const array = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }

  return array;
}

/**
 * This is a custom session implementation for your Hydrogen shop.
 * Feel free to customize it to your needs, add helper methods, or
 * swap out the cookie-based implementation with something else!
 */
export class AppSession implements HydrogenSession {
  #sessionStorage;
  #session;

  constructor(sessionStorage: SessionStorage, session: Session) {
    this.#sessionStorage = sessionStorage;
    this.#session = session;
  }

  static async init(request: Request, secrets: string[]) {
    const createCookie = createCookieFactory({sign, unsign});
    const createCookieSessionStorage =
      createCookieSessionStorageFactory(createCookie);
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    });

    const session = await storage
      .getSession(request.headers.get('Cookie'))
      .catch(() => storage.getSession());

    return new this(storage, session);
  }

  get has() {
    return this.#session.has;
  }

  get get() {
    return this.#session.get;
  }

  get flash() {
    return this.#session.flash;
  }

  get unset() {
    return this.#session.unset;
  }

  get set() {
    return this.#session.set;
  }

  destroy() {
    return this.#sessionStorage.destroySession(this.#session);
  }

  commit() {
    return this.#sessionStorage.commitSession(this.#session);
  }
}
