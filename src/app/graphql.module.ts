import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';

const endpoint = 'murky-cattle.us-west-2.aws.cloud.dgraph.io';

export function createApollo(httpLink: HttpLink) {

  const token = '';

  const getHeaders = async () => {
    return {
      "X-Auth-Token": token,
    };
  };

  const http = ApolloLink.from([
    setContext(async () => {
      return {
        headers: await getHeaders(),
      };
    }),
    httpLink.create({
      uri: `https://${endpoint}`,
    }),
  ]);

  // Create a WebSocket link:
  const ws = new WebSocketLink({
    uri: `wss://${endpoint}`,
    options: {
      reconnect: true,
      connectionParams: async () => {
        return await getHeaders()
      }
    },
  });

  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    ws,
    http
  );
  return {
    link: link,
    cache: new InMemoryCache(),
  };
  /*return new Promise((resolve) => {
    resolve({
      link: errorLink.concat(link),
      cache: new InMemoryCache()
    });
  });*/
}

@NgModule({
  imports: [HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    },
  ],
})
export class GraphQLModule { }
