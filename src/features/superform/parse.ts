import { Data } from "./formSlicer";
const { XMLParser } = require("fast-xml-parser");

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

export default function parse(xml: string | null) {
  if (!xml) return {} as Data;
  const data: Data = parser.parse(xml);
  if (!data["Register"]) {
    data["Register"] = data["TransferRegisterXml"];
    delete data["TransferRegisterXml"];
  }
  delete data["?xml"];
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
