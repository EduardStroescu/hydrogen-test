import {json} from '@shopify/remix-oxygen';

import {CACHE_SHORT} from '~/data/cache';
import {countries} from '~/data/countries';

export async function loader() {
  return json(
    {
      ...countries,
    },
    {
      headers: {
        'cache-control': CACHE_SHORT,
      },
    },
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
