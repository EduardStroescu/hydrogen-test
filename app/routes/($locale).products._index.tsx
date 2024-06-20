import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {
  Pagination,
  getPaginationVariables,
  getSeoMeta,
} from '@shopify/hydrogen';

import {PageHeader, Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';
import {Grid} from '~/components/Grid';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {ProductSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {SortFilter} from '~/components';

const PAGE_BY = 12;

export const headers = routeHeaders;

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const variables = getPaginationVariables(request, {pageBy: PAGE_BY});
  const {sortKey, reverse} = getSortValuesFromParam(searchParams.get('sort'));

  const data = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {
      ...variables,
      sortKey,
      reverse,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'all-products',
      title: 'All Products',
      handle: 'products',
      descriptionHtml: 'All the store products',
      description: 'All the store products',
      seo: {
        title: 'All Products',
        description: 'All the store products',
      },
      metafields: [],
      products: data.products,
      updatedAt: '',
    },
  });

  return json({
    products: data.products,
    seo,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function AllProducts() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="All Products" variant="allCollections" />
      <Section className="pointer-events-auto">
        <Pagination connection={products}>
          {({nodes, isLoading, NextLink, PreviousLink}) => {
            const itemsMarkup = nodes.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={getImageLoadingPriority(idx)}
              />
            ));

            return (
              <>
                <SortFilter page={'productsIndex'} />
                <Grid data-test="product-grid">{itemsMarkup}</Grid>
                <div className="flex items-center justify-center mt-0">
                  <NextLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                    {isLoading ? 'Loading...' : 'Next'}
                  </NextLink>
                </div>
              </>
            );
          }}
        </Pagination>
      </Section>
    </>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor,
      sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

function getSortValuesFromParam(sortParam: string | null) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE' as ProductSortKeys,
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE' as ProductSortKeys,
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING' as ProductSortKeys,
        reverse: false,
      };
    case 'product-type':
      return {
        sortKey: 'PRODUCT_TYPE' as ProductSortKeys,
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE' as ProductSortKeys,
        reverse: false,
      };
  }
}
