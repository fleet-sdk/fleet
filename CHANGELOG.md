# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.1.0-alpha.12](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.11...v0.1.0-alpha.12) (2022-11-27)


### ⚠ BREAKING CHANGES

* **address model:** `ErgoAddress` constructor is now private and accepts an ErgoTree as input

### Features

* add arrays startsWith and endsWith ([d6a4649](https://github.com/fleet-sdk/core/commit/d6a46493dd641b30aba46c5b0a368b1216a68c0d))
* **address model:** add P2SH support ([75466a3](https://github.com/fleet-sdk/core/commit/75466a39a35c3c05895df0fc93927be8fcb1d184))

## [0.1.0-alpha.11](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.10...v0.1.0-alpha.11) (2022-11-18)

## [0.1.0-alpha.10](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.9...v0.1.0-alpha.10) (2022-11-18)

## [0.1.0-alpha.9](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.8...v0.1.0-alpha.9) (2022-11-18)

## [0.1.0-alpha.8](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.7...v0.1.0-alpha.8) (2022-11-15)

## [0.1.0-alpha.7](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.6...v0.1.0-alpha.7) (2022-11-07)


### Features

* **serializer:** add `SigmaProp` and `GroupElement` ([4093468](https://github.com/fleet-sdk/core/commit/40934689933ab0cc1cc63c7d80d6b8801b608eb1))


### Bug Fixes

* **selector:** fix undesired target change ([8341597](https://github.com/fleet-sdk/core/commit/8341597661e0b937f17c8d55eeeec5d58f500db7))

## [0.1.0-alpha.6](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.5...v0.1.0-alpha.6) (2022-10-28)

## [0.1.0-alpha.5](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.4...v0.1.0-alpha.5) (2022-10-28)


### Features

* add generic serialization structure ([912b3a4](https://github.com/fleet-sdk/core/commit/912b3a42b34215b55043152a81374397f476566c))
* add SUnit serialization ([105ffd4](https://github.com/fleet-sdk/core/commit/105ffd4e8ac5e32154d0d4c37b576de144244ff7))

## [0.1.0-alpha.4](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.3...v0.1.0-alpha.4) (2022-10-18)


### Features

* add `SColl` serializer ([012c1e1](https://github.com/fleet-sdk/core/commit/012c1e11d42cf21da6fc39de2ba1fc6c23e26993))

## [0.1.0-alpha.3](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.2...v0.1.0-alpha.3) (2022-10-16)

## [0.1.0-alpha.2](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2022-10-16)


### ⚠ BREAKING CHANGES

* remove selector config from `from()` method.

### Features

* introduce `configureSelector()` method ([f957294](https://github.com/fleet-sdk/core/commit/f9572942e4f89a57c09a01fb7e0d2858efd05460))
* **models:** add context vars support ([175a02b](https://github.com/fleet-sdk/core/commit/175a02bb01fa2e995bfe3278f99da754dcce3401))
* **models:** add ergo box model ([dfcade2](https://github.com/fleet-sdk/core/commit/dfcade207ce746351481040c6344300f7efac297))
* **serialization:** add ergo box serialization ([ad84c6f](https://github.com/fleet-sdk/core/commit/ad84c6f4e1e8d6b5e68414a54e81e8d472ae0ed5))


### Bug Fixes

* fix context extension type ([c0afa4c](https://github.com/fleet-sdk/core/commit/c0afa4cb953ff2cdcedea24dc917631e91bbf761))
* **transaction builder:** multiple minting check ([3726302](https://github.com/fleet-sdk/core/commit/3726302a475aac77ceea88180075f1be68b60511))

## [0.1.0-alpha.1](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2022-10-12)

## 0.1.0-alpha.0 (2022-10-11)


### ⚠ BREAKING CHANGES

* `OutputBuilder.extract()` renamed to `OutpuBuilder.eject()`
* **models:** `Address` is renamed to `ErgoAddress`
* Removed `addToken()` which can be replaced by `addTokens()` and `removeTokens()`
which can be replaced by `builder.extract(({ tokens }) => tokens.remove(tokenId))`

### Features

* add `isHex` assertion ([4439b68](https://github.com/fleet-sdk/core/commit/4439b68ae14231bdbdb6cc78306e5e965687ce28))
* **array utils:** add `chunk()` ([0f99f6b](https://github.com/fleet-sdk/core/commit/0f99f6b5b0f9469809193c448f431d42d64b93e5))
* **bigint utils:** add conditional `sumBy()` ([c72afd9](https://github.com/fleet-sdk/core/commit/c72afd9c88fcd99e21dd6e0b597d704b2e685022))
* **box selector:** add `buildSelectionTarget()` method ([f8ff38c](https://github.com/fleet-sdk/core/commit/f8ff38c12f153788be08e6981b7eb2938ca75acf))
* **box selector:** add `ensureInclusion` method ([052ea29](https://github.com/fleet-sdk/core/commit/052ea2945a9f9ab0316b5f53c8783adcd8f4f86a))
* **box selector:** add `sortBy` method ([858966a](https://github.com/fleet-sdk/core/commit/858966a2922a799a10216592cd291da4173849f6))
* **box selector:** add insufficient inputs validation ([47f2b12](https://github.com/fleet-sdk/core/commit/47f2b12e37e18391fe335c28bd38e611b4b555e6))
* **box selector:** add target builder ([076ac44](https://github.com/fleet-sdk/core/commit/076ac440f6f44c1c5dd18e7227e84cc3f461647e))
* **box selector:** allow `undefined` amounts on selection targets ([4aeb94c](https://github.com/fleet-sdk/core/commit/4aeb94c78265275951a43ce89e8e1e98d69d7bb2))
* **box selector:** allow multiple selection exec ([a696676](https://github.com/fleet-sdk/core/commit/a6966767eb2faf8cc1b8661445bdc391fda0f907))
* **box utils:** add `boxSum()` ([49bc46f](https://github.com/fleet-sdk/core/commit/49bc46fb813c4a4a1a676f3c297b9e9865b84c3f))
* **boxUtils:** add `areRegistersDenselyPacked` ([c084029](https://github.com/fleet-sdk/core/commit/c0840290fa27b2acf37468fa11a386b86597d3da))
* **builder:** add box selector ([43578c6](https://github.com/fleet-sdk/core/commit/43578c678beab298fb02a23a90c4e9d88037f194))
* **builder:** add transaction builder ([d06f647](https://github.com/fleet-sdk/core/commit/d06f64733185d489c0e1e123b1ec26bd3e663da2))
* **building:** add EIP4 minting registers ([c71662c](https://github.com/fleet-sdk/core/commit/c71662ceb216360db21b177e40cb277816e82d58))
* **models:** add Address model ([8cb4db8](https://github.com/fleet-sdk/core/commit/8cb4db8ee78be4d421dafd76b919af0d209c4073))
* **models:** add inputs collection ([70ffba4](https://github.com/fleet-sdk/core/commit/70ffba4f26b8706fb6e177e575de6867b4a74766))
* **models:** add outputs collection ([91c0a39](https://github.com/fleet-sdk/core/commit/91c0a39fec80e9ad84605376bc44b4bf597f81de))
* **object utils:** add `isDefined()` ([b1d52d6](https://github.com/fleet-sdk/core/commit/b1d52d6bac8ffb499c379f987ec8f70db379dd94))
* **output builder:** add output builder ([7a7668f](https://github.com/fleet-sdk/core/commit/7a7668f974bbdfa1fd945ee9055d9bfb3c1a3bc4))
* **outputs collection:** add `clone()` method ([2e56ee2](https://github.com/fleet-sdk/core/commit/2e56ee2110bbe3598d70309cf15e7d3f68df172c))
* **selectors:** add accumulative selection strategy ([740594e](https://github.com/fleet-sdk/core/commit/740594e03d92c7e5e0bc8112127c66dcf7c187e4))
* **serializer:** add BytesColl type ([a5e6e1d](https://github.com/fleet-sdk/core/commit/a5e6e1d80ad82cd80d8a960ac1dfa68da6f108bf))
* **serializer:** add VLQ encoding ([bfcf818](https://github.com/fleet-sdk/core/commit/bfcf818818a599e4d9835a0858c2ee4d409e94bb))
* **serializer:** add ZigZag encoding ([e4b5820](https://github.com/fleet-sdk/core/commit/e4b582006d5087a96c94a69f710170b5e664066c))
* **transaction builder:** add basic transaction builder structure ([2b4c9a6](https://github.com/fleet-sdk/core/commit/2b4c9a6c743110f8850b3313d99142b8005a1e4f))
* **tx builder:** add token burning validations ([7d4af2b](https://github.com/fleet-sdk/core/commit/7d4af2becdd7e51d543f72747ab1d7eabe04bd2a))
* **types:** add base types ([9879a7e](https://github.com/fleet-sdk/core/commit/9879a7e54ce2e63ed5e45b0db989cc8ebc6c3f5f))
* **utils:** add `bigIntUtils` ([fbfbf5f](https://github.com/fleet-sdk/core/commit/fbfbf5f9863d8510a80ad60ae49aae46093e5de2))


### Bug Fixes

* **address:** only tries to extract publik key from `P2PK` addresses ([515aa43](https://github.com/fleet-sdk/core/commit/515aa43613abab17f08458fac3037f017b84ef32))
* **box selector:** check for duplicate inputs after selection and makes accumulative strategy unique ([86de3ef](https://github.com/fleet-sdk/core/commit/86de3ef262d7f3aa557e8ae2520092a12f0ecca6))
* **ergo address model:** fix address encoding from public key hex string ([f036a21](https://github.com/fleet-sdk/core/commit/f036a21e68764f9de74e20040dc20babad259f6d))
* fix VLQ algo ([5723101](https://github.com/fleet-sdk/core/commit/5723101e329dcfecb197346452daca49a9dd4768))
* **output builder:** accept `ErgoAddress` object as recipiend address ([7e1f8a5](https://github.com/fleet-sdk/core/commit/7e1f8a5e861dc6e78be203e5df215bfd08693257))


* add `Collection` and `TokensCollection` ([a4c2637](https://github.com/fleet-sdk/core/commit/a4c263756d8dc7a998ccdd5adeeaa1b9b0f64b96))
* **models:** rename `Address` to `ErgoAddress` ([c39c427](https://github.com/fleet-sdk/core/commit/c39c427df36963373c9337d6fd41ddc6aa7862c7))
* rename Context Extractor to Context Ejector ([32dd529](https://github.com/fleet-sdk/core/commit/32dd529a99a77662d60484922ec3f9c028f33842))

## 0.1.0-alpha.0 (2022-10-11)


### ⚠ BREAKING CHANGES

* `OutputBuilder.extract()` renamed to `OutpuBuilder.eject()`
* **models:** `Address` is renamed to `ErgoAddress`
* Removed `addToken()` which can be replaced by `addTokens()` and `removeTokens()`
which can be replaced by `builder.extract(({ tokens }) => tokens.remove(tokenId))`

### Features

* add `isHex` assertion ([4439b68](https://github.com/capt-nemo429/fleet/commit/4439b68ae14231bdbdb6cc78306e5e965687ce28))
* **array utils:** add `chunk()` ([0f99f6b](https://github.com/capt-nemo429/fleet/commit/0f99f6b5b0f9469809193c448f431d42d64b93e5))
* **bigint utils:** add conditional `sumBy()` ([c72afd9](https://github.com/capt-nemo429/fleet/commit/c72afd9c88fcd99e21dd6e0b597d704b2e685022))
* **box selector:** add `buildSelectionTarget()` method ([f8ff38c](https://github.com/capt-nemo429/fleet/commit/f8ff38c12f153788be08e6981b7eb2938ca75acf))
* **box selector:** add `ensureInclusion` method ([052ea29](https://github.com/capt-nemo429/fleet/commit/052ea2945a9f9ab0316b5f53c8783adcd8f4f86a))
* **box selector:** add `sortBy` method ([858966a](https://github.com/capt-nemo429/fleet/commit/858966a2922a799a10216592cd291da4173849f6))
* **box selector:** add insufficient inputs validation ([47f2b12](https://github.com/capt-nemo429/fleet/commit/47f2b12e37e18391fe335c28bd38e611b4b555e6))
* **box selector:** add target builder ([076ac44](https://github.com/capt-nemo429/fleet/commit/076ac440f6f44c1c5dd18e7227e84cc3f461647e))
* **box selector:** allow `undefined` amounts on selection targets ([4aeb94c](https://github.com/capt-nemo429/fleet/commit/4aeb94c78265275951a43ce89e8e1e98d69d7bb2))
* **box selector:** allow multiple selection exec ([a696676](https://github.com/capt-nemo429/fleet/commit/a6966767eb2faf8cc1b8661445bdc391fda0f907))
* **box utils:** add `boxSum()` ([49bc46f](https://github.com/capt-nemo429/fleet/commit/49bc46fb813c4a4a1a676f3c297b9e9865b84c3f))
* **boxUtils:** add `areRegistersDenselyPacked` ([c084029](https://github.com/capt-nemo429/fleet/commit/c0840290fa27b2acf37468fa11a386b86597d3da))
* **builder:** add box selector ([43578c6](https://github.com/capt-nemo429/fleet/commit/43578c678beab298fb02a23a90c4e9d88037f194))
* **builder:** add transaction builder ([d06f647](https://github.com/capt-nemo429/fleet/commit/d06f64733185d489c0e1e123b1ec26bd3e663da2))
* **building:** add EIP4 minting registers ([c71662c](https://github.com/capt-nemo429/fleet/commit/c71662ceb216360db21b177e40cb277816e82d58))
* **models:** add Address model ([8cb4db8](https://github.com/capt-nemo429/fleet/commit/8cb4db8ee78be4d421dafd76b919af0d209c4073))
* **models:** add inputs collection ([70ffba4](https://github.com/capt-nemo429/fleet/commit/70ffba4f26b8706fb6e177e575de6867b4a74766))
* **models:** add outputs collection ([91c0a39](https://github.com/capt-nemo429/fleet/commit/91c0a39fec80e9ad84605376bc44b4bf597f81de))
* **object utils:** add `isDefined()` ([b1d52d6](https://github.com/capt-nemo429/fleet/commit/b1d52d6bac8ffb499c379f987ec8f70db379dd94))
* **output builder:** add output builder ([7a7668f](https://github.com/capt-nemo429/fleet/commit/7a7668f974bbdfa1fd945ee9055d9bfb3c1a3bc4))
* **outputs collection:** add `clone()` method ([2e56ee2](https://github.com/capt-nemo429/fleet/commit/2e56ee2110bbe3598d70309cf15e7d3f68df172c))
* **selectors:** add accumulative selection strategy ([740594e](https://github.com/capt-nemo429/fleet/commit/740594e03d92c7e5e0bc8112127c66dcf7c187e4))
* **serializer:** add BytesColl type ([a5e6e1d](https://github.com/capt-nemo429/fleet/commit/a5e6e1d80ad82cd80d8a960ac1dfa68da6f108bf))
* **serializer:** add VLQ encoding ([bfcf818](https://github.com/capt-nemo429/fleet/commit/bfcf818818a599e4d9835a0858c2ee4d409e94bb))
* **serializer:** add ZigZag encoding ([e4b5820](https://github.com/capt-nemo429/fleet/commit/e4b582006d5087a96c94a69f710170b5e664066c))
* **transaction builder:** add basic transaction builder structure ([2b4c9a6](https://github.com/capt-nemo429/fleet/commit/2b4c9a6c743110f8850b3313d99142b8005a1e4f))
* **tx builder:** add token burning validations ([7d4af2b](https://github.com/capt-nemo429/fleet/commit/7d4af2becdd7e51d543f72747ab1d7eabe04bd2a))
* **types:** add base types ([9879a7e](https://github.com/capt-nemo429/fleet/commit/9879a7e54ce2e63ed5e45b0db989cc8ebc6c3f5f))
* **utils:** add `bigIntUtils` ([fbfbf5f](https://github.com/capt-nemo429/fleet/commit/fbfbf5f9863d8510a80ad60ae49aae46093e5de2))


### Bug Fixes

* **address:** only tries to extract publik key from `P2PK` addresses ([515aa43](https://github.com/capt-nemo429/fleet/commit/515aa43613abab17f08458fac3037f017b84ef32))
* **box selector:** check for duplicate inputs after selection and makes accumulative strategy unique ([86de3ef](https://github.com/capt-nemo429/fleet/commit/86de3ef262d7f3aa557e8ae2520092a12f0ecca6))
* **ergo address model:** fix address encoding from public key hex string ([f036a21](https://github.com/capt-nemo429/fleet/commit/f036a21e68764f9de74e20040dc20babad259f6d))
* fix VLQ algo ([5723101](https://github.com/capt-nemo429/fleet/commit/5723101e329dcfecb197346452daca49a9dd4768))
* **output builder:** accept `ErgoAddress` object as recipiend address ([7e1f8a5](https://github.com/capt-nemo429/fleet/commit/7e1f8a5e861dc6e78be203e5df215bfd08693257))


* add `Collection` and `TokensCollection` ([a4c2637](https://github.com/capt-nemo429/fleet/commit/a4c263756d8dc7a998ccdd5adeeaa1b9b0f64b96))
* **models:** rename `Address` to `ErgoAddress` ([c39c427](https://github.com/capt-nemo429/fleet/commit/c39c427df36963373c9337d6fd41ddc6aa7862c7))
* rename Context Extractor to Context Ejector ([32dd529](https://github.com/capt-nemo429/fleet/commit/32dd529a99a77662d60484922ec3f9c028f33842))
