import { Data } from "./formSlicer";
const { XMLParser } = require("fast-xml-parser");
const { JSONPath } = require("jsonpath-plus");
const pointer = require("json-pointer");

const lists = [
  "TransferRegisterXml.Supplies.Supply",
  "TransferRegisterXml.Supplies.Supply.Documents.Document",
  "Register.Supplies.Supply",
  "Register.Supplies.Supply.Documents.Document",
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

  // move Provider
  JSONPath({
    path: "$.Register.Supplies.Supply[0].Provider",
    json: data,
    callback: (e: any, b: any, c: any) => {
      // @ts-ignore
      data["Register"]["Provider"] = c.value;
      delete c.parent[c.parentProperty];
    },
  });

  // move SupplyAgreement
  JSONPath({
    path: "$.Register.Supplies.Supply[0].SupplyAgreement",
    json: data,
    callback: (e: any, b: any, c: any) => {
      // @ts-ignore
      data["Register"]["SupplyAgreement"] = c.value;
      delete c.parent[c.parentProperty];
    },
  });

  // add Supply fields
  JSONPath({
    path: "$.Register.Supplies.Supply[0].SupplyAgreement",
    json: data,
    callback: (e: any, b: any, c: any) => {
      // @ts-ignore
      data["Register"]["SupplyAgreement"] = c.value;
      delete c.parent[c.parentProperty];
    },
  });

  addExtraFields(data);

  return fitToSchema(data);
}

function addExtraFields<T>(data: T) {
  const pt = pointer(data);
  extraFields.forEach((e) => {
    JSONPath({
      path: e.p,
      json: data,
      callback: (ee: any, b: any, c: any) => {
        const po = JSONPath.toPointer(JSONPath.toPathArray(c.path));
        e.fields.forEach((field) => {
          const pp = `${po}/${field}`;
          if (!pt.has(pp)) {
            pt.set(pp, "");
          }
        });
      },
    });
  });
}

function fitToSchema<T>(data: T) {
  const newData = {};
  const pt = pointer(newData);
  schema.forEach((p) => {
    const ret = JSONPath({
      path: p,
      json: data,
      callback: (e: any, b: any, c: any) => {
        const po = JSONPath.toPointer(JSONPath.toPathArray(c.path));
        pt.set(po, c.value);
      },
    });
    if (ret.length === 0) {
      console.log(`${p} is empty`);
    }
  });
  return newData;
}

export const remap = [
  {
    to: "$.Registry.Supplies.Supply[0]",
    prepend: {
      FundingRequestNumber: "",
      FundingRequestAmount: "",
      FundingFirstAmount: "",
      FundingRequestDate: "",
      FundingFirstDat: "",
    },
  },
  {
    from: "$.Registry.Supplies.Supply[0].Provider",
    to: "$.Registry",
  },
];

export const schema = [
  "$.Register.RegisterTemplateCode",
  "$.Register.ProcessTemplateCode",
  "$.Register.RegisterStartDate",
  "$.Register.RegisterEndDate",
  "$.Register.Buyer.Code",
  "$.Register.Buyer.INN",
  "$.Register.Buyer.KPP",
  "$.Register.Buyer.Name",
  "$.Register.Provider.Code",
  "$.Register.Provider.Name",
  "$.Register.Provider.INN",
  "$.Register.Provider.KPP",
  "$.Register.Factor.Code",
  "$.Register.Factor.Name",
  "$.Register.Factor.INN",
  "$.Register.Factor.KPP",
  "$.Register.SupplyAgreement.Code",
  "$.Register.SupplyAgreement.Number",
  "$.Register.SupplyAgreement.Date",
  "$.Register.FactoringAgreement.Code",
  "$.Register.FactoringAgreement.Number",
  "$.Register.FactoringAgreement.Date",
  "$.Register.Supplies.Supply[*].SupplyNumber",
  "$.Register.Supplies.Supply[*].AdditionalSupplyNumber",
  "$.Register.Supplies.Supply[*].CessionNumber",
  "$.Register.Supplies.Supply[*].FundingRequestNumber",
  "$.Register.Supplies.Supply[*].Amount",
  "$.Register.Supplies.Supply[*].Vat",
  "$.Register.Supplies.Supply[*].AmountWithVat",
  "$.Register.Supplies.Supply[*].CessionAmount",
  "$.Register.Supplies.Supply[*].FundingRequestAmount",
  "$.Register.Supplies.Supply[*].FundingFirstAmount",
  "$.Register.Supplies.Supply[*].FundingRequestDate",
  "$.Register.Supplies.Supply[*].FundingFirstDate",
  "$.Register.Supplies.Supply[*].Documents.Document[*].Code",
  "$.Register.Supplies.Supply[*].Documents.Document[*].Date",
  "$.Register.Supplies.Supply[*].Documents.Document[*].Number",
  "$.Register.Supplies.Supply[*].Documents.Document[*].DocAmount",
  "$.Register.Supplies.Supply[*].Documents.Document[*].DocVat",
  "$.Register.Supplies.Supply[*].Documents.Document[*].DocAmountWithVat",
  "$.Register.ExtraInfo",
];

export const extraFields = [
  {
    p: "$.Register.Supplies.Supply[*]",
    fields: [
      "FundingRequestNumber",
      "FundingRequestAmount",
      "FundingFirstAmount",
      "FundingRequestDate",
      "FundingFirstDat",
    ],
  },
];
