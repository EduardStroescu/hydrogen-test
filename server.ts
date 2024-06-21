// @ts-ignore
// Virtual entry point for the app
import * as remixBuild from '@remix-run/dev/server-build';
import {createRequestHandler} from '@remix-run/server-runtime';
import {
  cartGetIdDefault,
  cartSetIdDefault,
  createCartHandler,
  createCustomerAccountClient,
  createStorefrontClient,
} from '@shopify/hydrogen';

import {AppSession} from '~/lib/session.server';
import {getLocaleFromRequest} from '~/lib/utils';

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(request: Request, executionContext: ExecutionContext) {
    try {
      const env: Env = {
        SESSION_SECRET: '',
        PUBLIC_STOREFRONT_API_TOKEN: '',
        PRIVATE_STOREFRONT_API_TOKEN: '',
        PUBLIC_STORE_DOMAIN: '',
        PUBLIC_STOREFRONT_ID: '',
        PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: '',
        PUBLIC_CUSTOMER_ACCOUNT_API_URL: '',
        PUBLIC_CHECKOUT_DOMAIN: '',
        PUBLIC_EMAILJS_SERVICE_ID: '',
        PUBLIC_EMAILJS_TEMPLATE_ID: '',
        PUBLIC_EMAILJS_PUBLIC_KEY: '',
      };

      env.SESSION_SECRET = process.env.SESSION_SECRET as string;
      env.PUBLIC_STOREFRONT_API_TOKEN = process.env
        .PUBLIC_STOREFRONT_API_TOKEN as string;
      env.PRIVATE_STOREFRONT_API_TOKEN = process.env
        .PRIVATE_STOREFRONT_API_TOKEN as string;
      env.PUBLIC_STORE_DOMAIN = process.env.PUBLIC_STORE_DOMAIN as string;
      env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID = process.env
        .PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID as string;
      env.PUBLIC_CUSTOMER_ACCOUNT_API_URL = process.env
        .PUBLIC_CUSTOMER_ACCOUNT_API_URL as string;
      env.PUBLIC_CHECKOUT_DOMAIN = process.env.PUBLIC_CHECKOUT_DOMAIN as string;
      env.PUBLIC_EMAILJS_SERVICE_ID = process.env
        .PUBLIC_EMAILJS_SERVICE_ID as string;
      env.PUBLIC_EMAILJS_TEMPLATE_ID = process.env
        .PUBLIC_EMAILJS_TEMPLATE_ID as string;
      env.PUBLIC_EMAILJS_PUBLIC_KEY = process.env
        .PUBLIC_EMAILJS_PUBLIC_KEY as string;
      /**
       * Open a cache instance in the worker and a custom session instance.
       */
      if (!env?.SESSION_SECRET) {
        throw new Error(
          'SESSION_SECRET process.environment variable is not set',
        );
      }

      const waitUntil = executionContext.waitUntil.bind(executionContext);
      const [session] = await Promise.all([
        AppSession.init(request, [process.env.SESSION_SECRET as string]),
      ]);

      /**
       * Create Hydrogen's Storefront client.
       */
      const {storefront} = createStorefrontClient({
        buyerIp: request.headers.get('x-forwarded-for') ?? undefined,
        waitUntil,
        i18n: getLocaleFromRequest(request),
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: process.env.PUBLIC_STOREFRONT_ID,
        // requestGroupId: request.headers.get('request-id'),
      });

      const customerAccount = createCustomerAccountClient({
        waitUntil,
        request,
        session,
        customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
        customerAccountUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
      });

      const cart = createCartHandler({
        storefront,
        customerAccount,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
      });

      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: 'production',
        getLoadContext: () => ({
          session,
          waitUntil,
          storefront,
          customerAccount,
          cart,
          env,
        }),
      });

      const response = await handleRequest(request);

      if (session.isPending) {
        response.headers.set('Set-Cookie', await session.commit());
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        // return storefrontRedirect({request, response, storefront});
      }

      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
