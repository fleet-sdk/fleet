export const mockCompileScript = {
  address: "5yE8zxMTsrGEPw5WM5ET"
};

export const mockIndexedHeight = {
  indexedHeight: 1125453,
  fullHeight: 1125453
};

export const mockCompileError = {
  error: 400,
  reason: "bad.request",
  detail:
    "\nline 1: HEIGT > 100\n        ^\nCannot assign type for variable 'HEIGT' because it is not found in env Map(bit_& -> [T](T,T) => T, decodePoint -> (Coll[SByte$]) => SGroupElement, substConstants -> [T](Coll[SByte$],Coll[SInt$],Coll[T]) => Coll[SByte$], * -> [T](T,T) => T, bit_>>> -> [T](T,T) => T, ZKProof -> (SSigmaProp) => SBoolean, <= -> [T](T,T) => SBoolean, % -> [T](T,T) => T, fromBase58 -> (SString) => Coll[SByte$], executeFromSelfReg -> [T](SByte$,Option[T]) => T, atLeast -> (SInt$,Coll[SSigmaProp]) => SSigmaProp, anyOf -> (Coll[SBoolean]) => SBoolean, < -> [T](T,T) => SBoolean, fromBase16 -> (SString) => Coll[SByte$], unary_- -> [T](T) => T, executeFromVar -> [T](SByte$) => T, unary_! -> (SBoolean) => SBoolean, bit_^ -> [T](T,T) => T, fromBase64 -> (SString) => Coll[SByte$], || -> (SBoolean,SBoolean) => SBoolean, >= -> [T](T,T) => SBoolean, bit_>> -> [T](T,T) => T, min -> [T](T,T) => T, proveDlog -> (SGroupElement) => SSigmaProp, deserialize -> [T](SString) => T, sha256 -> (Coll[SByte$]) => Coll[SByte$], - -> [T](T,T) => T, sigmaProp -> (SBoolean) => SSigmaProp, bit_<< -> [T](T,T) => T, xorOf -> (Coll[SBoolean]) => SBoolean, max -> [T](T,T) => T, getVar -> [T](SByte$) => Option[T], == -> [T](T,T) => SBoolean, allZK -> (Coll[SSigmaProp]) => SSigmaProp, avlTree -> (SByte$,Coll[SByte$],SInt$,Option[SInt$]) => SAvlTree, unary_~ -> [T](T) => T, anyZK -> (Coll[SSigmaProp]) => SSigmaProp, byteArrayToBigInt -> (Coll[SByte$]) => SBigInt$, + -> [T](T,T) => T, != -> [T](T,T) => SBoolean, binary_| -> (Coll[SByte$],Coll[SByte$]) => Coll[SByte$], && -> (SBoolean,SBoolean) => SBoolean, bit_| -> [T](T,T) => T, proveDHTuple -> (SGroupElement,SGroupElement,SGroupElement,SGroupElement) => SSigmaProp, byteArrayToLong -> (Coll[SByte$]) => SLong$, longToByteArray -> (SLong$) => Coll[SByte$], outerJoin -> [K,L,R,O](Coll[(K,L)],Coll[(K,R)],(K,L) => O,(K,R) => O,(K,L,R) => O) => Coll[(K,O)], ^ -> (SBoolean,SBoolean) => SBoolean, / -> [T](T,T) => T, > -> [T](T,T) => SBoolean, allOf -> (Coll[SBoolean]) => SBoolean, blake2b256 -> (Coll[SByte$]) => Coll[SByte$])"
};

export const mockGetBalance = {
  confirmed: {
    nanoErgs: 160000000,
    tokens: [
      {
        tokenId: "b10b0356aae5fbf56ec4c29c52e4c73e2699d3432768f0f9eb39fd79ea7f7d10",
        amount: 1,
        decimals: 0,
        name: "CYTI Blob 3/10"
      },
      {
        tokenId: "801d371889cfbcf7517468eaad2193cdf933e68d702e245670e1f9d7405e4092",
        amount: "9223372036854776000",
        decimals: 0,
        name: "tSPF_706fb118_f3ad0c62_LP_YF"
      },
      {
        tokenId: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40",
        amount: 10,
        decimals: 0,
        name: "kushti"
      }
    ]
  },
  unconfirmed: {
    nanoErgs: 100000000,
    tokens: [
      {
        tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
        amount: 100,
        decimals: 0,
        name: "COMET"
      }
    ]
  }
};

export const mockGetBoxById = {
  globalIndex: 33263731,
  inclusionHeight: 1107200,
  address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
  spentTransactionId: "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842",
  boxId: "45ce2cd800136a44f2cbf8b48472c7585cd37530de842823684b38a0ffa317a6",
  value: 735400000,
  ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
  assets: [
    {
      tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
      amount: 22154563
    },
    {
      tokenId: "574299d82b17b60de2bada4b5a1b37ac55e7bfe37a8267a2fd0bf72b1127586e",
      amount: 9
    }
  ],
  creationHeight: 1107198,
  additionalRegisters: {},
  transactionId: "75ca1dbd6d6db1e07dafe0dd2bd61abcd7588114328c71a5643953ea4fe0369b",
  index: 2
};

