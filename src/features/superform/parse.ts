import { Data } from "./formSlicer";
const { XMLParser } = require("fast-xml-parser");
const { JSONPath } = require("jsonpath-plus");

const lists = [
  "TransferRegisterXml.Supplies.Supply",
  "TransferRegisterXml.Supplies.Supply.Documents.Document",
  "Register.Supplies.Supply",
  "Register.Supplies.Supply.Documents.Document",
];

const addFields = [
  "FundingRequestNumber",
  "FundingRequestAmount",
  "FundingFirstAmount",
  "FundingRequestDate",
  "FundingFirstDat",
];

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (
    name: string,
    jpath: string,
    isLeafNode: boolean,
    isAttribute: boolean
  ) => {
    return lists.indexOf(jpath) !== -1;
  },
});

const sortMap = [
  'RegisterUID',
  'RegisterTemplate',
  'Number',
  'RegisterStartDate',
  'RegisterEndDate',
  'Buyer',
  'Provider',
  'Factor',
  'SupplyAgreement',
  'FactoringAgreement',
  'ActivationUID',
  'Supplies',
]

export default function parse(xml: string | null) {
  if (!xml) return {} as Data;
  const data: Data = parser.parse(xml);
  if (!data["Register"]) {
    data["Register"] = data["TransferRegisterXml"];
    delete data["TransferRegisterXml"];
  }
  delete data["?xml"];

  // move Provider
  JSONPath({
      path: "$.Register.Supplies.Supply[0].Provider",
      json: data,
      callback: ((e: any, b: any, c: any) => {
        // @ts-ignore
        data['Register']['Provider'] = c.value
        delete c.parent[c.parentProperty]
      })
    })

  // reorder Register
  const reorderedRegister = Object.keys(data['Register']).sort(
    (a, b) => {
      return sortMap.indexOf(a) - sortMap.indexOf(b)
    }
  ).map(k=>{
    // @ts-ignore
    return [k, data['Register'][k]]
  })

  data['Register'] = Object.fromEntries(reorderedRegister)

  if (typeof data.Register !== "string") {
    console.log(data);

    // @ts-ignore
    const supplies: Data[] = data.Register.Supplies.Supply;
    supplies.forEach((d, idx) => {
      // @ts-ignore
      data.Register.Supplies.Supply[idx] = Object.fromEntries(
        // @ts-ignore
        addFields.map((v) => [v, ""]).concat(Object.entries(supplies[idx]))
      );
    });
  }
  return data;
}
