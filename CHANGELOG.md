# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.1.0-alpha.22](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.21...v0.1.0-alpha.22) (2023-03-21)

## [0.1.0-alpha.21](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.20...v0.1.0-alpha.21) (2023-03-21)


### Features

* **core:** add `SColl` parser ([cb9c958](https://github.com/fleet-sdk/core/commit/cb9c95882bd3936338b9509dbf5552fb20a3a264))
* **core:** add `SGroupElement` parser. ([048ba88](https://github.com/fleet-sdk/core/commit/048ba887c1fd4e5f2888dad5354a493f0b07bd8b))
* **core:** add `SigmaProp.ProveDlog` parser ([584029d](https://github.com/fleet-sdk/core/commit/584029d2cc9e50d6e9d89eb8e2086e765d0c1012))


### Bug Fixes

* wrong error message ([b94ee22](https://github.com/fleet-sdk/core/commit/b94ee22a33af22f4b21599acadba42e6929518fa))

## [0.1.0-alpha.20](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.19...v0.1.0-alpha.20) (2023-02-20)

### Features

- **core:** add transaction serializer ([198a0b7](https://github.com/fleet-sdk/core/commit/198a0b70c3d0354a845d1bb4b0b3352e9d3b7f8d))
- **common:** add `utxoSumResultDiff()` function ([79caa7b](https://github.com/fleet-sdk/core/commit/79caa7b4331f4ec1eaece26db4b5dd34d99283e0))
- **core:** add `ErgoUnsignedTransaction` model ([a8546eb](https://github.com/fleet-sdk/core/commit/a8546eba5e867b7bc24eaf20ec4cb005c42067ca))

### ⚠ BREAKING CHANGES

- **core:** "default" and "EIP-12" params will be no longer supported on `TransactionBuilder.build()` as now it returns an instance of`ErgoUnsignedTransaction`. `ErgoUnsignedTransaction.toPlainObject()` and `ErgoUnsignedTransaction.toEIP12Object()` can be used to achieve the same results. ([a8546eb](https://github.com/fleet-sdk/core/commit/a8546eba5e867b7bc24eaf20ec4cb005c42067ca))

## [0.1.0-alpha.19](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.18...v0.1.0-alpha.19) (2023-01-09)

### Bug Fixes

- fix out of order registers serialization ([45321dd](https://github.com/fleet-sdk/core/commit/45321dd751b58af3a3a5a3df6f26f7be467e2c77))

## [0.1.0-alpha.18](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.17...v0.1.0-alpha.18) (2022-12-27)

### ⚠ BREAKING CHANGES

- **common:** rename `bigIntToStr()` to `decimalize()` and `strToBigInt()` to `undecimalize()`

- **common:** rename `bigIntToStr()` to `decimalize()` and `strToBigInt()` to `undecimalize()` ([27d44f6](https://github.com/fleet-sdk/core/commit/27d44f6eb9a705db1021067362cebbcd77e19728))

## [0.1.0-alpha.17](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.16...v0.1.0-alpha.17) (2022-12-24)

## [0.1.0-alpha.16](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.15...v0.1.0-alpha.16) (2022-12-24)

### Features

- **common:** add `bigIntToStr()` and `strToBigInt()` utility functions ([5c75337](https://github.com/fleet-sdk/core/commit/5c75337819b430dc5c8a21d76e78f19fad9a7d2b))

### Bug Fixes

- **core:** validate min `OutputBuilder` value. ([529d5e1](https://github.com/fleet-sdk/core/commit/529d5e1ea7da5b2ac29fe82851d57a6aacfbf878)), closes [#2](https://github.com/fleet-sdk/core/issues/2)

## [0.1.0-alpha.15](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.14...v0.1.0-alpha.15) (2022-12-14)

### Features

- **core:** accept hex string on for Coll[Byte] serialization ([0253b2a](https://github.com/fleet-sdk/core/commit/0253b2aea019b2df0d769af7386df182a560cccc))
- **core:** add `SShort`, `SInt`, `SLong`, `SByte` and `SBool` sigma parsing support ([93a03c9](https://github.com/fleet-sdk/core/commit/93a03c97285ed9bef411e93456bd83f52e21c2a3))
- **core:** add `ZigZag` and `VLQ` encoding for `BigInt` ([1271bfd](https://github.com/fleet-sdk/core/commit/1271bfd513d94c985ae426e7c00d9b4a50cd9b8e))
- **plugins:** add Babel Fees plugin ([3a2e23a](https://github.com/fleet-sdk/core/commit/3a2e23a9c93b8b33f7d0298f2d32a5b4f7f87d4e))

### Bug Fixes

- **core:** remove placing options from addInputs ([fe62741](https://github.com/fleet-sdk/core/commit/fe6274117dabbd973396325ad17c917e26575ea7))

## [0.1.0-alpha.14](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.13...v0.1.0-alpha.14) (2022-12-12)

### ⚠ BREAKING CHANGES

- **core:** renamed `allowTokenBurn()` to `allowTokenBurning()` on `TransactionBuilderSettings`

### Features

- **common:** add `OneOrMore<>` type ([9fdfdc6](https://github.com/fleet-sdk/core/commit/9fdfdc685f5e5097ae8aa3385feb70defc0ce77e))
- **core:** add `allowTokenBurningFromPlugins()` settings method ([26824dd](https://github.com/fleet-sdk/core/commit/26824dd499dd6c60010e4050f00e0f565598a04c))
- **core:** add plugins support ([439e737](https://github.com/fleet-sdk/core/commit/439e737ae01b903da97cf39559830360acb55360))
- **core:** allow ensuring inclusion by `boxId` ([d24494f](https://github.com/fleet-sdk/core/commit/d24494f520cd1d1887102e21d08ed2daed7b0331))
- **core:** allow item placement for all collections ([f24c726](https://github.com/fleet-sdk/core/commit/f24c726451de9ec50cb5314f26d72eb2333a266e))
- **core:** allow placing outputs at specific index ([c5f0347](https://github.com/fleet-sdk/core/commit/c5f0347f37091043f2a22c20b0929d8ffa4fcac0))
- **core:** normalize collection types ([821ebcc](https://github.com/fleet-sdk/core/commit/821ebcc2ea4ad334d4590c28f16cd212b7e22ac0))

### Bug Fixes

- **core:** return `OutputBuilder` on `eject` method ([8db2a70](https://github.com/fleet-sdk/core/commit/8db2a704ad6adfad457ecb4e78d2ded192bb8340))

## [0.1.0-alpha.13](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.12...v0.1.0-alpha.13) (2022-12-09)

### Features

- **core:** allow manual token minting ([8e07d82](https://github.com/fleet-sdk/core/commit/8e07d827c7495f8b7e60d249f27b69892509c63d))

### Bug Fixes

- check blake hash length ([e8c50a0](https://github.com/fleet-sdk/core/commit/e8c50a07d0d9e173b8ecf8202dbf02d470e77946))
