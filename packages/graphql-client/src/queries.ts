import { gql } from "./utils";

export const CONF_BOX_QUERY = gql`
  query boxes(
    $boxIds: [String!]
    $ergoTrees: [String!]
    $ergoTreeTemplateHash: String
    $tokenId: String
    $skip: Int
    $take: Int
  ) {
    boxes(
      boxIds: $boxIds
      ergoTrees: $ergoTrees
      ergoTreeTemplateHash: $ergoTreeTemplateHash
      tokenId: $tokenId
      skip: $skip
      take: $take
      spent: false
    ) {
      boxId
      transactionId
      index
      value
      creationHeight
      ergoTree
      assets {
        tokenId
        amount
      }
      additionalRegisters
    }
  }
`;

export const HEADERS_QUERY = gql`
  query blockHeaders($take: Int) {
    blockHeaders(take: $take) {
      headerId
      timestamp
      version
      adProofsRoot
      stateRoot
      transactionsRoot
      nBits
      extensionHash
      powSolutions
      height
      difficulty
      parentId
      votes
    }
  }
`;

export const CHECK_TX_MUTATION = gql`
  mutation checkTransaction($signedTransaction: SignedTransaction!) {
    checkTransaction(signedTransaction: $signedTransaction)
  }
`;

export const SEND_TX_MUTATION = gql`
  mutation submitTransaction($signedTransaction: SignedTransaction!) {
    submitTransaction(signedTransaction: $signedTransaction)
  }
`;
