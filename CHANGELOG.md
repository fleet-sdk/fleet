# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.1.0-alpha.15](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.14...v0.1.0-alpha.15) (2022-12-14)


### Features

* **core:** accept hex string on for Coll[Byte] serialization ([0253b2a](https://github.com/fleet-sdk/core/commit/0253b2aea019b2df0d769af7386df182a560cccc))
* **core:** add `SShort`, `SInt`, `SLong`, `SByte` and `SBool` sigma parsing support ([93a03c9](https://github.com/fleet-sdk/core/commit/93a03c97285ed9bef411e93456bd83f52e21c2a3))
* **core:** add `ZigZag` and `VLQ` encoding for `BigInt` ([1271bfd](https://github.com/fleet-sdk/core/commit/1271bfd513d94c985ae426e7c00d9b4a50cd9b8e))
* **plugins:** add Babel Fees plugin ([3a2e23a](https://github.com/fleet-sdk/core/commit/3a2e23a9c93b8b33f7d0298f2d32a5b4f7f87d4e))


### Bug Fixes

* **core:** remove placing options from addInputs ([fe62741](https://github.com/fleet-sdk/core/commit/fe6274117dabbd973396325ad17c917e26575ea7))

## [0.1.0-alpha.14](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.13...v0.1.0-alpha.14) (2022-12-12)


### ⚠ BREAKING CHANGES

* **core:** renamed `allowTokenBurn()` to `allowTokenBurning()` on `TransactionBuilderSettings`

### Features

* **common:** add `OneOrMore<>` type ([9fdfdc6](https://github.com/fleet-sdk/core/commit/9fdfdc685f5e5097ae8aa3385feb70defc0ce77e))
* **core:** add `allowTokenBurningFromPlugins()` settings method ([26824dd](https://github.com/fleet-sdk/core/commit/26824dd499dd6c60010e4050f00e0f565598a04c))
* **core:** add plugins support ([439e737](https://github.com/fleet-sdk/core/commit/439e737ae01b903da97cf39559830360acb55360))
* **core:** allow ensuring inclusion by `boxId` ([d24494f](https://github.com/fleet-sdk/core/commit/d24494f520cd1d1887102e21d08ed2daed7b0331))
* **core:** allow item placement for all collections ([f24c726](https://github.com/fleet-sdk/core/commit/f24c726451de9ec50cb5314f26d72eb2333a266e))
* **core:** allow placing outputs at specific index ([c5f0347](https://github.com/fleet-sdk/core/commit/c5f0347f37091043f2a22c20b0929d8ffa4fcac0))
* **core:** normalize collection types ([821ebcc](https://github.com/fleet-sdk/core/commit/821ebcc2ea4ad334d4590c28f16cd212b7e22ac0))


### Bug Fixes

* **core:** return `OutputBuilder` on `eject` method ([8db2a70](https://github.com/fleet-sdk/core/commit/8db2a704ad6adfad457ecb4e78d2ded192bb8340))

## [0.1.0-alpha.13](https://github.com/fleet-sdk/core/compare/v0.1.0-alpha.12...v0.1.0-alpha.13) (2022-12-09)


### Features

* **core:** allow manual token minting ([8e07d82](https://github.com/fleet-sdk/core/commit/8e07d827c7495f8b7e60d249f27b69892509c63d))


### Bug Fixes

* check blake hash length ([e8c50a0](https://github.com/fleet-sdk/core/commit/e8c50a07d0d9e173b8ecf8202dbf02d470e77946))
