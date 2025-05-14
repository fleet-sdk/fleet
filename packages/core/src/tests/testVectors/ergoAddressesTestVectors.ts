import { Network } from "@fleet-sdk/common";
import { FEE_CONTRACT } from "../../builder";

export const FEE_MAINNET_ADDRESS_TV =
  "2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe";
export const FEE_TESTNET_ADDRESS_TV =
  "Bf1X9JgQTUtgntaer91B24n6kP8L2kqEiQqNf1z97BKo9UbnW3WRP9VXu8BXd1LsYCiYbHJEdWKxkF5YNx5n7m31wsDjbEuB3B13ZMDVBWkepGmWfGa71otpFViHDCuvbw1uNicAQnfuWfnj8fbCa4";

export const p2shTestVectors = [
  {
    encoded: "8sZ2fVu5VUQKEmWt4xRRDBYzuw5aevhhziPBDGB",
    ergoTree:
      "00ea02d193b4cbe4e3010e040004300e18fd53c43ebbc8b5c53f2ccf270d1bc22740eb3855463f5faed40801"
  },
  {
    encoded: "7g5LhysK7mxX8xmZdPLtFE42wwxGFjpp8VofStb",
    ergoTree:
      "00ea02d193b4cbe4e3010e040004300e1888dc65bcf63bb55e6c2bfe03b1f2b14eef7d4fe0fa32d8e8d40801"
  },
  {
    encoded: "8UApt8czfFVuTgQmMwtsRBZ4nfWquNiSwCWUjMg",
    ergoTree:
      "00ea02d193b4cbe4e3010e040004300e18d62151f990f191c102a6fe995b89ed3d0f343a96f13789a3d40801"
  }
];

