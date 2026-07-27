import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const client = new ApolloClient({
  link: new HttpLink({ uri: BACKEND_URL }),
  cache: new InMemoryCache(),
});