export const mockLastHeaders = [
  {
    extensionId: "66a6c3d35184fd0498a8adf289e7753c3064a7d1113d2493c4f86d037d0966e6",
    difficulty: "2097782286450688",
    votes: "000000",
    timestamp: 1698593168610,
    size: 220,
    stateRoot: "5b2cc1c64a4baf25f5bc28a86efe0d6ba6e1d9d460cb9673e4836a4893cf75f919",
    height: 1123070,
    nBits: 117928940,
    version: 3,
    id: "4b1023dfbc145a605e9c25944ef3745f44e4721ac7c85ee8ecea5d1d20e5705a",
    adProofsRoot: "a91abbcfd3be2246adf87a3fe48b67328bd17df2fbc83df865568bfd7209789d",
    transactionsRoot: "957768fbce400004be25809b6ffca881a8f0c105e44117613163d57a429f6c24",
    extensionHash: "8a1f39f993a5d7f4ac1e80fbf4d22e0492dd450fa71a0636ee6c064f3e2b7f4a",
    powSolutions: {
      pk: "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "c7c900014f82143a",
      d: 0
    },
    adProofsId: "125e6a1d91a97f39646f10f81639b00092750a0c275ba50e2e900dfa731240d4",
    transactionsId: "db92c5f94a13868d10c4fd1440fd5eaa068a507a8e344ec1622558278e117461",
    parentId: "26cf5655d32cce0c4376c682e9b8b679c75f91e108dd6f51ac8d9005df1b7cd4"
  },
  {
    extensionId: "6427976189133462c92a20aeca4e1d6f0bc2d99f1056debacaaaa372b4dc2a55",
    difficulty: "2097782286450688",
    votes: "000000",
    timestamp: 1698593176447,
    size: 220,
    stateRoot: "b8c29d178c5b6713cfe5423503e54b5b84f2c0cfeec333164c667e780b7b9c3919",
    height: 1123071,
    nBits: 117928940,
    version: 3,
    id: "9fe3f61bff66f506a0e709d7f896c66c646aedaedf1f8b09df5e0ea71f9c9e36",
    adProofsRoot: "7f26d0bc5b287e10c42d67bca5a03f46ca11545d78eaa079c78af0be733b8f80",
    transactionsRoot: "766b6a80433abb25f074f6ce083f079d11fa21835e8db0c9a9f89a5ccbde575a",
    extensionHash: "8a1f39f993a5d7f4ac1e80fbf4d22e0492dd450fa71a0636ee6c064f3e2b7f4a",
    powSolutions: {
      pk: "033133187bde16d8b847923852ac7fe5bfbb50a81f1c040d00850e1f776c18e1b5",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "a505185d48c7d122",
      d: 0
    },
    adProofsId: "3149af308e522bb754ae3a30f750f90e85716208e3c5095cd8797c88925cb8dc",
    transactionsId: "36269c6a35614b9cc93a5ceb89ee3f29941ed88527011298b2e222cc00f781e7",
    parentId: "4b1023dfbc145a605e9c25944ef3745f44e4721ac7c85ee8ecea5d1d20e5705a"
  },
  {
    extensionId: "2048aa213ab3fe46271f8ecce02a663f072fbd6aa9a961fbafe4e0d0adfa30bf",
    difficulty: "2097782286450688",
    votes: "000000",
    timestamp: 1698593209800,
    size: 220,
    stateRoot: "0a4c796c06569eb6b90542104023eabfa92261cad4ad64ac80cb67a3f03757f419",
    height: 1123072,
    nBits: 117928940,
    version: 3,
    id: "e3e390442bbf0cd0cf4c36670debb5b177e158ba289a7a0cc40bdd0e224eb671",
    adProofsRoot: "4a4a59d6813094865d5e69ddd1c1e2312e0544aca0214ada276643328a84261c",
    transactionsRoot: "1af45e6e54ae9dc814eb6cbc7a303e295a0e47c1c89c6bd5b41e6ecf574ccde9",
    extensionHash: "d5faf4ebf97881b114a827caba057bff3d91d707548b20750eb6ddbf8a3b83f0",
    powSolutions: {
      pk: "03677d088e4958aedcd5cd65845540e91272eba99e4d98e382f5ae2351e0dfbefd",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "2bfb0e8048a128df",
      d: 0
    },
    adProofsId: "450a369ed55904abfbf91123cb6636db4534f71534deee51d304db85026a4243",
    transactionsId: "6febe02d708441fc18285120c8c09a22c658d573eb71e729cf7fb79ad1984bb1",
    parentId: "9fe3f61bff66f506a0e709d7f896c66c646aedaedf1f8b09df5e0ea71f9c9e36"
  },
  {
    extensionId: "75df37f7767a409ae93eb217b3171ddcb8c1bd82cd3aff95cf6a3978754ae1ed",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593356349,
    size: 220,
    stateRoot: "fb75add6464acefbfe07dbd48c25d056ac66da6e853ea5b10efe4d0b5a9cdb6e19",
    height: 1123073,
    nBits: 117957061,
    version: 3,
    id: "9c315366cc3522ef5837680ed7130080309f2971fb5ae0d21a4b22549cdb4424",
    adProofsRoot: "7507bbde1fbf16af3728b9f74a6c31182a3b5ff681f9769cc7ee9b6298fb1ff5",
    transactionsRoot: "b59cad935e8409af9206db4b1086f1b3d60d2037603236a3db2c2ceeb5ce011f",
    extensionHash: "5fc3fdd4b03484462dc20f0e5d79e8067858f6dc4b559cc25711d95ee2bf8d9c",
    powSolutions: {
      pk: "03677d088e4958aedcd5cd65845540e91272eba99e4d98e382f5ae2351e0dfbefd",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "d16577000bbeb9e5",
      d: 0
    },
    adProofsId: "c51293ee72e73df31d829fee24028fcbbe28de7727319253dcce90dd494f2e02",
    transactionsId: "a34ceeb0fe1e60cfb5adad316d42237ea53857acfc3244c6bba216646f5021c2",
    parentId: "e3e390442bbf0cd0cf4c36670debb5b177e158ba289a7a0cc40bdd0e224eb671"
  },
  {
    extensionId: "3ccc04c97f50df4e3c43dd54f492f5a8fe8389465dc2d8e2789ba7a7a066c8df",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593376579,
    size: 220,
    stateRoot: "5d7a19bcfa65fb0e0135607db934e693bc3234262b66b10215e0c554713691e619",
    height: 1123074,
    nBits: 117957061,
    version: 3,
    id: "8a1b9a9246f8daf8aa214eeca019f1bdfcb119c991f6a8085ccb888bb864bb13",
    adProofsRoot: "45b93a8e1184645dd27b67f915460b3e51d233242fccd8fa212c92c1bb10366c",
    transactionsRoot: "97b3483c8d0f43a43144c571483a0ff666881d5bcb1c3ecec552c4dac6345225",
    extensionHash: "5fc3fdd4b03484462dc20f0e5d79e8067858f6dc4b559cc25711d95ee2bf8d9c",
    powSolutions: {
      pk: "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "821e298d318a391b",
      d: 0
    },
    adProofsId: "09c54e90b45a84bed447f7632f3215df05dbf45d4958952eb11960be128ee366",
    transactionsId: "7301f88d4269d7fb64635707ace1fd8ed3988f57c1fdc81f9c4a0a43dc741675",
    parentId: "9c315366cc3522ef5837680ed7130080309f2971fb5ae0d21a4b22549cdb4424"
  },
  {
    extensionId: "3ed5d0eef348e683ff12c6c20fc7b673f2d503544ea87bc2d30cb204f04d27c3",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593445846,
    size: 220,
    stateRoot: "7035d71df737faffa8971ee1151290a3f8386298198e06dc57ef3688c25fcba219",
    height: 1123075,
    nBits: 117957061,
    version: 3,
    id: "55bd9fada97a64d033d9a0a3e7830935a7d7c83e62778a49d3fe797b685e6bc6",
    adProofsRoot: "c6126f01df5e4912145dbdff21b67c5483d38e59afa0c4a0baf8324e1ba2d384",
    transactionsRoot: "442bd38db145887825d5b57404809330b6945046c087e129da8712dc48380055",
    extensionHash: "358a31aa4192f0a0960a7a57f4aca16a3f8244ff87189870831406e36f4011d9",
    powSolutions: {
      pk: "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "569ce7069f6945a6",
      d: 0
    },
    adProofsId: "469a74eb35c8bcf64fb69a43a2f10b0c0cb94f3a23ac432869b89b6b824c022b",
    transactionsId: "3877bc55627fe8925fb9e8b0c2b1af2158cb2a1169132f94482a9ddf67e8c571",
    parentId: "8a1b9a9246f8daf8aa214eeca019f1bdfcb119c991f6a8085ccb888bb864bb13"
  },
  {
    extensionId: "7d56f1c2aaac5e6931ccd88ea085055d764841ce45f986089ff753719c263e62",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593569409,
    size: 220,
    stateRoot: "ab6411037f046e07e84323d3f4f07479b94dc14957a66452ca24175fc632e6eb19",
    height: 1123076,
    nBits: 117957061,
    version: 3,
    id: "c751879767a644556cc4e55128e2e551ebc87667bf2e12c6ba8906d44bde07c1",
    adProofsRoot: "8ac6a429070eabc3bfe7e7e52781e70332dfee1b154bca5896ce445ded6cdf07",
    transactionsRoot: "bac0ce65130d96494484b46842176a95f41b110d39921cb265ec54faf40a2c72",
    extensionHash: "23a4e986f69938b34da494c73e99317992e1202311c50ccf297ffdb2558834fc",
    powSolutions: {
      pk: "030ab3e89183caae079bc07685e0ac5b3adc6d40a3e9112fe56e22c655bd41d4da",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "97200004bba3e569",
      d: 0
    },
    adProofsId: "2213d503bc8202910117c79e34d3c4f8754cdb98fbd6d50af9681f8eb54fc200",
    transactionsId: "4975042e97c16cee223d077639a743712570c7bdf8787737c27ad61648653327",
    parentId: "55bd9fada97a64d033d9a0a3e7830935a7d7c83e62778a49d3fe797b685e6bc6"
  },
  {
    extensionId: "ff49750c9485667b2e8742a01bc07f4d02b6fa871bb5a79b9c02d94ee891bf2a",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593605295,
    size: 220,
    stateRoot: "3a722fb7625b4cc7a8224b37b7fecbf059680832baaa7d4ff2ed8155f704bcc019",
    height: 1123077,
    nBits: 117957061,
    version: 3,
    id: "ef71a9acf0ce5a4ddec2daae7c04604e848955df8fe096d22c454d39d91c5855",
    adProofsRoot: "47253518ef6925e3ff7d8c806b468436e998818efbdfe82de967782e37c357b3",
    transactionsRoot: "2fe67ce57663c6f95264f9c78d9594b8c1b39080101313bd60b228baf0f9db6c",
    extensionHash: "ea415980f8230a2def43fc1b8a2540b1f78701c0d6d7bc9edc7636bac7668320",
    powSolutions: {
      pk: "0274e729bb6615cbda94d9d176a2f1525068f12b330e38bbbf387232797dfd891f",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "44b37b5b2dbd8cdc",
      d: 0
    },
    adProofsId: "e949bb50335a83b838564a05696b1459ae0336b9fecec198f9edb148aa1182d8",
    transactionsId: "1b875ede97e9f2d6793ee7b75a30d038fa71283584c3d4237383fd35c66e9eb8",
    parentId: "c751879767a644556cc4e55128e2e551ebc87667bf2e12c6ba8906d44bde07c1"
  },
  {
    extensionId: "3ec7fd3f6f61fa7fbdc1d5c57fcfaf7137dac9a9ce0578959b6489fb154d2163",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593608600,
    size: 220,
    stateRoot: "eef185afb6019a387007154d503bac526e675b6401b078fa1b0857ba617f772019",
    height: 1123078,
    nBits: 117957061,
    version: 3,
    id: "33f946332c4796e5677d11ecb70ed3195926743efc9bd396bec2efe06d018f36",
    adProofsRoot: "4a87775b9aedee7b4b86d87a3aeadffe6e6ba972383634314408cc5441e99ecc",
    transactionsRoot: "29e6f21e08df4fd681edc5503bd4c969b1376909f160bc2481a9648a0b4d37eb",
    extensionHash: "17da428990fdb8b9ca99e5035131b62784afc9261493aef01c8c6377a5eb4926",
    powSolutions: {
      pk: "033133187bde16d8b847923852ac7fe5bfbb50a81f1c040d00850e1f776c18e1b5",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "41bd0471be6f2efd",
      d: 0
    },
    adProofsId: "ea765613875add29cb839b66b43990fe7873816787a27f92f5ceefa0477c3b66",
    transactionsId: "506c24f6b212d5c69876c0a27e72649f94109e50426967d2a7c9a080f4ebe004",
    parentId: "ef71a9acf0ce5a4ddec2daae7c04604e848955df8fe096d22c454d39d91c5855"
  },
  {
    extensionId: "b19e3a3d8c8b77e945e4a9614c88fab4b249558238e1a961b49eaaff69a8d8fc",
    difficulty: "2218561061781504",
    votes: "000000",
    timestamp: 1698593807940,
    size: 220,
    stateRoot: "f7a7053a052108e6d70f3f1bb35ff294f6c12c2ddf1df005962e422e82b8b63a19",
    height: 1123079,
    nBits: 117957061,
    version: 3,
    id: "dd7676f8dfa4daa47820a412024ba0807f595b9d40428d76b34f77a18d1ea6f0",
    adProofsRoot: "eaf2ba6606c8e742c1b012c4b30da7cafa918ad40b52a8369e484779469702a5",
    transactionsRoot: "e047b207030caecd92fc3b301852583c8ba02a9cacd7c03f5be24592ec19add7",
    extensionHash: "f4828b0f5f404b9128304ba0daab2f3e4928bebfe2ab3052e43be1ff6856a89a",
    powSolutions: {
      pk: "033133187bde16d8b847923852ac7fe5bfbb50a81f1c040d00850e1f776c18e1b5",
      w: "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      n: "b4b004799a0078c1",
      d: 0
    },
    adProofsId: "dd5dfb18aad254e48b8dc299098c5b29ae954d4d1cf40c8ff2e13a72921a9076",
    transactionsId: "8d9fd8a9ceaf84bc3b0f6a273d046bd9a8e6cb31d5bd38b60d4b2781e5d8a28b",
    parentId: "33f946332c4796e5677d11ecb70ed3195926743efc9bd396bec2efe06d018f36"
  }
];

