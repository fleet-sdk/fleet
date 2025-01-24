import { hex, utf8 } from "@fleet-sdk/crypto";
import type { SConstant } from "../sigmaConstant";
import {
  SBigInt,
  SBool,
  SByte,
  SColl,
  SGroupElement,
  SInt,
  SLong,
  SPair,
  SShort
} from "../types";
import { type SConstructor, STuple } from "../types/constructors";

const u8a = (input: number[]) => Uint8Array.from(input);

type ConstantTestVector<T> = {
  value: T;
  hex: string;
};

type GenericTypeTestVector = ConstantTestVector<ArrayLike<unknown>> & {
  name: string;
  sconst: SConstant;
};

export const boolVectors: ConstantTestVector<boolean>[] = [
  { hex: "0101", value: true },
  { hex: "0100", value: false }
];

export const byteVectors: ConstantTestVector<number>[] = [
  { hex: "0201", value: 1 },
  { hex: "0202", value: 2 },
  { hex: "024c", value: 76 }
];

export const shortVectors: ConstantTestVector<number>[] = [
  { hex: "0302", value: 1 },
  { hex: "0303", value: -2 },
  { hex: "0322", value: 17 }
];

export const intVectors: ConstantTestVector<number>[] = [
  { hex: "0400", value: 0 },
  { hex: "0401", value: -1 },
  { hex: "0402", value: 1 },
  { hex: "0405", value: -3 },
  { hex: "0414", value: 10 },
  { hex: "042d", value: -23 },
  { hex: "04800f", value: 960 },
  { hex: "04808008", value: 65536 },
  { hex: "04808023", value: 286720 },
  { hex: "04feffffffffffffffff01", value: 2147483647 } // int32 max
];

export const longVectors: ConstantTestVector<bigint | string>[] = [
  { hex: "0500", value: 0n },
  { hex: "0501", value: -1n },
  { hex: "0502", value: 1n },
  { hex: "0503", value: -2n },
  { hex: "0513", value: -10n },
  { hex: "05800f", value: "960" },
  { hex: "05800f", value: 960n },
  { hex: "05807d", value: 8000n },
  { hex: "05808084af5f", value: 12800000000n },
  { hex: "05808084af5f", value: "12800000000" },
  { hex: "05808087a70e", value: 1920000000n },
  { hex: "058080808ae213", value: 339581337600n },
  { hex: "0580808ca1fa60", value: 1665676705792n },
  { hex: "05808091f3ad04", value: 74880000000n },
  { hex: "0580808bd0fda201", value: 2800000000000n },
  { hex: "0580808bad9bc718", value: 54000000000000n },
  { hex: "0580808592e78878", value: 264034072961024n },
  { hex: "0580809d80d0bf9901", value: 337543627513856n },
  { hex: "058080cba684a68201", value: 286526435581952n },
  { hex: "058080b4ccd4dfc603", value: 1000000000000000n },
  { hex: "058080a0f6f4acdbe01b", value: 1000000000000000000n }
];

