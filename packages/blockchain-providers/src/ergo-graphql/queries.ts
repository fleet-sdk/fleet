const B = [
  "$boxIds: [String!] $ergoTrees: [String!] $ergoTreeTemplateHash: String $tokenId: String $skip: Int $take: Int",
  "boxIds: $boxIds ergoTrees: $ergoTrees ergoTreeTemplateHash: $ergoTreeTemplateHash tokenId: $tokenId skip: $skip take: $take",
  "boxId transactionId index value creationHeight ergoTree assets { tokenId amount } additionalRegisters"
];

export const CONF_BOXES_QUERY = `query boxes($spent: Boolean! ${B[0]}) { boxes(spent: $spent ${B[1]}) { ${B[2]} beingSpent } }`;
export const UNCONF_BOXES_QUERY = `query boxes(${B[0]}) { mempool { boxes(${B[1]}) { ${B[2]} beingSpent } } }`;
export const ALL_BOXES_QUERY = `query boxes($spent: Boolean! ${B[0]}) { boxes(spent: $spent ${B[1]}) { ${B[2]} beingSpent } mempool { boxes(${B[1]}) { ${B[2]} beingSpent } } }`;

export const HEADERS_QUERY =
  "query blockHeaders($take: Int) { blockHeaders(take: $take) {headerId timestamp version adProofsRoot stateRoot transactionsRoot nBits extensionHash powSolutions height difficulty parentId votes } }";
export const CHECK_TX_MUTATION =
  "mutation checkTransaction($signedTransaction: SignedTransaction!) { checkTransaction(signedTransaction: $signedTransaction) }";
export const SEND_TX_MUTATION =
  "mutation submitTransaction($signedTransaction: SignedTransaction!) { submitTransaction(signedTransaction: $signedTransaction) }";

const T = [
  "$addresses: [String!], $transactionIds: [String!], $skip: Int, $take: Int",
  "addresses: $addresses, transactionIds: $transactionIds, skip: $skip, take: $take",
  `transactionId timestamp inputs { proofBytes extension index box { ${B[2]} } } dataInputs { boxId }`
];
export const CONF_TX_QUERY = `query confirmedTransactions(${T[0]}  $onlyRelevantOutputs: Boolean) { transactions(${T[1]}) { ${T[2]} outputs(relevantOnly: $onlyRelevantOutputs) { ${B[2]} } inclusionHeight headerId index } }`;
export const UNCONF_TX_QUERY = `query unconfirmedTransactions(${T[0]}) { mempool { transactions(${T[1]}) { ${T[2]} outputs { ${B[2]} } } } }`;