export const mockTransactionList = {
  items: [
    {
      id: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
      blockId: "7b9a62555fcf9517b6792c1105c288f3a365c86117075d17f05fd31ba8809765",
      inclusionHeight: 1063811,
      timestamp: 1691402306885,
      index: 10,
      globalIndex: 5631288,
      numConfirmations: 59268,
      inputs: [
        {
          globalIndex: 27201688,
          inclusionHeight: 955326,
          address:
            "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",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "0422a28af7ab4bbd01c95fcb10ecc81cdd2121c0b9e163b09811c5f0ea6a2eab",
          value: 2053120000,
          ergoTree:
            "108a010400040004000e20b10b0001e2a3d38d91b082f153e009e6f5ecf1b326474d11c4bac0c9a55daafb0402058092f40104020400010004060400040208cd0358ca7a890f5c237eca72e0d7f8290e808b089690504a0c47805cf489767ea53e0400050401000402040001000408040a040c04000402040004000e20b10b0000e4d4aeb3808ea19c6a17039095b8be8706f98867885add59d8dc7b8c05d00f0580897a0400050401000100050005d00f0580897a05000100010005000508040204020e20b10b000335049957b39273834f5f93aaf81bc1913c4d93401b34c78eca427243041005040502058084af5f010001000506050a04020500050001000500040404040404040604060500040204000e20b10b0004004ddb5b036ca1016471fc099f8d996cb023bdac59ea78072db46242040004d00f040204d00f0408040a040c04000402040204080402040a040c04000406040204020408040a0400040c040004000400040c04020400040201000100010005040406050405d00f0580897a04040404050405000100010001000502040804040402040404040100010001000506050005000400050401000508050a04040402040a05020508050a0502050a050005040100d828d601b2db6501fe730000d602e4c6a70608d603b2a5730100d604cbc27203d605e4c67201041ad606b27205730200d6077303d608e4c672010511d609b27208730400d60a9a73057209d60b959372047206d801d60bdb63087203eded92b1720b7306938cb2720b73070001720792c17203720a7308d60cb27205730900d60dc1a7d60eb27208730a00d60fdb63087203d610b2a5730b00d611c27210d612e4c6a70705d613d0730cd614e4c6a70905d615e4c6a7040ed61695720bededed93e4c6720309057214938cb2720f730d0002730e93e4c67203040e721593e4c6720306087202730fd617e4c6a70510d618c17203d619b1720fd61a937218720dd61be4c672030705d61ccb7211d61d9593721c7206d801d61ddb63087210eded92b1721d7310938cb2721d73110001720792c17210720a7312d61eb1a5d61fdb63087210d620b27217731300d621b27217731400d622b27217731500d623b27217731600d624b27217731700d625e4c672010711d626e4c6a70805d6278cb2720f73180002d62893e4c6720309057214ea02d1938cb2db6308720173190001731aeb02ea027202d1ecececec95ef720bd801d629a29d9c720d720e731b731c95937204720cd801d62ab2720f731d00edededed938c722a017207938c722a02731e92c172037229937211d0720292c172109999720d72297209731f732095ed720b9372127321d801d62999720dc17203959372117213ededed92c17210a29d9ca272297229720e73227323721693e4c672030510721793e4c67203070573247325732695ed720b937212732795eded937218720d721693e4c6720305107217d801d629e4c67203070595ed93722973289172197329d801d62ab2720f732a00ed938c722a01732b938c722a02b27208732c00ec937229732deded937229732e90e4c67203080599720d720a92e4c672030805732f7330733195eded720b94721273329472127333ededededed721a721693e4c6720305107217937219733493721b733593e4c6720308057336733795eded720bef721d93721273389591721e73399593721c720cededededededed721a721693b2e4c672030510733a00b27217733b0093b2e4c672030510733c00b27217733d0093721b733e93b1721f733f938cb2721f734000017341d802d629e4c672030510d62ab27229734200ececededededed90722a734390b27229734400734593b27229734600722093b27229734700722193b272297348007222928cb2721f734900027e999a722ab27229734a009a7223722405ededededed93722a722393b27229734b00722493b27229734c009a7220734d93b27229734e00722193b27229734f007222928cb2721f73500002b2e4c6720106119c73519a7220735200ededed93722a722393b27229735300722493b272297354007220d801d62bb27229735500ecededed91722b735694722b722193b272297357007358928cb2721f73590002b27225735a00eded93722b722193b27229735b009a7222735c928cb2721f735d0002b272259a7222735e00735f73607361d1ececec95ed720b93721273629591721e7363959372117213edededededededed92c17210a29d9c9c72267364720e7365736693c2b2a5736700d0720292c1b2a57368007226721a937227736993e4c67203040e721593e4c672030510721793721b736a7228736b736c736d95eded720b721d937212736e9592721e736f9593cbc2b2a5737000b2720573710093cbc2b2a4737200b2720573730073747375737695eded720b721d9372127377eced721693721b7378edededed93e4c67210040e721593e4c672100608720293e4c672100705737993e4c6721009057214938cb2721f737a0002737b737c95eded720bec937212737d937212737e93b1a4737fedededededed93cbc2b2a473800100b2720573810100722892722773820193e4c67203040e721593e4c672030510721793e4c6720306087202eceded93721273830193721b738401937227738501eded93721273860193721b738701937227738801738901",
          assets: [
            {
              tokenId: "b10b0001e2a3d38d91b082f153e009e6f5ecf1b326474d11c4bac0c9a55daafb",
              amount: 2
            }
          ],
          creationHeight: 955323,
          additionalRegisters: {
            R4: "0eb7015761746f3a3436653739353a6663633965313a343a343a4d3230382c313632513231342c3139392c3137342e352c3138392e35513133352c3138302c3132302e352c313639513130362c3135382c36322e352c3136315131392c3136342c32352e352c3132372e355133322c39312c36382e352c39302e35513130352c39302c3132322c36372e35513133392c34352c3136392c3534513139392c36332c3230302e352c3934513230322c3132352c3230382c3136325a",
            R5: "10074644bc06c203060606",
            R6: "08cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
            R7: "0500",
            R8: "0500",
            R9: "0506"
          },
          transactionId: "4057ab799ff12474f7ee0c20f6ec5a16a7545a6bcf1d2011720c05bc1fa492c5",
          index: 1
        },
        {
          globalIndex: 28776441,
          inclusionHeight: 995123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "4a9781a5b7b893047d568bd5205787b9bb9d1afdcf696b3dcd50328e317f3f8b",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995120,
          additionalRegisters: {},
          transactionId: "22c9dd41257cdffa3633619db0d8c758a9aa8bb053d7b8bac0a7bdb9d11fdde2",
          index: 19
        },
        {
          globalIndex: 28776532,
          inclusionHeight: 995123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "a21f201107cba872d662225eb2bceb154fb35a4511e4b839a9b63484e6a31ea6",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 995120,
          additionalRegisters: {},
          transactionId: "45cfd0d37bd6e4931ad8bbc4eb27758a2c2bb81bf94a6f12c29dc3288b1d2af5",
          index: 18
        },
        {
          globalIndex: 28788090,
          inclusionHeight: 995352,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "93c0665949bb1cf8d379e1655ea98e0f491b7134ca76def1bb98835ec1dd036c",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 995350,
          additionalRegisters: {},
          transactionId: "0344f3a167859d4ea808664450211c2b9af418f0a8ae3345303efcbc858c5116",
          index: 17
        },
        {
          globalIndex: 28788484,
          inclusionHeight: 995374,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "21ef9126f440e639825da73813c92fded5271dc055b930374f16f0e48f35441c",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995371,
          additionalRegisters: {},
          transactionId: "4e6fc35ecf2e341bcbdb6ef1bee2ffa4f732e908fefcb1cc16ae9a5e7440bc63",
          index: 17
        },
        {
          globalIndex: 28788555,
          inclusionHeight: 995374,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "af3255c8fbf5b4db28c69485a2c2d3c7b7b2b8331d175c682d7193f3e627d066",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995371,
          additionalRegisters: {},
          transactionId: "497f0f4cd53b9f5752a46f7c8a71a951ec25fb49a3042d4dcdbea1a556d625f9",
          index: 19
        },
        {
          globalIndex: 28788650,
          inclusionHeight: 995374,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "625e60c133d96e0066e14483566ee4ad5be4187a51a5d4fbc091c93dd76ad0c8",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 995371,
          additionalRegisters: {},
          transactionId: "f4d605e6d150079cc3fefa82d552fa879f9c7f0cd80206736d707862584bcde7",
          index: 18
        },
        {
          globalIndex: 28795803,
          inclusionHeight: 995603,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "e402138551f7b5e5e229d05c60b9a4139e09d65bb54304ae0c2b32f642ac4c41",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 995600,
          additionalRegisters: {},
          transactionId: "d27607e5a908b48fecc395a392acb92a8e8ab96d5bcbf542fdaea7d4c9faeb87",
          index: 17
        },
        {
          globalIndex: 28796216,
          inclusionHeight: 995623,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "5f22f7b87e25f8e08cb19f447f92870309fd951147ab6d00488c1cee7c990982",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995621,
          additionalRegisters: {},
          transactionId: "3b81b1a6ae3a718693d0cccbe211e6a6ec8c88103af300725c9d5e1359a2ffce",
          index: 17
        },
        {
          globalIndex: 28796287,
          inclusionHeight: 995623,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "de3e6b23d505b233534a67947a85665bd9ba99fc4e6f315b997ee8b9341302d6",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995621,
          additionalRegisters: {},
          transactionId: "82ea7c605ef156204b454e089a6dd11cb292b4b84113c6c74f05365b9f8a461d",
          index: 19
        },
        {
          globalIndex: 28796378,
          inclusionHeight: 995623,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "ac5a07480d4abd0824f05fe6b6a651f1abda9ef0eb5c1306c82dba38f4d582b5",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 995621,
          additionalRegisters: {},
          transactionId: "0246318409911bdc348a549647e0a13481f491411ef557c0e9ce8c6cdbdb61af",
          index: 18
        },
        {
          globalIndex: 28803211,
          inclusionHeight: 995853,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "2a2fb7e7cabfe113b7a40d8c930e2f1c7c7781f81de3b4f1f9915d48a3d5e24d",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 995850,
          additionalRegisters: {},
          transactionId: "0d4c618f132f8116d73b1453a40b8a14187e21908af462e39a8f03db4be16e6e",
          index: 17
        },
        {
          globalIndex: 28803911,
          inclusionHeight: 995872,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "2fd9814272c07b8888f355d0a6fc35c36eafc1240112f924a7622a5a84d37016",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995870,
          additionalRegisters: {},
          transactionId: "d72b55e663fe404fc4bf9731b74f82562c6e7809839554479281241bca6fc63b",
          index: 17
        },
        {
          globalIndex: 28803982,
          inclusionHeight: 995872,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "6d1680a3df8298b36799a096238470889955d6fb99d371cb61368024f6b313d2",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 995870,
          additionalRegisters: {},
          transactionId: "a2de5d55fe07e9c3c54dcb20f7a69a3cbf05599b8cd1b3b738fde4b16747e73d",
          index: 19
        },
        {
          globalIndex: 28804083,
          inclusionHeight: 995872,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "246bdb9df42f29f9baf4d3459e470558b38f505e8bc30478db8356e0a92f5c91",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 995870,
          additionalRegisters: {},
          transactionId: "8eece427a1a6c3d6cbd8be7ee2fc0ab37ce2e6767861ba23fac54b493f3ec18c",
          index: 18
        },
        {
          globalIndex: 28815564,
          inclusionHeight: 996115,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "35285d9d681146e7c54fbc2d3f3e799114865f1e57d569b4252da3c7d4186e77",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 996113,
          additionalRegisters: {},
          transactionId: "f498e36cb20c00b5b13cbb31651c8ae78fc71379fc0ab7b39aaace484ad380ea",
          index: 17
        },
        {
          globalIndex: 28816140,
          inclusionHeight: 996123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "544d477f14689da191171c732d30fbda9ef1caa4b0e94d37ab98be7631ac0870",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996120,
          additionalRegisters: {},
          transactionId: "0a6f8771132894f355ee1794bab820977691e424aa6c41724db237884be30f04",
          index: 19
        },
        {
          globalIndex: 28816161,
          inclusionHeight: 996123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "abde1838317fe50e96520ac758bb7de70381d673719614cacdcdcd267b7b934b",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996120,
          additionalRegisters: {},
          transactionId: "e2641da83bbb1cab20bd6382bc99c15367d41b1200013e04d7f32db3a71e6480",
          index: 17
        },
        {
          globalIndex: 28816258,
          inclusionHeight: 996123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "71d41daf00d5e11bac42a6abd909b7d85ce6fbf5a0bca7083dae020c38d78968",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 996120,
          additionalRegisters: {},
          transactionId: "4214448978f4a468537a8782510a061e0a6322ae4340919db9cfb0eacea9b001",
          index: 18
        },
        {
          globalIndex: 28822778,
          inclusionHeight: 996352,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "15f6406827e4628249276d5e24516765a2c6ad1776f2477384b912b4f465cc13",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 996350,
          additionalRegisters: {},
          transactionId: "ac05bc90c38577916b45268a414ab51586a379893d47b95c57127d4440f82a60",
          index: 17
        },
        {
          globalIndex: 28823215,
          inclusionHeight: 996372,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "917705f886bbb4237ae11948aec8ea3eb5fda06372ef58aa94f090381274914e",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996370,
          additionalRegisters: {},
          transactionId: "03d68852c15015c5f7ff1a98819f20d006c20862b534fa2e13e2f77ec4cd0e3e",
          index: 17
        },
        {
          globalIndex: 28823286,
          inclusionHeight: 996372,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "96fc60ac87c273c4eb5a7b851824915f3b504826b9f6141c2c3627c02ae2d632",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996370,
          additionalRegisters: {},
          transactionId: "35cc22c83631e2e24d29661d37edbd23da951b4e3e6d23f40062488feabda989",
          index: 19
        },
        {
          globalIndex: 28823380,
          inclusionHeight: 996372,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "fe68cf73bf724389ae450f696f7cbf2f0611774b25b0315b529520c9ede4e833",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 996370,
          additionalRegisters: {},
          transactionId: "3f3902b40e19fc48ad595d59c84ef96b3b4088c5d1bc5c9f5d3c7aba27f137c2",
          index: 18
        },
        {
          globalIndex: 28830537,
          inclusionHeight: 996602,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "ab1961892bce34394c39007e894559bbc2e5c30de3db303de8d362ece7054dcd",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 996600,
          additionalRegisters: {},
          transactionId: "925c400dff85f3767b68d0c23ef8fd1576e6775cae622e8dea91530ea9fa975d",
          index: 17
        },
        {
          globalIndex: 28831030,
          inclusionHeight: 996622,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "6edc36d4dc18aca6fad524dd213817e972cd321822ec1033a27e7fe6962630b1",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996620,
          additionalRegisters: {},
          transactionId: "79bd5cf8f054f43614d34229a5695e194660ec7c839c2511f054dbf40c965cca",
          index: 17
        },
        {
          globalIndex: 28831101,
          inclusionHeight: 996622,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "15bb5532a56d61339e00660ffa8135be046d1a0edd1c4d34189978f4380efc90",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996620,
          additionalRegisters: {},
          transactionId: "c5fe191618ab8c6231283bf0ed4d1658d119c8ef1f796155b12e7cce4ff9a1ab",
          index: 19
        },
        {
          globalIndex: 28831199,
          inclusionHeight: 996622,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "ccb57c9854806b52746938829a3d20b74bc2a148c1e52e4ffc8a25e3cb196494",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 996620,
          additionalRegisters: {},
          transactionId: "f2da0a5fd188f3e5f80220caee2e767f1c9057cbf820f8e2b060f813bd2b98a6",
          index: 18
        },
        {
          globalIndex: 28841709,
          inclusionHeight: 996854,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "ce48d2d1ff1340f2a57869716a592f588f956849c69fa95ac4bc8ea2f6515749",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 996852,
          additionalRegisters: {},
          transactionId: "fd4083babe1854a594f7c98a28d1e806a6d6c2312c4a58727d68552149485703",
          index: 17
        },
        {
          globalIndex: 28842443,
          inclusionHeight: 996874,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "da0563c57aa2c72829139e969ff897f77017a7c4a35d9d66b5239ba09bf60a51",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996871,
          additionalRegisters: {},
          transactionId: "a5ac086f85e0c787b1db85a6599966aab5d5f269207ca77fd9548f00fe2a49d3",
          index: 17
        },
        {
          globalIndex: 28842514,
          inclusionHeight: 996874,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "66e55ca4fe3af237925bb3a1f15bc66b5073cbb03d9c3ecbbe7ccab482a09678",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 996871,
          additionalRegisters: {},
          transactionId: "0c8085f26905341b6076edb33783b783263985ebb7eefb797b56c1e6c0d14f83",
          index: 19
        },
        {
          globalIndex: 28842674,
          inclusionHeight: 996877,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "e004038b6022bec8ece6920851b4bf6915a8c38b8ab98da35118dbec69a87ce0",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 996875,
          additionalRegisters: {},
          transactionId: "47f62047b9ecd4a823233e07e15a50e6a1da6b65cf4f4dae2cffe7431b88fcf3",
          index: 18
        },
        {
          globalIndex: 28849166,
          inclusionHeight: 997102,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "528a39327685f4c2de05a5b7cd4b6401717035447deeeb37291a3dabe8f9bea3",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 997100,
          additionalRegisters: {},
          transactionId: "3101322aa737d5f3fc92e463b4d94c932f4a4b7da6e4b245700c5352edcae14a",
          index: 17
        },
        {
          globalIndex: 28850010,
          inclusionHeight: 997123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "ea0d61d6ccc00422e7124cdc5a2d69da9b27fb407a03b7806830d011512de603",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 997120,
          additionalRegisters: {},
          transactionId: "512b4dec75ffa2a689d9c79266a90fa626f8fd51ea2838844913f6076e3baf16",
          index: 17
        },
        {
          globalIndex: 28850081,
          inclusionHeight: 997123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "43a483b5fc8d717daebb05bfbecbc2803eb3eff4b70375b413affaef79509c61",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 997120,
          additionalRegisters: {},
          transactionId: "1ef5be6069764126d3952afa68cd0f43126808c526c31cd6265ffbe83fd751c5",
          index: 19
        },
        {
          globalIndex: 28850172,
          inclusionHeight: 997123,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "0f5775d9ffef7f92a8bd3f493906f9bc991c5111f4ab09a1807b8168be8df8a3",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 997120,
          additionalRegisters: {},
          transactionId: "654f1a058e0a604b6f9a8e47622445eaeb6b5bac0531c22664fd95ade675d448",
          index: 18
        },
        {
          globalIndex: 28859795,
          inclusionHeight: 997352,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "b3582ba7b737bd67306cf3372760bc66f144c410bb570c44b3a47cc43cfa1f5f",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 424433
            }
          ],
          creationHeight: 997350,
          additionalRegisters: {},
          transactionId: "26e99b112803dcdd7647781d377e167422abb88430d99e3f25c1643ce43d6ea2",
          index: 17
        },
        {
          globalIndex: 28860584,
          inclusionHeight: 997372,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "d585b0aeaba96c5e976adeaa46e39aa83f81fb9c8273878f85ce7db6b3f69957",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 997370,
          additionalRegisters: {},
          transactionId: "19f466e2e2c9c4b4eff1aeb6a5f28653f9c731d188a4d0856a8ecb1276a0cfe6",
          index: 17
        },
        {
          globalIndex: 28860658,
          inclusionHeight: 997372,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "a834c82e7acd50d1086804810ebbd63840f99b4c378b71b776b6b93d165140c7",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 1573599
            }
          ],
          creationHeight: 997370,
          additionalRegisters: {},
          transactionId: "98d0caa804a43513cd9d893a7faa20f09899cbcafae27843acc669efea266719",
          index: 19
        },
        {
          globalIndex: 28860752,
          inclusionHeight: 997372,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "cd718b333e5a08d2366affafc3933f7afbaea37c3ab9a9be7fb64fbcdd7ae779",
          value: 250000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 4720819
            }
          ],
          creationHeight: 997370,
          additionalRegisters: {},
          transactionId: "b67de7eebbe18cefe5c57d5a2e86a5da9413b0fad7f34de7717e2906327478d7",
          index: 18
        },
        {
          globalIndex: 29008657,
          inclusionHeight: 1001228,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          boxId: "34b84a6e1d702d7d1ec54f51a666e6b6fd3d37a05e1364174dd683f5df9d6782",
          value: 43350000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [],
          creationHeight: 1001226,
          additionalRegisters: {},
          transactionId: "1657739d72c49d07bcab25501bc97d02b12a7488604675ea02f3866b28f91184",
          index: 2
        }
      ],
      dataInputs: [
        {
          boxId: "97208a959a4acd6865a999eb3f4aa7c2fa50f079e709d2e488c18b445b67e8b7"
        }
      ],
      outputs: [
        {
          globalIndex: 31585504,
          inclusionHeight: 1063811,
          address:
            "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",
          spentTransactionId: null,
          boxId: "3d222dd483c0759b12d16ae09722daa579eb43907390dc59ee3d2dff87af752c",
          value: 53120000,
          ergoTree:
            "108a010400040004000e20b10b0001e2a3d38d91b082f153e009e6f5ecf1b326474d11c4bac0c9a55daafb0402058092f40104020400010004060400040208cd0358ca7a890f5c237eca72e0d7f8290e808b089690504a0c47805cf489767ea53e0400050401000402040001000408040a040c04000402040004000e20b10b0000e4d4aeb3808ea19c6a17039095b8be8706f98867885add59d8dc7b8c05d00f0580897a0400050401000100050005d00f0580897a05000100010005000508040204020e20b10b000335049957b39273834f5f93aaf81bc1913c4d93401b34c78eca427243041005040502058084af5f010001000506050a04020500050001000500040404040404040604060500040204000e20b10b0004004ddb5b036ca1016471fc099f8d996cb023bdac59ea78072db46242040004d00f040204d00f0408040a040c04000402040204080402040a040c04000406040204020408040a0400040c040004000400040c04020400040201000100010005040406050405d00f0580897a04040404050405000100010001000502040804040402040404040100010001000506050005000400050401000508050a04040402040a05020508050a0502050a050005040100d828d601b2db6501fe730000d602e4c6a70608d603b2a5730100d604cbc27203d605e4c67201041ad606b27205730200d6077303d608e4c672010511d609b27208730400d60a9a73057209d60b959372047206d801d60bdb63087203eded92b1720b7306938cb2720b73070001720792c17203720a7308d60cb27205730900d60dc1a7d60eb27208730a00d60fdb63087203d610b2a5730b00d611c27210d612e4c6a70705d613d0730cd614e4c6a70905d615e4c6a7040ed61695720bededed93e4c6720309057214938cb2720f730d0002730e93e4c67203040e721593e4c6720306087202730fd617e4c6a70510d618c17203d619b1720fd61a937218720dd61be4c672030705d61ccb7211d61d9593721c7206d801d61ddb63087210eded92b1721d7310938cb2721d73110001720792c17210720a7312d61eb1a5d61fdb63087210d620b27217731300d621b27217731400d622b27217731500d623b27217731600d624b27217731700d625e4c672010711d626e4c6a70805d6278cb2720f73180002d62893e4c6720309057214ea02d1938cb2db6308720173190001731aeb02ea027202d1ecececec95ef720bd801d629a29d9c720d720e731b731c95937204720cd801d62ab2720f731d00edededed938c722a017207938c722a02731e92c172037229937211d0720292c172109999720d72297209731f732095ed720b9372127321d801d62999720dc17203959372117213ededed92c17210a29d9ca272297229720e73227323721693e4c672030510721793e4c67203070573247325732695ed720b937212732795eded937218720d721693e4c6720305107217d801d629e4c67203070595ed93722973289172197329d801d62ab2720f732a00ed938c722a01732b938c722a02b27208732c00ec937229732deded937229732e90e4c67203080599720d720a92e4c672030805732f7330733195eded720b94721273329472127333ededededed721a721693e4c6720305107217937219733493721b733593e4c6720308057336733795eded720bef721d93721273389591721e73399593721c720cededededededed721a721693b2e4c672030510733a00b27217733b0093b2e4c672030510733c00b27217733d0093721b733e93b1721f733f938cb2721f734000017341d802d629e4c672030510d62ab27229734200ececededededed90722a734390b27229734400734593b27229734600722093b27229734700722193b272297348007222928cb2721f734900027e999a722ab27229734a009a7223722405ededededed93722a722393b27229734b00722493b27229734c009a7220734d93b27229734e00722193b27229734f007222928cb2721f73500002b2e4c6720106119c73519a7220735200ededed93722a722393b27229735300722493b272297354007220d801d62bb27229735500ecededed91722b735694722b722193b272297357007358928cb2721f73590002b27225735a00eded93722b722193b27229735b009a7222735c928cb2721f735d0002b272259a7222735e00735f73607361d1ececec95ed720b93721273629591721e7363959372117213edededededededed92c17210a29d9c9c72267364720e7365736693c2b2a5736700d0720292c1b2a57368007226721a937227736993e4c67203040e721593e4c672030510721793721b736a7228736b736c736d95eded720b721d937212736e9592721e736f9593cbc2b2a5737000b2720573710093cbc2b2a4737200b2720573730073747375737695eded720b721d9372127377eced721693721b7378edededed93e4c67210040e721593e4c672100608720293e4c672100705737993e4c6721009057214938cb2721f737a0002737b737c95eded720bec937212737d937212737e93b1a4737fedededededed93cbc2b2a473800100b2720573810100722892722773820193e4c67203040e721593e4c672030510721793e4c6720306087202eceded93721273830193721b738401937227738501eded93721273860193721b738701937227738801738901",
          assets: [
            {
              tokenId: "b10b0001e2a3d38d91b082f153e009e6f5ecf1b326474d11c4bac0c9a55daafb",
              amount: 2
            }
          ],
          creationHeight: 1063808,
          additionalRegisters: {
            R4: "0eb7015761746f3a3436653739353a6663633965313a343a343a4d3230382c313632513231342c3139392c3137342e352c3138392e35513133352c3138302c3132302e352c313639513130362c3135382c36322e352c3136315131392c3136342c32352e352c3132372e355133322c39312c36382e352c39302e35513130352c39302c3132322c36372e35513133392c34352c3136392c3534513139392c36332c3230302e352c3934513230322c3132352c3230382c3136325a",
            R5: "10074644bc06c203060606",
            R6: "08cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
            R7: "0500",
            R8: "0500",
            R9: "0506"
          },
          transactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          index: 0
        },
        {
          globalIndex: 31585505,
          inclusionHeight: 1063811,
          address: "9h8ujgHBKcCgJRbBrCY9rgfqLtjZyvsSEh2E4u1pQXuX8zNRo3y",
          spentTransactionId: "7f6946785755d676820e2ebf124388478f10483b7ed94b6a082b3912d71be72d",
          boxId: "13d92bc71a4e4c076027d460fdbc7722d71092a5e97f3c40666daab347e633ad",
          value: 10000000,
          ergoTree: "0008cd0358ca7a890f5c237eca72e0d7f8290e808b089690504a0c47805cf489767ea53e",
          assets: [],
          creationHeight: 1063808,
          additionalRegisters: {},
          transactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          index: 1
        },
        {
          globalIndex: 31585506,
          inclusionHeight: 1063811,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: null,
          boxId: "fdaabdee0755f415ca8e12d9049a64a0d7a6261f207f8c4583f99363554bb1eb",
          value: 2000000000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [],
          creationHeight: 1063808,
          additionalRegisters: {},
          transactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          index: 2
        },
        {
          globalIndex: 31585507,
          inclusionHeight: 1063811,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: null,
          boxId: "ea4452a7d77377cc9267a0e546e5836a3da7f555bd6277af8b5b7259d5413d4f",
          value: 41750000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "50eab1afc495420c17c0df5154584cf09d9167263fffc99c25e3e0ae4b26fe00",
              amount: 80926468
            }
          ],
          creationHeight: 1063808,
          additionalRegisters: {},
          transactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          index: 3
        },
        {
          globalIndex: 31585508,
          inclusionHeight: 1063811,
          address:
            "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
          spentTransactionId: "3087e2ff8973925a42a5cd728253630b978dcc0f27968a662542611cd5ba6a63",
          boxId: "5154f152d316343f18e93b94ced26d17934594e6929b9d5d35a8858042fd1d03",
          value: 1100000,
          ergoTree:
            "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
          assets: [],
          creationHeight: 1063808,
          additionalRegisters: {},
          transactionId: "fa467416eca865a46b686059ad7c293afd08b1d429a393137ea99600d475ae9a",
          index: 4
        }
      ],
      size: 6142
    },
    {
      id: "200b57a11f6476dc802433be3eae363cc3961662a30458d08df100798ac7f393",
      blockId: "f043b5037bd8765e4a31f97eebecf9c3c1d5b75194671bd178d7081cb643a624",
      inclusionHeight: 1015246,
      timestamp: 1685491565452,
      index: 4,
      globalIndex: 5306668,
      numConfirmations: 107833,
      inputs: [
        {
          globalIndex: 28750815,
          inclusionHeight: 994423,
          address:
            "2PnwgiUqPKQyKUNfDShUyoZZA1DLwJyVE7oNri6JrKVWf4DYCiBqqoBYFfokffDVaV9VYahvpDiKBt9x6NVXBkBm4LgE5tM3wC8w2Qhbhh9Ps7scNLGXJZ3tLbZpu1E78ynnrn4MBouTuE7rqTaG6Su8PwkzhBFBaiQgZKqCtQMVDLrN1D6MzAj5MvbpscFEsLTqaWEemPQvxKfx7rW1HgcMSCccWAvzy4pThM7re7Mqxz9Su7ETX2RRmjGksPpHMJxVV5cGM8ijQwNsdakuMWDVLJ7qL1FEaBAbwEih6CdRZMnkYV6sNS3FFrepAa8G1nA21ztiadoQdT9wKx9gfQZJwPe2DJWoeTEp3s2TezdUiZEM67MFa5RiSEtQwkuYzin8nQ7EMWenqmSQkRfhf1QyfwEsWz7cGYHHndBp8Axg29qp1kEzcGBMUA4f8Qivi3JLPrzqKPZH7neTRYmcbYKxSTFkdzBvbKJSVoKcUaUb4QVvpcdNg4TywHELP4B2JRjhaDJFgKQvZT14owh1xuB62VoMGQhoRg8Xub4fJVJUXVSAVLcZ5qhmrc1X6Gwt5a5Nju1t4R6LFERuBYmfreofxpACfsq3oN83cSQCSiNbkRn4YVQzZqGnrHaDbsDgR2wEJbdYfXpfV6YMX525MfCj6t2TXjBzuhyYtBTnQyp7bRQeQ47kfm77gYU6esdCokZj4ic2jxyxnpm6AHxkM2oDLqrvQ8uXCM4oToNEsr8xJWFRmDsUvtu5zs9dm5HGoyXjfjojCXuE2ZMhgweU4v7N21mzGgKepzpJvWARzjtnFFK7wRpCyZvLcgq9Hf4gqdR82Pmiko5azFBYA3T1su3L1u93RxAZTSWEGJ54uoYnbBWr1mT3GDo8iXPjXQ8S5SCwJ5xzASCsvi1DAtS5jmMWp745TJPekGFE7jovG9eoqzYCgoTmjfuFHv6cuMK6TQpFRKqLGPyprmDEGSVZ2TUTzP7JoJZgQxRHrwoAwFRejgJzgVxdxH9LXCuvYvzy4GnNaTJ3eatzhwpHPQjsMdZjBsEbLujgqWV4je5d719sAb5Lqc3Dd6LRFNqR6SRw8cL3XXKiRnEmVBrTokA91CFnjroSgQ3erYBabNTpQF64Nd4BrLxKVt3UEppfXFghaQ8AjBnkjwjkrnCrwt83XtnehwjMGpJksiy9yYKoP281njgfe2S8y6JQziy9peQoSLuUXtLE9Ptz6MmKgn22NonRxMA7Rzqw8Wywsbs9Z7yrpKyzNJJ89Vwyd9aRWBuPLuNEwoLqv54bUsPoiqeyfSK8RaCpE1WhzoCK6Uncrx9pAbysJNZVesMCu5CydDKTJC3MY7ryLe4cL82PxzTjTTrvGPmdtKfro4jpR3nnPFg8FkJ3YktHKzzJjM91fs283hjVJBxuvugQTbd5SdfTro9fd3P3YPSQPzRhEHY63642x8qez4Q2HnhKeKuvhvTNiN6XpvzFMtu5DN268BYwP3V4qc2btLbEWtVG3QLVL363Q4UiBgscq5XV",
          spentTransactionId: "200b57a11f6476dc802433be3eae363cc3961662a30458d08df100798ac7f393",
          boxId: "c56cc7aabea25f9bdb29ca9909f50fd03f4bd5259c5cdae89be30ac0ceedf0e3",
          value: 2100000,
          ergoTree:
            "103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733b",
          assets: [
            {
              tokenId: "24a549e7746109f7c5778a306259b7dc5d1f428d1aa9d313255fba2c4bbe225d",
              amount: 1
            },
            {
              tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
              amount: 90000
            }
          ],
          creationHeight: 994421,
          additionalRegisters: {
            R4: "0e2a43616c6c5f415f434f4d45545f4552475f383030305f323032332d30352d33315f7065725f3130303030",
            R5: "0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            R6: "0e0130",
            R7: "63e0d4f404103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733bd7d13c010cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324ba08d06060e2a43616c6c5f415f434f4d45545f4552475f383030305f323032332d30352d33315f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070002a09c0180c0d5f18d62807d80ade204c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6e591bd6334cf5829a2056a182a4e3edae489a55e6ff6981f2e09a34af977fab600"
          },
          transactionId: "d45dcfddaeab62a6c91117288b68e35687017c636ed06a7b9329c1170ecfbd1f",
          index: 0
        }
      ],
      dataInputs: [],
      outputs: [
        {
          globalIndex: 29653064,
          inclusionHeight: 1015246,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: null,
          boxId: "86b47de74b42e6fa6cb61a8938190f882c42a16914dfd4a607021998780f9ccd",
          value: 1000000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
              amount: 90000
            }
          ],
          creationHeight: 1015244,
          additionalRegisters: {
            R4: "0e2a43616c6c5f415f434f4d45545f4552475f383030305f323032332d30352d33315f7065725f3130303030",
            R5: "0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            R6: "0e0130",
            R7: "63e0d4f404103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733bd7d13c010cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324ba08d06060e2a43616c6c5f415f434f4d45545f4552475f383030305f323032332d30352d33315f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070002a09c0180c0d5f18d62807d80ade204c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6e591bd6334cf5829a2056a182a4e3edae489a55e6ff6981f2e09a34af977fab600"
          },
          transactionId: "200b57a11f6476dc802433be3eae363cc3961662a30458d08df100798ac7f393",
          index: 0
        },
        {
          globalIndex: 29653065,
          inclusionHeight: 1015246,
          address:
            "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
          spentTransactionId: "3ca6e89c86e355f1c7f5b8bc1f3779a627d880a7835d9f3f05a899ea7892f082",
          boxId: "babc5048f6b69c536b42ca0e745248a3ef1831dbc1e5a880b8b54a606dc0fdbe",
          value: 1100000,
          ergoTree:
            "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
          assets: [],
          creationHeight: 1015244,
          additionalRegisters: {},
          transactionId: "200b57a11f6476dc802433be3eae363cc3961662a30458d08df100798ac7f393",
          index: 1
        }
      ],
      size: 1794
    },
    {
      id: "8f1769c7f73f66ba63231fb9924c8591a30b0b6f3c63a5488cde2cea9c64f567",
      blockId: "f043b5037bd8765e4a31f97eebecf9c3c1d5b75194671bd178d7081cb643a624",
      inclusionHeight: 1015246,
      timestamp: 1685491565452,
      index: 5,
      globalIndex: 5306669,
      numConfirmations: 107833,
      inputs: [
        {
          globalIndex: 28715087,
          inclusionHeight: 993498,
          address:
            "2PnwgiUqPKQyKUNfDShUyoZZA1DLwJyVE7oNri6JrKVWf4DYCiBqqoBYFfokffDVaV9VYahvpDiKBt9x6NVXBkBm4LgE5tM3wC8w2Qhbhh9Ps7scNLGXJZ3tLbZpu1E78ynnrn4MBouTuE7rqTaG6Su8PwkzhBFBaiQgZKqCtQMVDLrN1D6MzAj5MvbpscFEsLTqaWEemPQvxKfx7rW1HgcMSCccWAvzy4pThM7re7Mqxz9Su7ETX2RRmjGksPpHMJxVV5cGM8ijQwNsdakuMWDVLJ7qL1FEaBAbwEih6CdRZMnkYV6sNS3FFrepAa8G1nA21ztiadoQdT9wKx9gfQZJwPe2DJWoeTEp3s2TezdUiZEM67MFa5RiSEtQwkuYzin8nQ7EMWenqmSQkRfhf1QyfwEsWz7cGYHHndBp8Axg29qp1kEzcGBMUA4f8Qivi3JLPrzqKPZH7neTRYmcbYKxSTFkdzBvbKJSVoKcUaUb4QVvpcdNg4TywHELP4B2JRjhaDJFgKQvZT14owh1xuB62VoMGQhoRg8Xub4fJVJUXVSAVLcZ5qhmrc1X6Gwt5a5Nju1t4R6LFERuBYmfreofxpACfsq3oN83cSQCSiNbkRn4YVQzZqGnrHaDbsDgR2wEJbdYfXpfV6YMX525MfCj6t2TXjBzuhyYtBTnQyp7bRQeQ47kfm77gYU6esdCokZj4ic2jxyxnpm6AHxkM2oDLqrvQ8uXCM4oToNEsr8xJWFRmDsUvtu5zs9dm5HGoyXjfjojCXuE2ZMhgweU4v7N21mzGgKepzpJvWARzjtnFFK7wRpCyZvLcgq9Hf4gqdR82Pmiko5azFBYA3T1su3L1u93RxAZTSWEGJ54uoYnbBWr1mT3GDo8iXPjXQ8S5SCwJ5xzASCsvi1DAtS5jmMWp745TJPekGFE7jovG9eoqzYCgoTmjfuFHv6cuMK6TQpFRKqLGPyprmDEGSVZ2TUTzP7JoJZgQxRHrwoAwFRejgJzgVxdxH9LXCuvYvzy4GnNaTJ3eatzhwpHPQjsMdZjBsEbLujgqWV4je5d719sAb5Lqc3Dd6LRFNqR6SRw8cL3XXKiRnEmVBrTokA91CFnjroSgQ3erYBabNTpQF64Nd4BrLxKVt3UEppfXFghaQ8AjBnkjwjkrnCrwt83XtnehwjMGpJksiy9yYKoP281njgfe2S8y6JQziy9peQoSLuUXtLE9Ptz6MmKgn22NonRxMA7Rzqw8Wywsbs9Z7yrpKyzNJJ89Vwyd9aRWBuPLuNEwoLqv54bUsPoiqeyfSK8RaCpE1WhzoCK6Uncrx9pAbysJNZVesMCu5CydDKTJC3MY7ryLe4cL82PxzTjTTrvGPmdtKfro4jpR3nnPFg8FkJ3YktHKzzJjM91fs283hjVJBxuvugQTbd5SdfTro9fd3P3YPSQPzRhEHY63642x8qez4Q2HnhKeKuvhvTNiN6XpvzFMtu5DN268BYwP3V4qc2btLbEWtVG3QLVL363Q4UiBgscq5XV",
          spentTransactionId: "8f1769c7f73f66ba63231fb9924c8591a30b0b6f3c63a5488cde2cea9c64f567",
          boxId: "2400ac06d9f9742a25f8db073d5fb8877e0a0f6b958049da8d7618487b703605",
          value: 2100000,
          ergoTree:
            "103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733b",
          assets: [
            {
              tokenId: "88ca9442872ce8384ef667a6af100307133a216143d804147e422ab4fec46371",
              amount: 1
            },
            {
              tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
              amount: 100000
            }
          ],
          creationHeight: 993496,
          additionalRegisters: {
            R4: "0e2a43616c6c5f415f434f4d45545f4552475f393030305f323032332d30352d33315f7065725f3130303030",
            R5: "0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            R6: "0e0130",
            R7: "6380979305103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733bd7d13c010cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324ba08d06060e2a43616c6c5f415f434f4d45545f4552475f393030305f323032332d30352d33315f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070002a09c0180c0d5f18d62d08c01c0b19f05c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6650379a1bd56ba92c8bf9fb93cb681379e3e317e49ccedd773db7e81d594709900"
          },
          transactionId: "4a51e7e705251131a90cdcd784003925e7c251daf791a239f50c0209ea5c3297",
          index: 0
        }
      ],
      dataInputs: [],
      outputs: [
        {
          globalIndex: 29653066,
          inclusionHeight: 1015246,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: null,
          boxId: "567da6665163b099777c228ccede0113122656963765292ba19c55a69712de31",
          value: 1000000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
              amount: 100000
            }
          ],
          creationHeight: 1015244,
          additionalRegisters: {
            R4: "0e2a43616c6c5f415f434f4d45545f4552475f393030305f323032332d30352d33315f7065725f3130303030",
            R5: "0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            R6: "0e0130",
            R7: "6380979305103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733bd7d13c010cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324ba08d06060e2a43616c6c5f415f434f4d45545f4552475f393030305f323032332d30352d33315f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070002a09c0180c0d5f18d62d08c01c0b19f05c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6650379a1bd56ba92c8bf9fb93cb681379e3e317e49ccedd773db7e81d594709900"
          },
          transactionId: "8f1769c7f73f66ba63231fb9924c8591a30b0b6f3c63a5488cde2cea9c64f567",
          index: 0
        },
        {
          globalIndex: 29653067,
          inclusionHeight: 1015246,
          address:
            "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
          spentTransactionId: "3ca6e89c86e355f1c7f5b8bc1f3779a627d880a7835d9f3f05a899ea7892f082",
          boxId: "3958b54fe5c562129c926acfb10188dc871c83d3df77832047f757b47564d696",
          value: 1100000,
          ergoTree:
            "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
          assets: [],
          creationHeight: 1015244,
          additionalRegisters: {},
          transactionId: "8f1769c7f73f66ba63231fb9924c8591a30b0b6f3c63a5488cde2cea9c64f567",
          index: 1
        }
      ],
      size: 1795
    },
    {
      id: "a23888510042e533b239dfd37b4a004e945240b2a08a30498737e0cb9bbe5f2c",
      blockId: "ac31ba173b65b9e0c19ff4dd7402b80c6a293a162a32d9e01c28e3f03feab2f8",
      inclusionHeight: 1015132,
      timestamp: 1685476895726,
      index: 5,
      globalIndex: 5305749,
      numConfirmations: 107947,
      inputs: [
        {
          globalIndex: 28741253,
          inclusionHeight: 994191,
          address:
            "4tQGGLNJFJ2pSiGpQZZRxamsS2moL5vEZ2Y35pnqyjXNVdoRQgTNwcwZN2wKpHt1DAndD6pkBeuZbCEKC4khRKxFd9KEJvpEesmZUvQ2RMXTTeXXioMMonSbGHouMX5Ng6GixyNfyHWXrDUJEmbNqgcGsMxUKaab4fCgQt95GU1dgJ9XFVchpbJ62m3R9ZEEWrUPCBM5MmC57xV7uKhdJkJdw74QU6pAMeFxgru3CSTWznFm62zMx3GKeMQsVMLVuJrDkUe5jDQ8Ru5uwafpAmWPbXWv7XFV6Yx1pFJUg3q1Y5Cxi4TvYU5z6yhupeXQZgccL253TQKbFupXLzqSJ8J85QNAM3hFCg4xvVTMsdM5ovVsvSXLNXvM2VX12BR5otuJwfJVBAfYdYwPSecEbeGjoCecPS1SCw4S5rErEE8RcTEG9zn8Gpt1aKyT8qhwvvapksxcfGG5d9wCg8k3La87LW1DT5djS6nMZ9XH5zMUPuxHnMsoEj2UhQYBHyX3nuX3u8qmFb2JVgTUZqbYfu1SGHe6FTsQcTgm9e6zt8KFxzrMAk1QSHhC4FD6jS65cyWhwLVPyF2miB8KeoGLCoUdc26vhen7uDiwyz8gZZMaWcSKrVWsS45xK6vi1BNA5LrLYRE6YM8X69jXkcLdZHUgkph1Z9gjr3tCzYXXrPvUsHBLZhkaUTXzNkcnPj4LFTHLS2NGnxUcnvRDjk5eZ6mj7dDtux3HWqzf8bmdd25e4qALwRXDdmoPRw6L6MMvojHAJndjW4LEPmk3Stkffo1EHAvrDBPcmuhkzJ6tq4Lc355AykviKo7daJgN7aAwBW5r7p21RcHwuth6po9eUsp8nwJhrBDHv9CenPAtpjUTE2twL8YavVFbcDigGqQMcCa4puKsGyCmF2bfbgzSWw7R4gh2i4eb9NmaJXqSceYiqv39HDbVuaQhzhitfXXG9E15sCf7MK95F7zfmepD1uLzUbErGZGWDtDbNnVNA3QR66QkwivhHXQh6Ce1ERp3xAa7V5hNa4HnKZJLgGqNC6fCvLphUp7ZaKX883bSyTUn6VSAL414ss6oxejQT1C2CFrYceSecF8RhLSDBUeqiusYuwPgNrNyn7jyRxs2KuoiJQZpftnvF6rpg5fs5MyzkhG7hG6RwvfMG2D6BxDobHYumQq8ZHGZ9RYeiKZQuScAYsNF7JmondyYXSW97ciyCSGLskSdGxHq6auJzc5SE8bq8tjJUPpgKhqfbew8Ry93oWgSkzUnDjS2Na2UG6mf1RqZcVphH6LWrpvdtJEQXxYcoN8w4ogTMhm8iM5WEXDL4H49iBKpHkqcntyKx7sEGt8xqif4bbgBkpPvFDAz4z6aqTASnjgKdmmBQfbj1cAJTPNtZbnyQBghjohqEyHgnZ3NA5qm1Ax289QHtsiTLvB7c4HhdqRQ5reV3APRxg3Tq9fENvZB9UAeHoc68QkuPqEnFCtK29i94zAVrJiMu6zX1p9NprPf5a1Q3MYspfMicf4zJfeJtZj3Qo4jbnVUkjrtDwuY8Mjaaari32ipiqXFeATYvt7w9J3hky98aK7VZh4v7EdAmMzckYyjxZMhejr3gTj8H1g9nx22R3AzZaAXkZLdvSXArKKhB",
          spentTransactionId: "a23888510042e533b239dfd37b4a004e945240b2a08a30498737e0cb9bbe5f2c",
          boxId: "3a59283eeb0fcff53a5e8ffcb97aa55fe820cb7dbd97884ee436424dd52fe085",
          value: 2100000,
          ergoTree:
            "104f040604060400040c050004000400040204000408040404000500060203e806010106030f42400404040004000404050205000500050005c80105e80705d00f05a01f05c03e05d08c010590cb0105c0b80205e0d4030580f10405a08d0605e0c50805e0b60d05c08b1105a0e01405a0d11905a0c21e05c0cf2405c0843d0580897a0580dac409050205000502040005000402060101060100050804000480acc99dfdffffffff010601000402060302b5b00402050004040480deada90105a09c0104000e201f01dc8e29806d96ca0b79f8e798cd8cfce51c0e676aaedf6ab3464b37da9dfd0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0580897a05000100040404040406040604080100050004040100d81ad601e4c6a70408d602db6903db6503fed603e4c6a70563d604e4c672030811d605b27204730000d606e4c6a70611d607997205b27206730100d608b2a5730200d609c27208d60ab27204730300d60bc57203d60c86028300027304d60db2db6308a7730501720cd60eb2db63087208730601720cd60f8c720e02d610e4c6a7070ed611c1a7d612b2db6308b2a5730700730801720cd6138c720d02d614d07201d615b27204730900d616b27204730a00d61793b27204730b00730cd618730dd619730ed61a730feb027201d1ec95eded907202720793b1a4731091b1db6501fe7311d80fd61bb2db6501fe731200d61cdb6308721bd61db2721c731300d61e997213720fd61f9dc1721b9d8c721d027314d620957217a273159c99721f72157216a273169c997215721f7216d621831605731773187319731a731b731c731d731e731f7320732173227323732473257326732773287329732a732b732cd622dc0c1dad7221d90122059c72227222017221d623d9012305d802d625dc0c1aad7222d901255995928c7225017223732d732e02732f7330d626b2722272250095917e7225057331d803d627b27222997225733200d6288c722702d6298c722701a273339a7e7228069d9c7e998c7226027228067e9972237229067e998c7226017229067334d624da7223019972057202d6259d9c9c9c7e9c7335b27206733600067e7216067e72150672247e733706d626a273389972259d9c9c9c72257eb2720673390006da722301a299721f7215997215721f733a9c9c7218da7223017215a272197224d6279593b27204733b00733c9a7e72200672269a7e7220069a72269d9c9c72267eb27206733d000672247e733e06d628a2721a9972279e72277e733f06d6299d9c7e721e06957217a17e9c721f7216067228a17e9c721572160672287219ededededededededed938cb2721c734000017341938c721d01734295937209c2a7edededededed93720b8c720d0192c172089a720a7343ec938c720e01720b93720f734493e4c672080408720193e4c672080563720393e4c672080611720693e4c67208070e7210734593c172087211938c721201720b938c721202721e93c2b2a57346007214927ec1b2a573470006a2721a722993c2b2a57348007210927ec1b2a573490006a2721a9d9c72297eb27206734a00067218734b95ec9172027207937213734cededed937209721492c17208997211720a93720e720d93b1a5734d734e",
          assets: [
            {
              tokenId: "24a549e7746109f7c5778a306259b7dc5d1f428d1aa9d313255fba2c4bbe225d",
              amount: 9
            }
          ],
          creationHeight: 994188,
          additionalRegisters: {
            R4: "08cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
            R5: "63e0d4f404103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733bd7d13c010cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324ba08d06060e2a43616c6c5f415f434f4d45545f4552475f383030305f323032332d30352d33315f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070002a09c0180c0d5f18d62807d80ade204c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6e591bd6334cf5829a2056a182a4e3edae489a55e6ff6981f2e09a34af977fab600",
            R6: "1105880ed804d80480e8dd0d0a",
            R7: "0e240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6"
          },
          transactionId: "142934136e28914f583b442c872d70aee05193ce25c458706eb6d3997bd8043f",
          index: 0
        }
      ],
      dataInputs: [],
      outputs: [
        {
          globalIndex: 29649527,
          inclusionHeight: 1015132,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: null,
          boxId: "b453d4c5b1f6d4c3b3425b1ce9bad143aff63e54588c07f58fa0925540cecb1f",
          value: 1000000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [
            {
              tokenId: "24a549e7746109f7c5778a306259b7dc5d1f428d1aa9d313255fba2c4bbe225d",
              amount: 9
            }
          ],
          creationHeight: 1015130,
          additionalRegisters: {
            R4: "08cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
            R5: "63e0d4f404103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733bd7d13c010cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324ba08d06060e2a43616c6c5f415f434f4d45545f4552475f383030305f323032332d30352d33315f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070002a09c0180c0d5f18d62807d80ade204c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6e591bd6334cf5829a2056a182a4e3edae489a55e6ff6981f2e09a34af977fab600",
            R6: "1105880ed804d80480e8dd0d0a",
            R7: "0e240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a6"
          },
          transactionId: "a23888510042e533b239dfd37b4a004e945240b2a08a30498737e0cb9bbe5f2c",
          index: 0
        },
        {
          globalIndex: 29649528,
          inclusionHeight: 1015132,
          address:
            "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
          spentTransactionId: "d985d09dd6f616b0e42115c58cfa2de2c5d207501550fa2b8df16d10f540f3df",
          boxId: "bf1a459c4890166f738b9b770f4a126fbd7680b2e09b95e43ff4f0a95e7a689a",
          value: 1100000,
          ergoTree:
            "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
          assets: [],
          creationHeight: 1015130,
          additionalRegisters: {},
          transactionId: "a23888510042e533b239dfd37b4a004e945240b2a08a30498737e0cb9bbe5f2c",
          index: 1
        }
      ],
      size: 1797
    },
    {
      id: "d4c6eea106b9ea6988add5206da805cfddbe092cf7656e24f10f0ec302affaf4",
      blockId: "ad5f659045607be542362c2dd45f0449e4d35bc1c92cc6d83a8f515defae664a",
      inclusionHeight: 1014525,
      timestamp: 1685405111441,
      index: 49,
      globalIndex: 5300582,
      numConfirmations: 108554,
      inputs: [
        {
          globalIndex: 28715263,
          inclusionHeight: 993508,
          address:
            "2PnwgiUqPKQyKUNfDShUyoZZA1DLwJyVE7oNri6JrKVWf4DYCiBqqoBYFfokffDVaV9VYahvpDiKBt9x6NVXBkBm4LgE5tM3wC8w2Qhbhh9Ps7scNLGXJZ3tLbZpu1E78ynnrn4MBouTuE7rqTaG6Su8PwkzhBFBaiQgZKqCtQMVDLrN1D6MzAj5MvbpscFEsLTqaWEemPQvxKfx7rW1HgcMSCccWAvzy4pThM7re7Mqxz9Su7ETX2RRmjGksPpHMJxVV5cGM8ijQwNsdakuMWDVLJ7qL1FEaBAbwEih6CdRZMnkYV6sNS3FFrepAa8G1nA21ztiadoQdT9wKx9gfQZJwPe2DJWoeTEp3s2TezdUiZEM67MFa5RiSEtQwkuYzin8nQ7EMWenqmSQkRfhf1QyfwEsWz7cGYHHndBp8Axg29qp1kEzcGBMUA4f8Qivi3JLPrzqKPZH7neTRYmcbYKxSTFkdzBvbKJSVoKcUaUb4QVvpcdNg4TywHELP4B2JRjhaDJFgKQvZT14owh1xuB62VoMGQhoRg8Xub4fJVJUXVSAVLcZ5qhmrc1X6Gwt5a5Nju1t4R6LFERuBYmfreofxpACfsq3oN83cSQCSiNbkRn4YVQzZqGnrHaDbsDgR2wEJbdYfXpfV6YMX525MfCj6t2TXjBzuhyYtBTnQyp7bRQeQ47kfm77gYU6esdCokZj4ic2jxyxnpm6AHxkM2oDLqrvQ8uXCM4oToNEsr8xJWFRmDsUvtu5zs9dm5HGoyXjfjojCXuE2ZMhgweU4v7N21mzGgKepzpJvWARzjtnFFK7wRpCyZvLcgq9Hf4gqdR82Pmiko5azFBYA3T1su3L1u93RxAZTSWEGJ54uoYnbBWr1mT3GDo8iXPjXQ8S5SCwJ5xzASCsvi1DAtS5jmMWp745TJPekGFE7jovG9eoqzYCgoTmjfuFHv6cuMK6TQpFRKqLGPyprmDEGSVZ2TUTzP7JoJZgQxRHrwoAwFRejgJzgVxdxH9LXCuvYvzy4GnNaTJ3eatzhwpHPQjsMdZjBsEbLujgqWV4je5d719sAb5Lqc3Dd6LRFNqR6SRw8cL3XXKiRnEmVBrTokA91CFnjroSgQ3erYBabNTpQF64Nd4BrLxKVt3UEppfXFghaQ8AjBnkjwjkrnCrwt83XtnehwjMGpJksiy9yYKoP281njgfe2S8y6JQziy9peQoSLuUXtLE9Ptz6MmKgn22NonRxMA7Rzqw8Wywsbs9Z7yrpKyzNJJ89Vwyd9aRWBuPLuNEwoLqv54bUsPoiqeyfSK8RaCpE1WhzoCK6Uncrx9pAbysJNZVesMCu5CydDKTJC3MY7ryLe4cL82PxzTjTTrvGPmdtKfro4jpR3nnPFg8FkJ3YktHKzzJjM91fs283hjVJBxuvugQTbd5SdfTro9fd3P3YPSQPzRhEHY63642x8qez4Q2HnhKeKuvhvTNiN6XpvzFMtu5DN268BYwP3V4qc2btLbEWtVG3QLVL363Q4UiBgscq5XV",
          spentTransactionId: "d4c6eea106b9ea6988add5206da805cfddbe092cf7656e24f10f0ec302affaf4",
          boxId: "0fdcd8c92e0cb1cd476bbaa45f38e6a27c990c0e702d991dd154e8fa97307cd4",
          value: 802100000,
          ergoTree:
            "103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733b",
          assets: [
            {
              tokenId: "574299d82b17b60de2bada4b5a1b37ac55e7bfe37a8267a2fd0bf72b1127586e",
              amount: 1
            }
          ],
          creationHeight: 993506,
          additionalRegisters: {
            R4: "0e295075745f415f434f4d45545f4552475f383030305f323032332d30352d33305f7065725f3130303030",
            R5: "0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            R6: "0e0130",
            R7: "63e0e4b08203103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733be1d13c00060e295075745f415f434f4d45545f4552475f383030305f323032332d30352d33305f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070202a09c0180d0a29f8d62807d80ade204c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a695620dbe00c190ed3e15a804c662e06a4c80f3fda0cbe274dc9c798b8dadfca600"
          },
          transactionId: "b0eba00de6c12dec7942e6d1a8daaba488f953b15e0d9d5bb42d5fd881ef373c",
          index: 0
        }
      ],
      dataInputs: [],
      outputs: [
        {
          globalIndex: 29621220,
          inclusionHeight: 1014525,
          address: "9g16ZMPo22b3qaRL7HezyQt2HSW2ZBF6YR3WW9cYQjgQwYKxxoT",
          spentTransactionId: "75ca1dbd6d6db1e07dafe0dd2bd61abcd7588114328c71a5643953ea4fe0369b",
          boxId: "3f54b6d09199cc61216851d738612ec51a8c4870a2563ff582913c799c19ccd7",
          value: 801000000,
          ergoTree: "0008cd02c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3",
          assets: [],
          creationHeight: 1014523,
          additionalRegisters: {
            R4: "0e295075745f415f434f4d45545f4552475f383030305f323032332d30352d33305f7065725f3130303030",
            R5: "0e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
            R6: "0e0130",
            R7: "63e0e4b08203103c05000400040004040400040c040a0580897a0100040004020400050004040408040204060502040205000580f0b252040204000402040605040502040404020506058092f4010502040204000100040404080402040004040400050005000402040004000402040604000100040204060580897a05020580897a04020502010005000100d82ed601db6308a7d60286028300027300d603b272017301017202d6048c720301d605e4c6a70763d606ed937204c5720593c2a7c27205d6079572067205a7d608e4c67207091ad609cdeeb27208730200d60aef7206d60bb1a5d60c93720b7303d60db2a5730400d60ec2720dd60fd07209d610c1a7d611e4c672070811d612b27211730500d613b27211730600d614c1720dd6159a72127307d616e4c67207050ed6179593720ec2a7edededed927214721593e4c6720d040ee4c67207040e93e4c6720d050e721693e4c6720d060ee4c67207060e93e4c6720d076372077308d618db6308720dd619b272187309017202d61a8c721901d61bb27218730a017202d61c8c721b01d61d93b27211730b00730cd61e8c720302d61fb27211730d00d6208c721902d621b27211730e00d622b2a5730f00d623db63087222d624db6903db6503fed625b27211731000d6269172247225d627ed720693721e7311d6289593b272117312007313eded722772268f72249a72257314ed72279072247225d629b272017315017202d62a8c722902d62b8c721b02d62cb272237316017202d62d8c722c01d62e8c722c02eb02ea027209d1eded720a720c93720e720fd1ececec95eded720a93b1a4731793720b7318ededededededed721793721499997210721272139272149c7319721593721ac5a7ecedededed721d93721c721693721b72039372209a9d721e721f731a93b17218731bededef721d93b17218731c9372209a9d99999972109c731d72127213731e9c7221721f731f93c27222b2720873200093b17223732192c172227213732295eded722893b1a4732393720b7324d806d62f95721d99722a722b9972107214d63095721d9d722f721f9d722f9c7221721fd631b2db6308b2a47325007326017202d632b2a5732700d633db63087232d634b272337328017202edededed93723095938c723101c572078c72310273297217ecededededededed721d9372037219ec93721c721693722b732a93722d721693722e722f93b17223732b92c172329c9c72307221721f93b17233732cedededededef721d92c17222722f93b17223732d938c7234017216928c7234029c7230721f93b17233732e93c27232720f93b1db6308b2a5732f007330733195ededed7206ef722793b1a4733293720b7333ededededededededed9372149999721072127334721793721a7204937220733593721b722993c27222720f93c17222733693b17223733793722d720493722e99721e7338733995eced7226ef722895721ded722793722a733aed72279372107215edededed720c93720e720f927214997210721293721a8c722901937220722a733be1d13c00060e295075745f415f434f4d45545f4552475f383030305f323032332d30352d33305f7065725f31303030300e200cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b0e013063a0968001100205000502d19373007301e28f3800040e01200e01200e012063c0843d10010100d17300ce8f380000c29e8341fbb9884bc3c58559b49c529f5f9b2ff038b97f9e76976c92ba917b0f01bd0beef5b5e1eb164d6999d5d038f793954ebe93f82ea3bd0fa1b8c65edc41b10011070202a09c0180d0a29f8d62807d80ade204c0a386011a022102c35a808c1c713fc1ae169e33da7492eee8f913a2045a7d56a3ca3103b5525ff3240008cd039ed9a6df20fca487da2d3b58e822cdcc5bcfad4cca794eadf132afa3113f31a695620dbe00c190ed3e15a804c662e06a4c80f3fda0cbe274dc9c798b8dadfca600"
          },
          transactionId: "d4c6eea106b9ea6988add5206da805cfddbe092cf7656e24f10f0ec302affaf4",
          index: 0
        },
        {
          globalIndex: 29621221,
          inclusionHeight: 1014525,
          address:
            "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe",
          spentTransactionId: "d0a00609380c28430faa13a307d737593ac62595af9f80054ea4a3441f78eef3",
          boxId: "5eef83ce5d690ab80e424cbed97228b6709cb023e7cc056dd084f1838c5abdbb",
          value: 1100000,
          ergoTree:
            "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
          assets: [],
          creationHeight: 1014523,
          additionalRegisters: {},
          transactionId: "d4c6eea106b9ea6988add5206da805cfddbe092cf7656e24f10f0ec302affaf4",
          index: 1
        }
      ],
      size: 1724
    }
  ],
  total: 3737
};