export const bigintVectors: ConstantTestVector<string>[] = [
  { hex: "060104", value: "4" },
  { hex: "06011a", value: "26" },
  { hex: "06017a", value: "122" },
  { hex: "0602040f", value: "1039" },
  { hex: "060400c1f4a5", value: "12711077" },
  { hex: "060519debd01c7", value: "111111111111" },
  { hex: "06060102b36211c7", value: "1111111111111" },
  {
    hex: "060f9c2404f2634ef40afccc320eed30b3",
    value: "-518499127179672366370132270668500813"
  },
  {
    hex: "060fa48aae0a58c333fcb45c22eb77423f",
    value: "-474878549557465338514633771922800065"
  },
  {
    hex: "060fdd1c7569871f783f9e7c9489215a93",
    value: "-181153180225522922855494996901930349"
  },
  {
    hex: "060ff0be3a08b885a5c09b96aee8797fef",
    value: "-79218493979484035630659040499367953"
  },
  {
    hex: "060fb5c30093fd377e9986d2cb46a6aa80",
    value: "-385467148716983254797818803869275520"
  },
  {
    hex: "060fcbc5a938f002f37a8784120c51000e",
    value: "-271182691629644891741764079254962162"
  },
  {
    hex: "06100080c2a6bf0e86c4b39aaf5b72bf25cf",
    value: "668561996359741991358095026099791311"
  },
  {
    hex: "061000844935789da1a1015e411873fd04a3",
    value: "686868037649042878185896845279823011"
  },
  {
    hex: "06100085a44d9646705fedbf146bcd80d8ef",
    value: "693907944436551502091064778281769199"
  },
  {
    hex: "061000c04e5372d5aec10adf40f09f9695ab",
    value: "998509636264877990895239100406076843"
  },
  {
    hex: "061000c1152c6ecd3042dd7af6d46b4c5e9f",
    value: "1002542744629457825420725569826086559"
  },
  {
    hex: "061000fb98488ddf56996aeb9434f5803b8f",
    value: "1306355186087083611855402901922921359"
  },
  {
    hex: "061000fec346162748f0e3c268260919f73f",
    value: "1322804024768097068934748188867950399"
  },
  {
    hex: "061000ff0aed27d915df669709f890468527",
    value: "1324257312429289019228814893866452263"
  },
  {
    hex: "06104b3b4ca85a86c47a098a223fffffffff",
    value: "99999999999999999999999999999999999999"
  },
  {
    hex: "0610fd399ad011430f3cf1173d88e0157d88",
    value: "-3688583090539181963106320020268548728"
  },
  {
    hex: "0610efcb7de64abd55fa4a07b00ffcc80e04",
    value: "-21540286119252381366314201135174906364"
  },
  {
    hex: "0610f7ee0f9e6b31e5b8bf79c0103cd98a94",
    value: "-10726968522364003605754510423632541036"
  },
  {
    hex: "0610e568d66fc6ef02311087197a516bfd08",
    value: "-35344807721356910388894827443251315448"
  },
  {
    hex: "0610ea4b448df22c343557e9d34980ecd344",
    value: "-28852203192905262646985616891927801020"
  },
  {
    hex: "0610ed8d2982d73cf954ca90f09eebd46697",
    value: "-24522376117792124222555029947659557225"
  },
  {
    hex: "0610f6a12915ff35fbfdc0de719c2b44239f",
    value: "-12455486842055948395012500175862881377"
  },
  {
    hex: "0610e730b99d5580f36594530fd961844c3d",
    value: "-32977704934352917049306884343898813379"
  },
  {
    hex: "0610f51c7da6efcc5267e609d013e6464820",
    value: "-14473575114305738236514890463904905184"
  },
  {
    hex: "0610eb5839c44ec0be3d5b95d4c9522d72ca",
    value: "-27455694137492064653731458579914984758"
  },
  {
    hex: "0610f7ce9e56ef64e15237a2ab2d91aa1f6b",
    value: "-10890227300777841195633415700652351637"
  },
  {
    hex: "0610d3d187be808cd61d4215be07445d3179",
    value: "-58727316548455722622554018085215587975"
  },
  {
    hex: "0610edad8f7090c4b7782c4d8e563c3e731c",
    value: "-24354155260455695334173947929779342564"
  },
  {
    hex: "0610f34e21b2b957ed470b2baabc227286a0",
    value: "-16874281310747317873912526684847700320"
  },
  {
    hex: "0610da31d4846523942d30bf81311ed324e8",
    value: "-50251930933504172440026254536365366040"
  },
  {
    hex: "0610eee296791bc9b5bc269844845d3d5eec",
    value: "-22749592877451455117651003320075198740"
  },
  {
    hex: "0610f43d7dea14e4619a1e2e43774e908e20",
    value: "-15631451993992084997026121768636477920"
  },
  {
    hex: "0610ec6afd4980220003c03b50fee83e697f",
    value: "-26029039175752853511346953066928772737"
  },
  {
    hex: "061913aaf504e4bc1e62173f87a4378c37b49c8ccff196ce3f0ad2",
    value: "123456789012345678901234567890123456789012345678901234567890"
  }
];