export const publicKeyTestVectors = [
  {
    publicKey: "038d39af8c37583609ff51c6a577efe60684119da2fbd0d75f9c72372886a58a63",
    base58: "9hY16vzHmmfyVBwKeFGHvb2bMFsG94A1u7To1QWtUokACyFVENQ"
  },
  {
    publicKey: "02200a1c1b8fa17ec82de54bcaef96f23d7b34196c0410f6f578abdbf163b14b25",
    base58: "9emAvMvreC9QEGHLV9pupwmteHuJt62qvkH6HnPjUESgQRotfaC"
  },
  {
    publicKey: "02f4e68cc26759e7b6dc63505c3427b2d565ab839e7f80306b2ce9d1c7def94cfa",
    base58: "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"
  },
  {
    publicKey: "02fd223c95ba74d48d04a8ecb5e86eda30df4e22f46aacc299f59230a9f8e93366",
    base58: "9gSYUbWtusShcjVPQR4NbPcavCTcce2z38iZgxwZaxWmMt7zLDE"
  },
  {
    publicKey: "025fb675cfd8a58210d6b7dbb56d02c3b5fd37431fa50f600e21d0977e4c32f6c4",
    base58: "9fFDNKVyC6LLyRGZY8pJh964oKz7RPFMhTmRgVjSvNm96iDSBcg"
  },
  {
    publicKey: "03ce25569fa8f219c6411159f22820940553e53b1e3993f2d18ceda4e36f51a2e9",
    base58: "9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8"
  },
  {
    publicKey: "0371ae73c460c888d224bf268622f80563032b5f5a6c746f73d9f58543e8afe728",
    base58: "9hKsXnZXXZqzoxBwuk3Vn1sRtGJHvs3Fn67uPN9KK9wxk4GSEqR"
  },
  {
    publicKey: "032da0d1beaa729d4645a84a3cfc30c5b423c7c531ccaed92ada9da190371fcc4f",
    base58: "9gouChj1vGQBxZ9VQxWbnjguWwWAKvEbqRMr6ERQ4ffndUHWeYF"
  },
  {
    publicKey: "03abae6e65bed69e7f3493299876172b9111ed236195cd4adb345eb2351dac9d2d",
    base58: "9hmR4Xh9mRQEV2JvkFzsTVDEbxqz9Y9ukV2ojuKyUigvNXn6Tkz"
  },
  {
    publicKey: "0316a1356adb2b965097d1cd6e4e47137be0e4e4a392604b2905b345a8d0f3a172",
    base58: "9gdmjiWxCJZg3DzcZNri4THvLyxok7z3QGhMiSYFnJqiKRudKUw"
  },
  {
    publicKey: "03f61d9746767328b4252aeb3f843ae6a2a3a5364a0ef382b3cfbffbac8a1ce45b",
    base58: "9iLCPDXEzWFa4qf77ECATwjy7RXU3YLwQZtTtRyv19p4hssBDUJ"
  },
  {
    publicKey: "022370f7896d7f3c6b7ae11fd12a571f93fc6c9ed21881a5ed5eb69c174fc4e2b0",
    base58: "9enfpDWrxGLutd3z4Y2BZtbvVzQFFyz1y1mHYVX32rVKvF4NR4W"
  },
  {
    publicKey: "02d0653816d7ff23f2db9d3cb87a0baa3f2cd4f47031ef1022a6c8ece6ebdac35b",
    base58: "9g6qhHtbBaQ8m1EefogSNKXJ7gKr4UzRSKGToLLG7eS5dCq1iAg"
  },
  {
    publicKey: "020810f6c517517c2fb03f4ec44a9c8e66f5617bda412c111bda0ce0d4999557f1",
    base58: "9eacZFq5ZQhrTqKK612aWBbyLAnhu6qiUDDwWowLNzqRJ1UFC4o"
  },
  {
    publicKey: "02b6993dcc49cd3582b173ffcdda2979474f2b28ad48ad6f292568162375146e93",
    base58: "9fuUkXBhVwcfUgnKTdQJxz5DSFh6Yj8M6xFKApMiHSFZhTqSc71"
  },
  {
    publicKey: "02a1271f364289a07c09459b20046f017251ff627f3e6acb326f8d5c3f13f4d836",
    base58: "9fk2wuicf5Y33ZFoG432N6X8UdsPTNVRiqwy2kPw3hWNHKKHbXT"
  },
  {
    publicKey: "025df69f6e18c442e3159ff2bc71d150a7d2fbae958be30829482084986098f86b",
    base58: "9fESgaZ9CKfFWFr67p1jy3evKaZTG8KrvA6GUtDwtypvmsFya3E"
  },
  {
    publicKey: "03074be1f4a193e4e18ea7433355bbd9b843c1e9b5f607bb8e91214958816396f5",
    base58: "9gX24w3JjzsxsN5wEkiNuWiF7BmKDLSXi8CFEgRpxsNMpDGT4kj"
  },
  {
    publicKey: "035888ef9fb572b9679e34bd6e818638329ac28fd2f45e26d8a3b6a2fb4dcb160c",
    base58: "9h8oCNGT22R2jQhP2Pxyu3hn2AKFva2tzZNXBKDfHm1UCgBXnMe"
  },
  {
    publicKey: "03f85b00b9a547d291d28abfb20ea64acd4ed42cdc5c6f5997bf71bce1146846d7",
    base58: "9iMBbgkbdpBRLwZPekJJCYjznyd3N9pCezYTGpoW8QDGbT2dAZz"
  },
  {
    publicKey: "025e5ff550570403eba63cc7c666bfd24641a9e556f6cbb60a18445adca283c647",
    base58: "9fEdCBRZWuFvvDn2ZaFWJierdt4vxQdsofqGbcAqrD3cexGRDzF"
  },
  {
    publicKey: "0248b0f583db4b84ba1ee57464b43d177ad81259c53ac8a306fb0faa3e49ed91a0",
    base58: "9f55KF621vAyJ4zxbVt9uMHhNfHuM8tHP39bKbhB6mt1LcWkc4U"
  },
  {
    publicKey: "0329e1e0b5a9edea10b987b7ba32887fee3dfd4c33267a27e789b6f2473bbe73b8",
    base58: "9gnFX5mB4RGFvKa5rs3Y2rES4wk377SuDuNW7MPmhppePGsX6k6"
  },
  {
    publicKey: "0212ec011e7eb0dc2f5f87e94ef10d9a368d9262f852d39781a03cff86157c24b1",
    base58: "9efPrDWSkcGeRp6ypVL51zYCqUBX8GRCTPEJ3cvLdwzhMiu7nc2"
  },
  {
    publicKey: "0233493a7c4313b80251530e1cca7b358efeba1761f52c5b4d82a73e648fb23640",
    base58: "9eueYkka8FbY7gG9Sy8h6xiDyFza8zAkHqCudhsiMAhMLnyTBTD"
  },
  {
    publicKey: "034bf8c458db5910a492918b5b2f8fb3a3bbc9ce863e38d370713fadfe1ae532c0",
    base58: "9h3GHeA4GcREm7UvqwMWuMKLwLEevNcfsBu8Q8ou1qeqsNjUUqY"
  },
  {
    publicKey: "03718d11734cd774ec1c480634820cb60fe7bb0d0218544b25e0c474a41a3a22cd",
    base58: "9hKpCatDfxGyFP8heZdx4x9XMr6rRCRHBbNdbw981XgRgGuXrKY"
  },
  {
    publicKey: "02f03df8f3ce092fe589aa5f9ac78c5afb94bc2493d895d162143b865cdba1f028",
    base58: "9gLsBC4b3csnMHRivS76U6SoEDCavzW6Xp1tjXTTGFidHJvJ2B9"
  },
  {
    publicKey: "036df14dc90d0ff81db5aedc8a712382594844593a7093b23c7d9eb4b66dad7134",
    base58: "9hJE2YVj4zL5L3XznbuMQx17eBVh1c9zraUsV2kq4x5ykj7AhJa"
  },
  {
    publicKey: "035ccf7abd84ad9ba52f8b5e7ffd9837b66cdbca98fdd560de69b8dec7beac3f06",
    base58: "9hAgQkJk2B6cDSfEeoSg1jPmVPjJUXWdQBpsjuesV6rdFy6Y2NJ"
  },
  {
    publicKey: "0216acad3be68d170984e911b2aac23bcdc7a23b8d6dc4fac84a7dc0f51e1d8bee",
    base58: "9eh3hrRZWUH4XawepyPGb4ju3fd6GGTpZe6RYobZRts9VKVAy5M"
  },
  {
    publicKey: "03f14059a2ac584ca9ba34137a7d46df3ed828ba61dd07afc139bae34c5b5ef5bf",
    base58: "9iJ48iTrPj4g8NvFWVXr3bxcE4r9W1yrAQo94fh35L6gXXMnazb"
  },
  {
    publicKey: "02b6f22f52bc365f0a143cd033b0fe983698c7422827a5569f2311773c309631aa",
    base58: "9fuddFuvbvSQeUzcujf4ooUhE6gNmChoyi6DpW7bmnEXgUfiFbH"
  },
  {
    publicKey: "0297af0163a52bbba03502a3699c8628a0ea2f5bfeeb5b0d6dcdb8bfae725f6daf",
    base58: "9ffs4yg6UPpPZju6rAG6MHN22Ro4uxRfJuCCXKvNhesi9kPG2Py"
  },
  {
    publicKey: "035a2a742e87ddf54266c7cf6e9073a5a5acd87a49049aa2d09637303f6f770076",
    base58: "9h9Wre8z6Gr7RDhYaNbZFMXWWobPV6LWLdindkJ5AKmaHunhKck"
  },
  {
    publicKey: "0207a2d53dffdeda5f9db4f2fd1054f53d71aa235789851e7d32ba44f150a09109",
    base58: "9eaRZuJwCnWMGSQbBrv61c3JEoNJpvEEtd9chwbUgAj3vLYpiXT"
  },
  {
    publicKey: "037d055213d70ce96a113ae3f5297f0dc541cd8b147b33f7397e93fd4afb64fb44",
    base58: "9hQsBNHtFBCLG4p9xweMQit2AHMkkHLe8wxnNgBVB4v8ssiPuqx"
  },
  {
    publicKey: "02c5ad898770e147797a3b825b1e9e16ed709b9364f0dc55da7e130e0bf3fe1403",
    base58: "9g27vxedqxsoH9HkgQSGwKWu2KeVU9iscbfuxAYv6cN4QZ9c69r"
  },
  {
    publicKey: "039f17548d76042bb7aec1593d60a3ba4824c598f80ef076920e4923d28406cb6f",
    base58: "9hfsTgpcKbR3E9YpddFWuhweyyA2LXsqkei4THBfUqHAPSg1aF1"
  },
  {
    publicKey: "0357ab5c00616362607d7d9e7000f35f4451a35dd99228b36a38f1461e4308e484",
    base58: "9h8R63vxLW91wfb7yNwVxADh738wPvA4GZB8mSqu8JgcTfhD2cf"
  },
  {
    publicKey: "037f000d07638025f9ca21021e3e9a978a2c351b65f3eb7a2596bbae41ce4892e8",
    base58: "9hRjjwBw522frQjyu6WtQ6baDmgnpgjkregjVZn3vTnmZbHLQUM"
  },
  {
    publicKey: "0290cb76c05baf6ed5f2f4c9f413688f02112240e619130acb66f0ebf50fddeb4d",
    base58: "9fcq6wyGmkQKkZQavkQKC5Zch6zEQXmExKzMz2DYYVkjDkZSc5C"
  },
  {
    publicKey: "02c62da202e1f01b82bcedda5d1c6140694abb4e257224c25c835be1a282ac7328",
    base58: "9g2LiHBYLaPMBj6gHfTS5PDTveyfcxBNAF8q4525GgUbPYu2u4H"
  },
  {
    publicKey: "02e718fe65da7ad9c9a55c8556d286ecd4ba16bb887ab716a73d8998f8b4b30115",
    base58: "9gGqbQ1bTE7Bu56N6MskoriDDKjXnRrHJ6AxJm8yM9ETCf84Sh2"
  },
  {
    publicKey: "0266bb881a2bcb21a083db8fa9c71f23cbeda97122c73b1cf539415bd2a94d69b6",
    base58: "9fJJgPqQZaEVfSTG1Tms7Vu5pHqMuBdmdVSPbtdig2zzHnQR8bk"
  },
  {
    publicKey: "03616aec960f44f04daf074104d5350908e948140b45d9613bcc6f0766d25bd41c",
    base58: "9hCi6UHETT6QqX1aeK4SHWDR4cZGVqpyhr6pEGFr44pTTyoBTe6"
  },
  {
    publicKey: "021fd1069df73b2574b1b04503d480b6a0785cabfdcb463171bd28d03cf163415d",
    base58: "9em5E19op4rinvWs17UwZWEqQ7zQ4c5MSuQqo793KV19wkAjZ8v"
  },
  {
    publicKey: "0314d999352740dfac6ec8e5daf64b1d3e4541aa469ff2ed13b25d0a783e664003",
    base58: "9gczGzZvFiZSjkWnzYBnPvdoypaQgCdpRpenQyCzbTHBqwXrjip"
  },
  {
    publicKey: "03cb3973dd6056ec55c164b46d1956a31703501ea08c32bff8c50d43deef74ba64",
    base58: "9i1JnaNC13gaVQSqAhxzybxDJ46NhN3zsPxEPEzn68fnhLa9LpJ"
  },
  {
    publicKey: "03e373f2d11a60f845eb71e053a60ec06bb27c50dddda788a330e8a0a9dbe7dec7",
    base58: "9iByfsqkDouw7F3opL2JGGKRZYNBdxxZwusMeRFtqhdq6tPGtVG"
  },
  {
    publicKey: "033ac1ff9d2d3eed46e4aebaf3b565e981b74b7de12bd3b1cdba3acce14bf2c7df",
    base58: "9gugadt36i5Wbi4W6USxZakLg3SQiH6FKmJFQ7GZmYRg1KX4yPB"
  },
  {
    publicKey: "03b07b9482790a00ec0fff3f84c3ea7adfc807739e8a5cbeb0b15d733a02a1cf12",
    base58: "9hoXhuMBYm25rojbLXEMpXKZ1JJZuUurJGzjM24s3Do3Lxy1Cjn"
  },
  {
    publicKey: "02ca685d323da8e74a74174cc036bbdc2cf757755f42723ce170d47f226bafcc04",
    base58: "9g4CkJLF75EFRZBWeLqEjfjEmBpXBAKNRR43P725JXozimKHMK1"
  },
  {
    publicKey: "0283087746039e3516f30fc714b9f05225a38d1d2cd810a820f42bac46bd27cf0d",
    base58: "9fWmaXnLTwZNRUVFLr5SQzq6B54icRPjNgh88aH8FKuSiDdwZTE"
  },
  {
    publicKey: "03f61b69bddea365cba9fc6646ba8c016e1d970d3b77dc52461d045e8e47a944f8",
    base58: "9iLCAcVzax7QL1PuGsRGZttTLcL5ZTjqm67GprniTNW5V8GPGao"
  },
  {
    publicKey: "02b9fcee55c4ebb72ebf935f03a59e8f025a351b960c3edce57f61078329ec60b7",
    base58: "9fvyL3Z5CB3C5ABMvNNkwVp96PkszrCQ2oxFS3jTuCrtfKkY57j"
  },
  {
    publicKey: "0363bbc6cade22010859f4363d079c83f762fc4b6db68bd520236553f1f60e971d",
    base58: "9hDjFStP6JVNoboyB65RoHKyXuJJzqd9cg3pZ27rh7ZPJfcadc2"
  },
  {
    publicKey: "03c75630252c3cd6ac09f0c1d6e764e0ae78a50b441a4ccbae86008641e45c569b",
    base58: "9hybUkF5324erUizS79yWh1BzFEjamxteWaWZMRZAWvYN6G2fFE"
  },
  {
    publicKey: "02d3a69b77f708c88d5786773a1953d58413f27ec5c4ec9f093b939bfef4ff74a9",
    base58: "9g8GrJfVuoXq7jxj4ASNeziujQsEPK2jG9VQVbP47AGBiCj4oHn"
  },
  {
    publicKey: "03f0b4f5bc061a39d613377ee6d0040f6dda872821df339ec7021ffef01eb5e5aa",
    base58: "9iHpE2nfYM2xiweFgvGFXKKrU8TMDpm9pGCioH3RqW3WSxuWnFF"
  },
  {
    publicKey: "024dcd35d65311fafdb0662e8d54746195b5402c4b01c566676abc0d04402a3744",
    base58: "9f7KrQDgK2JrQvtpCPm2wqUNoXfHwFUwAv2uvUbUfSGh67S994Z"
  },
  {
    publicKey: "027a442a2b9b98487c6188282e2561f3952f6284566095decc74b55e860021a18c",
    base58: "9fSueEUmPBkgqn1dzzHzmXXYGcozguwfMcK6BrbM9os4MRbKrD6"
  },
  {
    publicKey: "02331baaaa6ddeb35300901d284efc61365ccaf0c043243ca0d6ea71c28c8b8a3f",
    base58: "9eua15VkzPMVeZKz3js9zk9YP4MMd7RNZP4zKKaA6JBjKGzsiyW"
  },
  {
    publicKey: "02a46b9ee92589fc7688e090fee667172792a697f41c0638657eefcc6e2075e098",
    base58: "9fmUQvbvuuFVFo8Fmvx5oKjsdqxtRGa6pRJg3EQZycE2beCc1Kq"
  },
  {
    publicKey: "029af5a6fdf47c7f25befc98b324d6f0c205559bd8e1765c1fe962eda71de2fcf0",
    base58: "9fhJkRaSoPfzE9rA3e4ptK51xvyNsLKonYN1xje5LWaLukx7iX2"
  },
  {
    publicKey: "038b5954b32bca426795d0f44abb147a561e2f7debad8c87e667b8f8c3fd3c56dd",
    base58: "9hXBB1FS1UT5kiopced1LYXgPDoFgoFQsGnqPCbRaLZZ1YbJJHD"
  },
  {
    publicKey: "025b1f0d51ec1df38b44d053e1c7dbab65869ad6196e120af3ae5dc4a0789c6682",
    base58: "9fDC5xRs2FbdxZirUQSpSEKh2eHj4NdfMPsvyaexdd75ZN74qmY"
  },
  {
    publicKey: "0250e592a4427078e3a2b7401de7eb2468826e9c024398bf1d28c55285e078bb68",
    base58: "9f8guzKyjuckSwvbeGXeuH5QBWiAJYqsyCFvpEMYcfKSDPKm9F2"
  },
  {
    publicKey: "0393eaf0b820f84d0e63bf6a47a2aebe4001369c28c48d658b782dfec4a7a55306",
    base58: "9hax3wPEMK4bsxTKEzcibtjLgmvrgaZAcWywnoto7NETYX17Zmk"
  },
  {
    publicKey: "032dc9ef1e0a2949c9387c0b6272e0629554c63cea7e24ac8fdf19fa3062473335",
    base58: "9goyJeHLPcxqCPuqEGCUoEfz52o7gPG1eVtQZSMCvi3EQ8A8ZG3"
  },
  {
    publicKey: "029b7a27d4c17fd7d3484ecabc7770c0ddeca6fc6a5a59a36267e56260981cc51f",
    base58: "9fhXyFaWBhSp7XnbK9u7Nba8fSRBrgZZfUEbxob5zyG4r71YqVf"
  },
  {
    publicKey: "032de82ed5762056dfc40f4abfe977a4e3a4127a481401a8bcc365da623d0129dd",
    base58: "9gp2KhcbQaUFm3DCSRYVH3Ww53C9tw8ofZeUoeoN55pYtK7XwdL"
  },
  {
    publicKey: "023dd6e719fd525e677c5091dacb60050ed85a1254afde10d55ee11dd08abf3519",
    base58: "9ezJ7yjq3tT7jsaLYq9AkC69efqVh4cU1UEqq5sCeU5jhaGwqcY"
  },
  {
    publicKey: "02aa2537f88315b046a4122e800cafbdf72ce39e79fe314dd47b4bc6cabf71facf",
    base58: "9fozegeVzteaytmJswWs2W11zDcMKNZqKTkS23gZG3sEoPpBN5W"
  },
  {
    publicKey: "022749dfb83717f1153f98076b1e58a3b00cff26579f5e9d4c5bd5e31c1365eee5",
    base58: "9epN672De5PjTC4kXuNgeCE1UCy4gVMcfPf4LwqLRKkVAvTGT1a"
  },
  {
    publicKey: "02bd8008797d634617a8b2b81dad960c8fe1ee31d72bfc9cd99a3296cb57064960",
    base58: "9fxX3MqJkH7b7k2TGf5Lw68JtjxHgt4FBUKim3fSmqNqTeAVdNh"
  },
  {
    publicKey: "03fed51210bf16a7b5fdd8c6236b2cdc31f725e3bb3a9b3349d9a940faddc7ddf3",
    base58: "9iQ33K9rTEyiJcVk6zZ2shxy3qnRwcxnBwNFADuuE7xyZBmKZ4m"
  },
  {
    publicKey: "02187b0b08bc05d8c75ea9404aa4822a162c2d48d1c6fd577e3cc07f48953a5e75",
    base58: "9ehqqgAHMMgAt48qCYrcqBZXHTU3pqjKqEhBd9McykNzf8Bi8yy"
  },
  {
    publicKey: "028a25b52b8f5c41d1853897cc3a5222bc124a75929bd9a14ee853b12ba1282248",
    base58: "9fZuJV89U45bEtGxq4W9UY2WavPLhVi9b367S6kh63VsNB3APWc"
  },
  {
    publicKey: "039be6541fd295c6f2e1524d1f4779f5934c7fb07b7583b843a523a92b9453b3d4",
    base58: "9heTwWLrkkXsU7MEmVWpS22QNXQV9DFVzuaAdzUcgcio1x1gSKQ"
  },
  {
    publicKey: "023ed01ff191d428024cdc5d356dc49d90aed9c997eef85d3d5fcaa756d9d49496",
    base58: "9ezizHWuyDxXWQeUv48ocnjLzkHdbkF2FPj66LxNsfn9kqQQyXb"
  },
  {
    publicKey: "03c1d26208bed2fb6f86079d7624603a9fab71712cfc90b73fa235953a297bbeab",
    base58: "9hwAcJG3GkN4ThcEs4hTXETHUkwwtZfoNzCexComu54pfsutmqw"
  },
  {
    publicKey: "03a2120c8a9b50e7953df448ebec6f3cd040010bbe99660bd827bcb567b4b994f5",
    base58: "9hhBZihY9JUvS8LQ2pPF1DrA9ZbGXr4Txwv332SdSpQnKT6s3yY"
  },
  {
    publicKey: "03a02702d292fec96edf8e18a5ae360032f804334636499eac860396641f079969",
    base58: "9hgLZy5XDwWqGW3JXF8JQxcwSLrvK2MqENh6AKr3pM5r32jitpv"
  },
  {
    publicKey: "03509ad0dc6f8181fdb16dcf9c73b4d9857b26ebcf6b9a55b161f5fd01877c63cb",
    base58: "9h5JdatHGbp6Z5F7SiHrPoGPEU8iaD9gFSEjmW8XYFZQHUaNHYX"
  },
  {
    publicKey: "03ea7ab184f2c18bab077fd172e4fee6271158ab564b97b11aecdbd643b914e855",
    base58: "9iF59du2MdwF29Lxz9m89z6oFtGVcCv64BvVKmxLA2ccXsKbAue"
  },
  {
    publicKey: "02281cd7315f1481d1bce4166873d521773c3b2a090f1fdc2e62be8dc878d3ccdf",
    base58: "9epj922KSyexAmtxnmMuT4irUP2EuYD1MmhQveACqFDkvq6ULuy"
  },
  {
    publicKey: "032c78a84790f009be0fe9a351b30666193915b29497e3dfd8957510d68b20fb26",
    base58: "9goPek7AMHBSWr4zmsbKuXHcsBRwLyPTWkmtujujuE3pAtWooBL"
  },
  {
    publicKey: "02673e9e71f69518d35beecd95cc701b671610311afa825ee6421074e3f7a5ab79",
    base58: "9fJXm2YQFWe2pXRHp5u7fPHVU1ouREx2fE4e2BK451KAAvknMjV"
  },
  {
    publicKey: "032345d614599452299cfe3a5c673213e8723bb09262a914a7ff2548cf6f3888de",
    base58: "9gjLgqjRHpkvwUja4db6F9h5KkVHN4bcuM47HfFVTEysuncN3uY"
  },
  {
    publicKey: "02fe476fe793de796eca09b1b25c23767d99a91f5c723124620f93ac5952a4b8e3",
    base58: "9gT3jR5PU9QKrgDuZJ6tKNpoCUwsGPhV6uVg6SL2hmdZGWicq9m"
  },
  {
    publicKey: "029a879c50408a569fa1a7661935759cf61fe770e4953359a73df17b91659723bd",
    base58: "9fh7mb1w4mFpD9aZDs8atNjnp27xN1HQnsgQk1cRiPaeCWMCfRJ"
  },
  {
    publicKey: "03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
    base58: "9hiyKywzPM88aeNkSea84x8YYGDRqBiNEMDRCxig2toUCBPHuZz"
  },
  {
    publicKey: "03297b88b52def0105d798cc3b1278ad58b916e17c52d121821c53c088a39a88dc",
    base58: "9gn5Jo6T7m4pAzCdD9JFdRMPxnfKLPgcX68rD8RQvPLyJsTpKcq"
  },
  {
    publicKey: "03d331a5ebcb69b803814852c9961730818bb3e331a7f0420cc334c6f51a48ef72",
    base58: "9i4pMfeBABdFZB5q1K9yx8S33244wXeEHkCacF1CUyo9DcfegeY"
  },
  {
    publicKey: "02b9bb46d98cff0c526f4039d575986a804ec700971f492a058bb46e687b984f11",
    base58: "9fvrn65NfM6nxFY44B2J363h762CqUxuwJ2wLWvwCVdp8Ebyv95"
  },
  {
    publicKey: "03c47cc7016ccab641a2e35fc13e54f24471ba5d641c4887722ff3419cdbbe14b6",
    base58: "9hxLhUWzG4vKU1RUW7oVjiua8zcatpMutXJKAU44vPFcwkiYLbH"
  },
  {
    publicKey: "03cf1df99cdf8e14e98d4c94ea97c312113de076a63cf0a5fece7f3f370a934942",
    base58: "9i32DgitvbhgsXdDBU5rwZMce4h4w52EarThpti3SPFq68NK4Ny"
  },
  {
    publicKey: "0261f0e8ddaaffdd68e017db228f5809e9771202a6772997e364fb68e86821ce67",
    base58: "9fGCHeLvDdkL4Mm1NmVH73pmxz4mEopo4nnxTTk4zmGS8ZZtsvm"
  },
  {
    publicKey: "03063a8b1e2b89db08a7c13de47b48e3bb3374f486bfb8737a47f37ca8686cba4f",
    base58: "9gWYo46uyPnmeAoY6FpVYUHZG4pXL29DcatCVu158djBUe9scEz"
  },
  {
    publicKey: "026355b8af0dc36712d84061535235111a86bd1ba13e856fd0d9076727b1616c8c",
    base58: "9fGotbf3wXtWFRU3XQTqeVR7EKXCXt7nszxTa8mD5aaqQKs5PCy"
  },
  {
    publicKey: "03e3210444f15ec5ffb1d02af1666587d8a29f66ecb136c41479e57768b3fe1e2a",
    base58: "9iBqPvyWxxkbZsCQD8nvk7ZTWyyqiWGq4qAA3KZCpA3ve9wZfA9"
  },
  {
    publicKey: "03936a4c0501e0bff3896143262c1c31ef38ccbde3d5e6b643e06cc9955ed956a1",
    base58: "9hajDT15h9FK6F6L4gF2sJ3KKzuMLRFvKdhfZnzSWTYedEe8hXy"
  },
  {
    publicKey: "0309b52027722bf18e722e9c724a987a6522cdd5d8b61cb85395f20d56e063cbcb",
    base58: "9gY5f4araP33R5xxqDEbnTvG3yMieQ1JjmNZHHTdY3WnLzDGi5H"
  },
  {
    publicKey: "03c523eebd64f56cc87c9f51745e6189f438ea514020cc9e0fc30fd2d0cac4584a",
    base58: "9hxdNqmrtjnH5b6xXehdqQYRg7c3EdLhJKTp3WeZUEt4p4mG6dh"
  },
  {
    publicKey: "0225dc4cea03fa6ca344337c5e3a41b2a273e7d1d46187b4d9bf78cf377aa698fe",
    base58: "9eojcSmdJPSDD9yWYLnKkGeTAWNoJjZSDU7rwBXitGbnpfTBN7F"
  },
  {
    publicKey: "0230ed3c8a9622359ca7acfc1c8043c4038e4cb519405be113a6122aee06bceabe",
    base58: "9etcHK2oG3gT4sCiCWb8zbPpV795SSoStsGaiAn7MNgtCXUeqBM"
  },
  {
    publicKey: "024e041ef7c95fd67e383b0f5cd43e160c05a8410b641f9d0b2270cb26f347348c",
    base58: "9f7RLBWjY8RpwyteBrUDYtQU9zZVjvnjJxRQSX7JtnQtBChNFSk"
  },
  {
    publicKey: "0280d0002c3180154cb40064db40222b1014e0208ad0ea3a48b360001354e6f547",
    base58: "9fVnrgx9aGFb8b3X4S43FPahspL8j1HiFyQ2kKKFpsCH9rhnDSF"
  },
  {
    publicKey: "03040624cab62187f3ef7888f70776d8a456059e0d492c694d4bd1139292cf7c36",
    base58: "9gVaUjuTBqrsSAj4TqFGiDaittGm9NjmQfhrHGBe1gYpGy1vYEW"
  },
  {
    publicKey: "02c2cec96217dc1be95ad7900e625ae22dce75db9e25c3589ee682ee71dd7b26fd",
    base58: "9fzrcnYcvBKZH6LA5qhD9EzjWmz7LaHjyKJmKLWSU2Ut4xiCDLn"
  },
  {
    publicKey: "0308a723771700f9b52ef669b1426b588cb32fd2c948f9bb6562eae15ed7641c58",
    base58: "9gXciapsGuNHV1XCysFW7pfnQsXbKK5wRevTEukhid6eysu29ot"
  },
  {
    publicKey: "02c4299223436220465b0feb6d1df3484b5ee2a49659f8e94832ed15105afb6d31",
    base58: "9g1TDi11tNWBVsstVTWseJTN7TuN2Mzibt4KQ9K74QrXZdyjHH6"
  },
  {
    publicKey: "02761ba4d004a3630578bfd0c63e460e3e3c1e9399165ad2cecfdd728bfbe7b2ba",
    base58: "9fR5RbnAMpCWnSRupv5hcLgNuMB3Kbi5sVzgfTvDP4rxXNWMU6s"
  },
  {
    publicKey: "02667557d231ae2e3acfe069769b5660eed91aa21f51876cc6e22c97eef2da4133",
    base58: "9fJBgCMdfouRrzdMWiQdjnDGatrjxjYjmYE53Qt2TdKT94sv8Kj"
  },
  {
    publicKey: "0360d88541e488c537e91574346ec2543708843e585cb9d2a2f559073d55bd453e",
    base58: "9hCTVCVZPJsGqEAxes1CzqTKny8zUiibJxm4YRGPh6unoZTmELv"
  },
  {
    publicKey: "038d1bd406c4d1ca0e05ac7c4a24b0ef28513ed92225ae3225afd30689335f51dc",
    base58: "9hXx892fXTW1adNqFkcJGKwqgYuvDgYcXiefD6cSWWHjEuTAV9w"
  },
  {
    publicKey: "02a7256619a481d9aa0586691ef12db2ae5daeac2802895065b536d08942e4cd70",
    base58: "9fng38Y2errU4gMiD2D49DpRSVExcLVkkPiK8j2MYW6E1VEGtsE"
  },
  {
    publicKey: "0310e08a11b243eb0e301a66ac50136f3ee3dca9de33e5a7a0c99cb8ad441c1a34",
    base58: "9gbEo2snj4Liuasw4Sgi6VTF5R51fC4Zj4PGXrLgGTeuAk9SSfV"
  },
  {
    publicKey: "03d2e57348b7bca4375d2206071b786e13d518f29725f7f537772df92a5d11a838",
    base58: "9i4gkh7h9PjNTYRbSjhLQU6xR6iEBJcWZxBgmQSWDYVvFSRf7Uq"
  }
];