export const mockTokenInfo = {
  boxId: "00ef11830d923c432b5a85ee78a151c717d65ef8a280d1e2e8afb32a7ca32ac1",
  decimals: 0,
  description: "A token to support and memorialize nanoergs.",
  emissionAmount: 1000000000,
  id: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40",
  name: "kushti"
};

export const mockNodeInfo = {
  currentTime: 1698595733794,
  network: "mainnet",
  name: "ergo-mainnet-5.0.15",
  stateType: "utxo",
  difficulty: 2218561061781504,
  bestFullHeaderId: "5009ea3e85ff82e0013785f4adda6f39683ab660260011db5cffc575aa2a16a8",
  bestHeaderId: "5009ea3e85ff82e0013785f4adda6f39683ab660260011db5cffc575aa2a16a8",
  peersCount: 151,
  unconfirmedCount: 5,
  appVersion: "5.0.14-90-2ddc123a-SNAPSHOT",
  eip37Supported: true,
  stateRoot: "8250c6b0fe82d71a16250da1ed59c6ebf4937b0c67c265bf0767d450cac3f38d19",
  genesisBlockId: "b0244dfc267baca974a4caee06120321562784303a8a688976ae56170e4d175b",
  restApiUrl: "http://213.239.193.208:9053",
  previousFullHeaderId: "604050c086a6b1e63045a1f9e43fa8958af116bca6e72bfe317dfc0582586155",
  fullHeight: 1123102,
  headersHeight: 1123102,
  stateVersion: "5009ea3e85ff82e0013785f4adda6f39683ab660260011db5cffc575aa2a16a8",
  fullBlocksScore: 2.0659694928599125e21,
  maxPeerHeight: 1123102,
  launchTime: 1698574947404,
  isExplorer: true,
  lastSeenMessageTime: 1698595722441,
  eip27Supported: true,
  headersScore: 2.0659694928599125e21,
  parameters: {
    outputCost: 184,
    tokenAccessCost: 100,
    maxBlockCost: 8001091,
    height: 1122304,
    maxBlockSize: 1271009,
    dataInputCost: 100,
    blockVersion: 3,
    inputCost: 2407,
    storageFeeFactor: 1250000,
    minValuePerByte: 360
  },
  isMining: true
};