export const groupElementVectors: ConstantTestVector<string>[] = [
  {
    hex: "07000000000000000000000000000000000000000000000000000000000000000000",
    value: "000000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    hex: "0702000031a06023f7d372f748a816db1765b4e4f1989cf89791c021a37ce09dae37",
    value: "02000031a06023f7d372f748a816db1765b4e4f1989cf89791c021a37ce09dae37"
  },
  {
    hex: "0702000574ed4686be3f2be5a345f48774039820a2a830efd3d8f2cecb6ec28901b6",
    value: "02000574ed4686be3f2be5a345f48774039820a2a830efd3d8f2cecb6ec28901b6"
  }
];

export const sigmaPropVectors: ConstantTestVector<string>[] = [
  {
    hex: "08cd0200205e052506a4bc22dd580b721bfa994fe954ada92e8e9469636b47f57d9477",
    value: "0200205e052506a4bc22dd580b721bfa994fe954ada92e8e9469636b47f57d9477"
  },
  {
    hex: "08cd0200a4bffdc39c74ce1f31346dd4f47795b9dcd8cd256aab68828a4582e84d4c0e",
    value: "0200a4bffdc39c74ce1f31346dd4f47795b9dcd8cd256aab68828a4582e84d4c0e"
  },
  {
    hex: "08cd0200c662d546939237a0195ef8be81fb0f939285c374b3589cc5d7172c98e33b22",
    value: "0200c662d546939237a0195ef8be81fb0f939285c374b3589cc5d7172c98e33b22"
  }
];

function buildCollVectors<T>(
  name: string,
  elType: SConstructor<T>,
  vectors: {
    hex: string;
    value: ArrayLike<unknown>;
  }[]
): GenericTypeTestVector[] {
  return vectors.map((v) => ({
    name,
    hex: v.hex,
    sconst: SColl(elType, v.value as T[]),
    value: v.value
  }));
}

