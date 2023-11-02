const B = [
  `query boxes($spent: Boolean! $boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int)`,
  `boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take`,
  `boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters beingSpent`
];

export const CONF_BOX_QUERY = `${B[0]} { boxes(spent: $spent ${B[1]}) { ${B[2]} } }`;
export const ALL_BOX_QUERY = `${B[0]} { boxes(spent: $spent ${B[1]}) { ${B[2]} } mempool { boxes(${B[1]}) { ${B[2]} } } }`;
export const HEADERS_QUERY = `query blockHeaders($take: Int) { blockHeaders(take: $take) {headerId timestamp version adProofsRoot stateRoot transactionsRoot nBits extensionHash powSolutions height difficulty parentId votes } }`;
export const CHECK_TX_MUTATION = `mutation checkTransaction($signedTransaction: SignedTransaction!) { checkTransaction(signedTransaction: $signedTransaction) }`;
export const SEND_TX_MUTATION = `mutation submitTransaction($signedTransaction: SignedTransaction!) { submitTransaction(signedTransaction: $signedTransaction) }`;
