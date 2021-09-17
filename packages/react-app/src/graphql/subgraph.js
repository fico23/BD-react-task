import { gql } from "apollo-boost";

// See more example queries on https://thegraph.com/explorer/subgraph/paulrberg/create-eth-app
const GET_TRANSFERS = gql`
  {
    transfers(first: 10) {
      id
      from
      to
      value
    }
  }
`;

const SET_TRANSFER = gql`
mutation SetTransfer($from: String!, $to: String!, $value: String!) {
    transfers(from: $from, to: $to, value: $value) { 
      id
      from
      to
      value
    }
  }
`;

export {GET_TRANSFERS, SET_TRANSFER};