export const collVectors: GenericTypeTestVector[] = [
  ...buildCollVectors("SColl[SBool]", SBool, [
    {
      hex: "0d0c010e",
      value: [true, false, false, false, false, false, false, false, false, true, true, true] /* biome-ignore format: */
    },
    {
      hex: "0d0c0101",
      value: [true, false, false, false, false, false, false, false, true, false, false, false] /* biome-ignore format: */
    },
    {
      hex: "0d400e01020a0b010202",
      value: [false, true, true, true, false, false, false, false, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, true, true, false, true, false, false, false, false, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false] /* biome-ignore format: */
    }
  ]),
  ...buildCollVectors("SColl[SByte]", SByte, [
    { hex: "0e0a46656d616c6520233035", value: utf8.decode("Female #05") },
    { hex: "0e0130", value: utf8.decode("0") },
    { hex: "0e00", value: u8a([]) },
    {
      hex: "0efe0b476f6c6420686173206265656e20612073746f7265206f66207765616c746820666f722074686f7573616e6473206f6620796561727320616e6420686173206f75746c6173746564207468652063757272656e63696573206f6620766172696f757320656d706972657320616e64206e6174696f6e2d7374617465732074686174206861766520636f6d6520616e6420676f6e652e20497420697320657374696d6174656420746861742077652068617665206c657373207468616e2035352c30303020746f6e73206f6620676f6c64206c65667420746f20646973636f7665722e20476f6c64206d696e696e67206973206f6e65206f6620746865206d6f737420646573747275637469766520696e647573747269657320696e2074686520776f726c642e2049742063616e20646973706c61636520636f6d6d756e69746965732c20636f6e74616d696e617465206472696e6b696e672077617465722c206875727420776f726b6572732c20616e642064657374726f79207072697374696e6520656e7669726f6e6d656e74732e20497420706f6c6c7574657320776174657220616e64206c616e642077697468206d65726375727920616e64206379616e6964652c20656e64616e676572696e6720746865206865616c7468206f662070656f706c6520616e642065636f73797374656d732e0a4f757220556e6465727374616e64696e67206f66206120547261646974696f6e616c20417373657420486173204368616e6765642e0a416e20617373657420697320616e797468696e67206f662076616c7565206f722061207265736f75726365206f662076616c756520746861742063616e20626520636f6e76657274656420696e746f20636173682e20536f20616e206173736574e28099732076616c75652077696c6c20646570656e64206f6e2074686520636f6c6c6563746976652062656c69656620616e64207472757374206f66207468652070656f706c65206465616c696e6720776974682069742e200a5468652067726f77746820696e20746865206e756d626572206f662063727970746f63757272656e63696573206973206368616e67696e6720616c6c206f6620746869732c20616e642074686520666169746820706c6163656420696e207468656d20627920696e766573746f72732069732064726976696e6720636f6e666964656e636520696e207468656d20617320616e20617373657420636c6173732e20496620696e766573746f727320636f6e74696e756520746f2062656c6965766520696e207468652076616c7565206f6620676f6c642062656361757365206f74686572732062656c6965766520696e2069742c2069742077696c6c2072656d61696e20616e2061737365742e2054686520646966666572656e6365206265747765656e2063727970746f63757272656e6369657320746f64617920616e6420676f6c6420696e207468652070617374206973207468657265666f7265206d696e696d616c2e0a4974206973206e6f74206120736563726574207468617420426974636f696e20697320746865206d6f73742076616c75656420616e64207468657265627920617474726163746976652063727970746f63757272656e6379206f6e20746865206d61726b65742e20457870657274732068617665206c617267656c79206372656469746564207468697320746f206974732073636172636974792e200a536361726369747920696e63726561736573207468652076616c7565206f6620616e2061737365742c207468657265666f726520746865204572676f6c64207175616e74697479206973737565642077696c6c20626520636170706564206174203535206d696c6c696f6e2e20546865206e756d626572206f66206b696c6f6772616d73206f6620676f6c64206c65667420746f20626520646973636f76657265642e200a4c65742773207265647563652074686520656e7669726f6e6d656e74616c20696d7061637420616e64206d616b652069747320707261637469636573206d6f7265207375737461696e61626c6520776974682074686520626c6f636b636861696e20746563686e6f6c6f67792e",
      value: utf8.decode("Gold has been a store of wealth for thousands of years and has outlasted the currencies of various empires and nation-states that have come and gone. It is estimated that we have less than 55,000 tons of gold left to discover. Gold mining is one of the most destructive industries in the world. It can displace communities, contaminate drinking water, hurt workers, and destroy pristine environments. It pollutes water and land with mercury and cyanide, endangering the health of people and ecosystems.\nOur Understanding of a Traditional Asset Has Changed.\nAn asset is anything of value or a resource of value that can be converted into cash. So an asset’s value will depend on the collective belief and trust of the people dealing with it. \nThe growth in the number of cryptocurrencies is changing all of this, and the faith placed in them by investors is driving confidence in them as an asset class. If investors continue to believe in the value of gold because others believe in it, it will remain an asset. The difference between cryptocurrencies today and gold in the past is therefore minimal.\nIt is not a secret that Bitcoin is the most valued and thereby attractive cryptocurrency on the market. Experts have largely credited this to its scarcity. \nScarcity increases the value of an asset, therefore the Ergold quantity issued will be capped at 55 million. The number of kilograms of gold left to be discovered. \nLet's reduce the environmental impact and make its practices more sustainable with the blockchain technology.") /* biome-ignore format: */
    },
    {
      hex: "0e9a027b22373231223a7b226572676f61742d3030333436223a7b22696e646578223a3334362c2267656e65726174696f6e223a312c226261636b67726f756e64223a2250737963686f222c226261636b5f6163636573736f7279223a22477265656e20506172726f74222c22626f6479223a22507572706c65222c22636c6f74686573223a225768697465204552476f6174205368697274222c226d6f757468223a2247726974746564205465657468222c2265796573223a22416e67727920526564222c227769656c64223a225370697269742047756e222c226163636573736f7279223a2253696c766572204d6564616c222c2268656164223a22436f77626f7920486174222c2265617272696e67223a224e6f6e65227d7d7d",
      value: utf8.decode('{"721":{"ergoat-00346":{"index":346,"generation":1,"background":"Psycho","back_accessory":"Green Parrot","body":"Purple","clothes":"White ERGoat Shirt","mouth":"Gritted Teeth","eyes":"Angry Red","wield":"Spirit Gun","accessory":"Silver Medal","head":"Cowboy Hat","earring":"None"}}}') /* biome-ignore format: */
    }
  ]),
  ...buildCollVectors("SColl[SShort]", SShort, [
    { hex: "0f00", value: [] },
    { hex: "0f0102", value: [1] },
    { hex: "0f020000", value: [0, 0] },
    { hex: "0f020202", value: [1, 1] },
    { hex: "0f0204a00b", value: [2, 720] },
    { hex: "0f0208cd02", value: [4, -167] },
    { hex: "0f020e10", value: [7, 8] },
    { hex: "0f023636", value: [27, 27] },
    { hex: "0f03000000", value: [0, 0, 0] },
    { hex: "0f03043603", value: [2, 27, -2] },
    { hex: "0f03363636", value: [27, 27, 27] },
    { hex: "0f050202000000", value: [1, 1, 0, 0, 0] },
    { hex: "0f050804020202", value: [4, 2, 1, 1, 1] },
    { hex: "0f0702020000000000", value: [1, 1, 0, 0, 0, 0, 0] },
    { hex: "0f0706040602040204", value: [3, 2, 3, 1, 2, 1, 2] },
    {
      hex: "0f1a3200b40132b80364e807c8019811f403c8011eea0332cc08649213fa01e601009c0400b009008c1500",
      value: [ 25, 0, 90, 25, 220, 50, 500, 100, 1100, 250, 100, 15, 245, 25, 550, 50, 1225, 125, 115, 0, 270, 0, 600, 0, 1350, 0] /* biome-ignore format: */
    },
    {
      hex: "0f200202020202020202020202020202020202020202020202020202020202020202",
      value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] /* biome-ignore format: */
    },
    {
      hex: "0f60020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202",
      value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] /* biome-ignore format: */
    },
    {
      hex: "0f7002020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020201010101010101010101010101010101",
      value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1] /* biome-ignore format: */
    },
    {
      hex: "0f7f02020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020201010101010101010101010101010101010101010101010101010101010101",
      value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1] /* biome-ignore format: */
    }
  ]),
  ...buildCollVectors("SColl[SInt]", SInt, [
    { hex: "1000", value: [] },
    { hex: "100102", value: [1] },
    { hex: "10020000", value: [0, 0] },
    { hex: "10020202", value: [1, 1] },
    { hex: "100204a00b", value: [2, 720] },
    { hex: "100208cd02", value: [4, -167] },
    { hex: "10020e10", value: [7, 8] },
    { hex: "10023636", value: [27, 27] },
    { hex: "1003000000", value: [0, 0, 0] },
    { hex: "1003043603", value: [2, 27, -2] },
    { hex: "1003363636", value: [27, 27, 27] },
    { hex: "10050202000000", value: [1, 1, 0, 0, 0] },
    { hex: "10050804020202", value: [4, 2, 1, 1, 1] },
    { hex: "100702020000000000", value: [1, 1, 0, 0, 0, 0, 0] },
    { hex: "100702020000000600", value: [1, 1, 0, 0, 0, 3, 0] },
    { hex: "100706040602040204", value: [3, 2, 3, 1, 2, 1, 2] },
    {
      hex: "101a3200b40132b80364e807c8019811f403c8011eea0332cc08649213fa01e601009c0400b009008c1500",
      value: [25, 0, 90, 25, 220, 50, 500, 100, 1100, 250, 100, 15, 245, 25, 550, 50, 1225, 125, 115, 0, 270, 0, 600, 0, 1350, 0] /* biome-ignore format: */
    },
    {
      hex: "10200202020202020202020202020202020202020202020202020202020202020202",
      value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] /* biome-ignore format: */
    },
    {
      hex: "107f02020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020201010101010101010101010101010101010101010101010101010101010101",
      value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1] /* biome-ignore format: */
    }
  ]),
  ...buildCollVectors("SColl[SLong]", SLong, [
    { hex: "110100", value: [0n] },
    { hex: "110102", value: [1n] },
    { hex: "110124", value: [18n] },
    { hex: "11018080e1eb17", value: [3200000000n] },
    { hex: "11018081c3b5df03", value: [64346415168n] },
    { hex: "11018081f0e5dd60", value: [1661856514112n] },
    { hex: "110182d2ad9dce60", value: [1659767207041n] }
  ]),
  ...buildCollVectors("SColl[SBigInt]", SBigInt, [
    { hex: "12010100", value: [0n] },
    { hex: "1202010106018271d5b481", value: [1n, 1659767207041n] },
    { hex: "12010112", value: [18n] },
    { hex: "12020500bebc2000050efb586040", value: [3200000000n, 64346415168n] },
    { hex: "1202050efb5860400500bebc2000", value: [64346415168n, 3200000000n] },
    { hex: "1201060182ee5e0040", value: [1661856514112n] },
    {
      hex: "120206018271d5b48106018271d5b481",
      value: [1659767207041n, 1659767207041n]
    }
  ]),
  ...buildCollVectors("SColl[SColl[SByte]]", SColl(SByte), [
    {
      hex: "1a031c4c657427732063656c656272617465204572676f526166666c6521201c4c657427732063656c656272617465204572676f526166666c65212020e730bbae0463346f8ce72be23ab8391d1e7a58f48ed857fcf4ee9aecf6915307",
      value: [
        hex.decode("4c657427732063656c656272617465204572676f526166666c652120"),
        hex.decode("4c657427732063656c656272617465204572676f526166666c652120"),
        hex.decode("e730bbae0463346f8ce72be23ab8391d1e7a58f48ed857fcf4ee9aecf6915307")
      ]
    }
  ]),
  ...buildCollVectors("SColl[SColl[SColl[SColl[SByte]]]]", SColl(SColl(SColl(SByte))), [
    { hex: "0c0c1a00", value: [] },
    { hex: "0c0c1a0101010201ff", value: [[[u8a([0x01, 0xff])]]] }
  ]),
  ...buildCollVectors("SColl[(SInt, SLong)]", SPair(SInt, SLong), [
    {
      hex: "0c400504b40180febe81027880d4d4ab015a80bfdf80013c80aaea55",
      value: [
        [90, 270000000n],
        [60, 180000000n],
        [45, 135000000n],
        [30, 90000000n]
      ]
    }
  ]),
  ...buildCollVectors("SColl[(SColl[SByte], SInt)]", SPair(SColl(SByte), SInt), [
    {
      hex: "0c4c0e01240008cd0302122c332fd4e3c901f045ac18f559dcecf8dc61f6f94fbb34d0c7c3aac71fb714",
      value: [
        [hex.decode("0008cd0302122c332fd4e3c901f045ac18f559dcecf8dc61f6f94fbb34d0c7c3aac71fb7"), 10] /* biome-ignore format: */
      ]
    },
    {
      hex: "0c4c0e03240008cd026d9d81d27185efa93c148f700839183a882aae3a4de1f984faff69eeed37202706240008cd026dd353119c75189796b3fb01c60289399f5fa2e7e115f4d8e3ffcc0a4ba5326906240008cd0287352ce40ff53154c5b3751a661908d3ca99edbb198e7ebb63d1d00e580f2efd06",
      value: [
        [hex.decode("0008cd026d9d81d27185efa93c148f700839183a882aae3a4de1f984faff69eeed372027"), 3] /* biome-ignore format: */,
        [hex.decode("0008cd026dd353119c75189796b3fb01c60289399f5fa2e7e115f4d8e3ffcc0a4ba53269"), 3] /* biome-ignore format: */,
        [hex.decode("0008cd0287352ce40ff53154c5b3751a661908d3ca99edbb198e7ebb63d1d00e580f2efd"), 3] /* biome-ignore format: */
      ]
    },
    {
      hex: "0c4c0e01240008cd0315a5d99a010bf189b1abae2d9f21be6f3438803aca1e6aac739fbee31150d62700",
      value: [
        [hex.decode("0008cd0315a5d99a010bf189b1abae2d9f21be6f3438803aca1e6aac739fbee31150d627"), 0] /* biome-ignore format: */
      ]
    }
  ]),
  ...buildCollVectors(
    "SColl[(SColl[SByte], SColl[SByte])]",
    SPair(SColl(SByte), SColl(SByte)),
    [
      {
        hex: "0c3c0e0e02240008cd03f2d7187f56156cbedde84dffd873f59db7c0e16408c475145a0415317d85cf573339694a6b696558536f6f6b4c74615972384a5a3841386e4b75657639647a524d77786b476a75795165626e5167436a387a6443240008cd02d481d399b808586e94dfd907439b2671999e1d7a97b1705d3363707930a6ec59333967386569796970477666557a675239586a6761423577597641426f447a535969716a754a6b39676769446b334a533476454a",
        value: [
          [
            hex.decode("0008cd03f2d7187f56156cbedde84dffd873f59db7c0e16408c475145a0415317d85cf57") /* biome-ignore format: */,
            hex.decode("39694a6b696558536f6f6b4c74615972384a5a3841386e4b75657639647a524d77786b476a75795165626e5167436a387a6443") /* biome-ignore format: */
          ],
          [
            hex.decode("0008cd02d481d399b808586e94dfd907439b2671999e1d7a97b1705d3363707930a6ec59") /* biome-ignore format: */,
            hex.decode("3967386569796970477666557a675239586a6761423577597641426f447a535969716a754a6b39676769446b334a533476454a") /* biome-ignore format: */
          ]
        ]
      }
    ]
  ),
  ...buildCollVectors("SColl[SColl[(SInt, SInt)]]", SColl(SPair(SInt, SInt)), [
    {
      hex: "0c0c580202020406080208060402",
      value: [
        [
          [1, 2],
          [3, 4]
        ],
        [
          [4, 3],
          [2, 1]
        ]
      ]
    }
  ])
];