export const ergoTsTestVectors = [
  {
    address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCisr",
    ergoTree: "0008cd0278011ec0cf5feb92d61adb51dcb75876627ace6fd9446ab4cabc5313ab7b39a7",
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: "9gsLq5a12nJe33nKtjMe7NPY7o8CQAtjS9amDgALbebv1wmRXrv",
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: "9gU3czAt9q4fQPRWBriBbpfLbRP7JrXRmB7kowtwdyw66PMRmaY",
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: "3WxxVQqxoVSWEKG5B73eNttBX51ZZ6WXLW7fiVDgCFhzRK8R4gmk",
    network: Network.Testnet,
    isValid: true
  },
  {
    address:
      "2Z4YBkDsDvQj8BX7xiySFewjitqp2ge9c99jfes2whbtKitZTxdBYqbrVZUvZvKv6aqn9by4kp3LE1c26LCyosFnVnm6b6U1JYvWpYmL2ZnixJbXLjWAWuBThV1D6dLpqZJYQHYDznJCk49g5TUiS4q8khpag2aNmHwREV7JSsypHdHLgJT7MGaw51aJfNubyzSKxZ4AJXFS27EfXwyCLzW1K6GVqwkJtCoPvrcLqmqwacAWJPkmh78nke9H4oT88XmSbRt2n9aWZjosiZCafZ4osUDxmZcc5QVEeTWn8drSraY3eFKe8Mu9MSCcVU",
    ergoTree:
      "101004020e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a7017300730110010204020404040004c0fd4f05808c82f5f6030580b8c9e5ae040580f882ad16040204c0944004c0f407040004000580f882ad16d19683030191a38cc7a7019683020193c2b2a57300007473017302830108cdeeac93a38cc7b2a573030001978302019683040193b1a5730493c2a7c2b2a573050093958fa3730673079973089c73097e9a730a9d99a3730b730c0599c1a7c1b2a5730d00938cc7b2a5730e0001a390c1a7730f",
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: "88dhgzEuTXaSLUWK1Ro8mB5xfhwP4y8osUycdBV16EBgycjcBebwd2He7QGiXC1qiSM1KZ6bAcpE2iCv",
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: "9fMPy1XY3GW4T6t3LjYofqmzER6x9cV21n5UVJTWmma4Y9mAW6c",
    ergoTree: "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7",
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCiss",
    network: Network.Mainnet,
    isValid: false
  },
  {
    address: "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96c",
    network: Network.Mainnet,
    isValid: false
  },
  {
    address: FEE_MAINNET_ADDRESS_TV,
    ergoTree: FEE_CONTRACT,
    network: Network.Mainnet,
    isValid: true
  },
  {
    address: FEE_TESTNET_ADDRESS_TV,
    ergoTree: FEE_CONTRACT,
    network: Network.Testnet,
    isValid: true
  }
];
