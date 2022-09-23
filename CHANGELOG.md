# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.1](https://github.com/capt-nemo429/flet/compare/v0.1.0...v0.1.1) (2022-09-23)


### Bug Fixes

* **ergo address model:** fix address encoding from public key hex string ([f036a21](https://github.com/capt-nemo429/flet/commit/f036a21e68764f9de74e20040dc20babad259f6d))

## [0.1.0](https://github.com/capt-nemo429/flet/compare/v0.0.5...v0.1.0) (2022-09-23)


### ⚠ BREAKING CHANGES

* `OutputBuilder.extract()` renamed to `OutpuBuilder.eject()`
* **models:** `Address` is renamed to `ErgoAddress`
* Removed `addToken()` which can be replaced by `addTokens()` and `removeTokens()`
which can be replaced by `builder.extract(({ tokens }) => tokens.remove(tokenId))`

### Features

* **models:** add inputs collection ([70ffba4](https://github.com/capt-nemo429/flet/commit/70ffba4f26b8706fb6e177e575de6867b4a74766))
* **models:** add outputs collection ([91c0a39](https://github.com/capt-nemo429/flet/commit/91c0a39fec80e9ad84605376bc44b4bf597f81de))


* add `Collection` and `TokensCollection` ([a4c2637](https://github.com/capt-nemo429/flet/commit/a4c263756d8dc7a998ccdd5adeeaa1b9b0f64b96))
* **models:** rename `Address` to `ErgoAddress` ([c39c427](https://github.com/capt-nemo429/flet/commit/c39c427df36963373c9337d6fd41ddc6aa7862c7))
* rename Context Extractor to Context Ejector ([32dd529](https://github.com/capt-nemo429/flet/commit/32dd529a99a77662d60484922ec3f9c028f33842))

### [0.0.5](https://github.com/capt-nemo429/flet/compare/v0.0.4...v0.0.5) (2022-09-09)

### 0.0.4 (2022-09-08)


### Features

* add `isHex` assertion ([4439b68](https://github.com/capt-nemo429/flet/commit/4439b68ae14231bdbdb6cc78306e5e965687ce28))
* **box selector:** add `ensureInclusion` method ([052ea29](https://github.com/capt-nemo429/flet/commit/052ea2945a9f9ab0316b5f53c8783adcd8f4f86a))
* **box selector:** add `sortBy` method ([858966a](https://github.com/capt-nemo429/flet/commit/858966a2922a799a10216592cd291da4173849f6))
* **box selector:** add insufficient inputs validation ([47f2b12](https://github.com/capt-nemo429/flet/commit/47f2b12e37e18391fe335c28bd38e611b4b555e6))
* **boxUtils:** add `areRegistersDenselyPacked` ([c084029](https://github.com/capt-nemo429/flet/commit/c0840290fa27b2acf37468fa11a386b86597d3da))
* **builder:** add box selector ([43578c6](https://github.com/capt-nemo429/flet/commit/43578c678beab298fb02a23a90c4e9d88037f194))
* **building:** add EIP4 minting registers ([c71662c](https://github.com/capt-nemo429/flet/commit/c71662ceb216360db21b177e40cb277816e82d58))
* **models:** add Address model ([8cb4db8](https://github.com/capt-nemo429/flet/commit/8cb4db8ee78be4d421dafd76b919af0d209c4073))
* **output builder:** add output builder ([7a7668f](https://github.com/capt-nemo429/flet/commit/7a7668f974bbdfa1fd945ee9055d9bfb3c1a3bc4))
* **selectors:** add accumulative selection strategy ([740594e](https://github.com/capt-nemo429/flet/commit/740594e03d92c7e5e0bc8112127c66dcf7c187e4))
* **serializer:** add BytesColl type ([a5e6e1d](https://github.com/capt-nemo429/flet/commit/a5e6e1d80ad82cd80d8a960ac1dfa68da6f108bf))
* **serializer:** add VLQ encoding ([bfcf818](https://github.com/capt-nemo429/flet/commit/bfcf818818a599e4d9835a0858c2ee4d409e94bb))
* **serializer:** add ZigZag encoding ([e4b5820](https://github.com/capt-nemo429/flet/commit/e4b582006d5087a96c94a69f710170b5e664066c))
* **transaction builder:** add basic transaction builder structure ([2b4c9a6](https://github.com/capt-nemo429/flet/commit/2b4c9a6c743110f8850b3313d99142b8005a1e4f))
* **types:** add base types ([9879a7e](https://github.com/capt-nemo429/flet/commit/9879a7e54ce2e63ed5e45b0db989cc8ebc6c3f5f))
* **utils:** add `bigIntUtils` ([fbfbf5f](https://github.com/capt-nemo429/flet/commit/fbfbf5f9863d8510a80ad60ae49aae46093e5de2))


### Bug Fixes

* **address:** only tries to extract publik key from `P2PK` addresses ([515aa43](https://github.com/capt-nemo429/flet/commit/515aa43613abab17f08458fac3037f017b84ef32))
* fix VLQ algo ([5723101](https://github.com/capt-nemo429/flet/commit/5723101e329dcfecb197346452daca49a9dd4768))

### [0.0.3](https://github.com/capt-nemo429/flet/compare/v0.0.2...v0.0.3) (2022-08-11)


### Features

* **box selector:** add `ensureInclusion` method ([052ea29](https://github.com/capt-nemo429/flet/commit/052ea2945a9f9ab0316b5f53c8783adcd8f4f86a))
* **box selector:** add `sortBy` method ([858966a](https://github.com/capt-nemo429/flet/commit/858966a2922a799a10216592cd291da4173849f6))
* **box selector:** add insufficient inputs validation ([47f2b12](https://github.com/capt-nemo429/flet/commit/47f2b12e37e18391fe335c28bd38e611b4b555e6))
* **builder:** add box selector ([43578c6](https://github.com/capt-nemo429/flet/commit/43578c678beab298fb02a23a90c4e9d88037f194))
* **selectors:** add accumulative selection strategy ([740594e](https://github.com/capt-nemo429/flet/commit/740594e03d92c7e5e0bc8112127c66dcf7c187e4))
* **utils:** add `bigIntUtils` ([fbfbf5f](https://github.com/capt-nemo429/flet/commit/fbfbf5f9863d8510a80ad60ae49aae46093e5de2))

### [0.0.2](https://github.com/capt-nemo429/flet/compare/v0.0.1...v0.0.2) (2022-08-07)


### Features

* **transaction builder:** add basic transaction builder structure ([2b4c9a6](https://github.com/capt-nemo429/flet/commit/2b4c9a6c743110f8850b3313d99142b8005a1e4f))

### 0.0.1 (2022-08-05)


### Features

* **types:** add base types ([9879a7e](https://github.com/capt-nemo429/flet/commit/9879a7e54ce2e63ed5e45b0db989cc8ebc6c3f5f))