export const tupleTestVectors: GenericTypeTestVector[] = [
  {
    name: "(SInt, SInt)",
    sconst: SPair(SInt(2), SInt(2)),
    value: [2, 2],
    hex: "580404"
  },
  {
    name: "(SInt, SLong)",
    sconst: SPair(SInt(0), SLong(1n)),
    value: [0, 1n],
    hex: "40050002"
  },
  {
    name: "(SInt, SBigInt)",
    sconst: SPair(SInt(1), SBigInt(11231234123n)),
    value: [1, 11231234123n],
    hex: "40060205029d6f084b"
  },
  {
    name: "(SInt, SByte)",
    sconst: SPair(SInt(7), SByte(1)),
    value: [7, 1],
    hex: "40020e01"
  },
  {
    name: "(SInt, SColl[SByte])",
    sconst: SPair(SInt(1), SColl(SByte, hex.decode("0a0c"))),
    value: [1, Uint8Array.from([10, 12])],
    hex: "400e02020a0c"
  },
  {
    name: "(SColl[SByte], SColl[SByte])",
    sconst: SPair(
      SColl(SByte, hex.decode("505250")),
      SColl(SByte, hex.decode("596f7572206c6f616e204a616e75617279"))
    ),
    value: [hex.decode("505250"), hex.decode("596f7572206c6f616e204a616e75617279")],
    hex: "3c0e0e0350525011596f7572206c6f616e204a616e75617279"
  },
  {
    name: "(SColl[SByte], SBool, SByte)",
    sconst: STuple(SColl(SByte, [10, 12]), SBool(true), SByte(2)),
    value: [u8a([10, 12]), true, 2],
    hex: "480e0102020a0c0102"
  },
  {
    name: "(SColl[SByte], SGroupElement)",
    sconst: SPair(
      SColl(
        SByte,
        hex.decode("8743542e50d2195907ce017595f8adf1f496c796d9bcc1148ff9ec94d0bf5006")
      ),
      SGroupElement(
        hex.decode("036ebe10da76e99b081b5893635db7518a062bd0f89b07fc056ad9b77c2abce607")
      )
    ),
    value: [
      hex.decode("8743542e50d2195907ce017595f8adf1f496c796d9bcc1148ff9ec94d0bf5006"),
      hex.decode("036ebe10da76e99b081b5893635db7518a062bd0f89b07fc056ad9b77c2abce607")
    ],
    hex: "4f0e208743542e50d2195907ce017595f8adf1f496c796d9bcc1148ff9ec94d0bf5006036ebe10da76e99b081b5893635db7518a062bd0f89b07fc056ad9b77c2abce607"
  },
  {
    name: "(SColl[(SColl[SByte], SColl[SByte])], (SColl[(SColl[SByte], (SInt, SInt))], SColl[(SColl[SByte], (SInt, SInt))]))",
    sconst: SPair(
      SColl(SPair(SColl(SByte), SColl(SByte)), [[u8a([1, 2, 3]), u8a([4, 5, 6])]]),
      SPair(
        SColl(SPair(SColl(SByte), SPair(SInt, SInt)), [[u8a([1, 2, 3]), [10, 11]]]),
        SColl(SPair(SColl(SByte), SPair(SInt, SInt)), [[u8a([4, 5, 6]), [12, 13]]])
      )
    ),
    value: [
      [[u8a([1, 2, 3]), u8a([4, 5, 6])]],
      [[[u8a([1, 2, 3]), [10, 11]]], [[u8a([4, 5, 6]), [12, 13]]]]
    ],
    hex: "3c0c3c0e0e3c0c3c0e580c3c0e58010301020303040506010301020314160103040506181a"
  },
  {
    name: "(SColl[(SColl[SByte], SColl[SByte])], (SColl[(SColl[SByte], (SInt, SInt))], SColl[(SColl[SByte], (SInt, SInt))]))",
    sconst: SPair(
      SColl(SPair(SColl(SByte), SColl(SByte)), [
        [u8a([98, 97, 99, 107, 103, 114, 111, 117, 110, 100]), u8a([98, 108, 117, 101])],
        [u8a([112, 117, 110, 107, 115]), u8a([97, 112, 101])],
        [u8a([98, 101, 97, 114, 100]), u8a([98, 105, 103, 32, 98, 101, 97, 114, 100])],
        [u8a([109, 111, 117, 116, 104]), u8a([109, 111, 100, 101, 115, 116])],
        [u8a([103, 108, 97, 115, 115, 101, 115]), u8a([118, 114])],
        [u8a([116, 111, 112]), u8a([112, 101, 97, 107, 32, 115, 112, 105, 107, 101])]
      ]),
      SPair(
        SColl(SPair(SColl(SByte), SPair(SInt, SInt)), []),
        SColl(SPair(SColl(SByte), SPair(SInt, SInt)), [])
      )
    ),
    value: [
      [
        [u8a([98, 97, 99, 107, 103, 114, 111, 117, 110, 100]), u8a([98, 108, 117, 101])],
        [u8a([112, 117, 110, 107, 115]), u8a([97, 112, 101])],
        [u8a([98, 101, 97, 114, 100]), u8a([98, 105, 103, 32, 98, 101, 97, 114, 100])],
        [u8a([109, 111, 117, 116, 104]), u8a([109, 111, 100, 101, 115, 116])],
        [u8a([103, 108, 97, 115, 115, 101, 115]), u8a([118, 114])],
        [u8a([116, 111, 112]), u8a([112, 101, 97, 107, 32, 115, 112, 105, 107, 101])]
      ],
      [[], []]
    ],
    hex: "3c0c3c0e0e3c0c3c0e580c3c0e58060a6261636b67726f756e6404626c75650570756e6b730361706505626561726409626967206265617264056d6f757468066d6f6465737407676c617373657302767203746f700a7065616b207370696b650000"
  }
];
