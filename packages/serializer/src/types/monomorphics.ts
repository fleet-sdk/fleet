import type { Box } from "@fleet-sdk/common";
import type { AvlTreeData } from "../serializers/avlTreeSerializer";
import type { SConstant } from "../sigmaConstant";
import { SMonomorphicType } from "./base";

export class SUnitType extends SMonomorphicType<undefined> {
  get code(): 0x62 {
    return 0x62;
  }

  toString(): string {
    return "SUnit";
  }
}

export class SBoxType extends SMonomorphicType<SConstant<Box<bigint>>> {
  get code(): 0x63 {
    return 0x63;
  }

  toString(): string {
    return "SBox";
  }
}

export class SAvlTreeType extends SMonomorphicType<AvlTreeData> {
  get code(): 0x64 {
    return 0x64;
  }

  toString(): string {
    return "SAvlTree";
  }
}