export const mockUTXOByAddress = [
  {
    globalIndex: 33856270,
    inclusionHeight: 1123113,
    address: "9hqSEweyxQaYpuA2rHBdvTeZgqMrfKQvH6q1R5CbkwZhnSTB1WE",
    spentTransactionId: null,
    boxId: "749462f271c20890602337929a1969da8421a6097670606414ee99b8ec6cda6a",
    value: 100000000,
    ergoTree: "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0",
    assets: [
      {
        tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
        amount: 100
      }
    ],
    creationHeight: 1123111,
    additionalRegisters: {},
    transactionId: "cf41dcdb26937b28f12664df9680f0895153fb73d3fce3f7e89b7151987b9e76",
    index: 0
  },
  {
    globalIndex: 33781831,
    inclusionHeight: 1121341,
    address: "9hqSEweyxQaYpuA2rHBdvTeZgqMrfKQvH6q1R5CbkwZhnSTB1WE",
    spentTransactionId: null,
    boxId: "183597427e2d0233b740a00294128e311376bf882b3d88345e804d89c85e14c5",
    value: 10000000,
    ergoTree: "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0",
    assets: [
      {
        tokenId: "fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40",
        amount: 10
      }
    ],
    creationHeight: 1121339,
    additionalRegisters: {},
    transactionId: "22423de13fd4575090d3219c7d5e08cb8f63209e9b7f557db228ef7359f77753",
    index: 0
  },
  {
    globalIndex: 33118687,
    inclusionHeight: 1103126,
    address: "9hqSEweyxQaYpuA2rHBdvTeZgqMrfKQvH6q1R5CbkwZhnSTB1WE",
    spentTransactionId: null,
    boxId: "2e447245b6aaab62640dc244df4d938d2b58716490f8a192764869252a03afce",
    value: 150000000,
    ergoTree: "0008cd03b4cf5eb18d1f45f73472bc96578a87f6d967015c59c636c7a0b139348ce826b0",
    assets: [
      {
        tokenId: "b10b0356aae5fbf56ec4c29c52e4c73e2699d3432768f0f9eb39fd79ea7f7d10",
        amount: 1
      },
      {
        tokenId: "801d371889cfbcf7517468eaad2193cdf933e68d702e245670e1f9d7405e4092",
        amount: "9223372036854775806"
      }
    ],
    creationHeight: 1103123,
    additionalRegisters: {},
    transactionId: "9db49da29ac8ee6e7cd86aa1fd6d7994927cbc6d23a34032f2a7855837df3fb6",
    index: 0
  }
];

export const mockPostTxSuccess = "18b11ee7adbb1e2b837052d7f28df3c50ffb257c31447b051eac21b74780d842";

export const mockNodeError = {
  error: 400,
  reason: "bad.request",
  detail: "Sample node error"
};
