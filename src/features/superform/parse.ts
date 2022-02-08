import { Data } from "./formSlicer";
const { XMLParser } = require("fast-xml-parser");
const { JSONPath } = require("jsonpath-plus");
const pointer = require("json-pointer");

const lists = [
  "Register.Supplies.Supply",
  "Register.Supplies.Supply.Documents.Document",
  "TransferRegisterXml.Supplies.Supply.Documents.Document",
  "TransferRegisterXml.Supplies.Supply.Documents.Document",
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

const toMove = ["Buyer", "Factor", "Provider", "SupplyAgreement", "FactoringAgreement"];

export const schema = [
  "$.Register.RegisterTemplateCode",
  "$.Register.ProcessTemplateCode",
  "$.Register.RegisterStartDate",
  "$.Register.RegisterEndDate",
  "$.Register.ExtraInfo",
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
  "$.Register.Supplies.Supply[*].Buyer.Code",
  "$.Register.Supplies.Supply[*].Buyer.INN",
  "$.Register.Supplies.Supply[*].Buyer.KPP",
  "$.Register.Supplies.Supply[*].Buyer.Name",
  "$.Register.Supplies.Supply[*].Provider.Code",
  "$.Register.Supplies.Supply[*].Provider.Name",
  "$.Register.Supplies.Supply[*].Provider.INN",
  "$.Register.Supplies.Supply[*].Provider.KPP",
  "$.Register.Supplies.Supply[*].Factor.Code",
  "$.Register.Supplies.Supply[*].Factor.Name",
  "$.Register.Supplies.Supply[*].Factor.INN",
  "$.Register.Supplies.Supply[*].Factor.KPP",
  "$.Register.Supplies.Supply[*].SupplyAgreement.Code",
  "$.Register.Supplies.Supply[*].SupplyAgreement.Number",
  "$.Register.Supplies.Supply[*].SupplyAgreement.Date",
  "$.Register.Supplies.Supply[*].FactoringAgreement.Code",
  "$.Register.Supplies.Supply[*].FactoringAgreement.Number",
  "$.Register.Supplies.Supply[*].FactoringAgreement.Date",
  "$.Register.Supplies.Supply[*].Documents.Document[*].Code",
  "$.Register.Supplies.Supply[*].Documents.Document[*].Date",
  "$.Register.Supplies.Supply[*].Documents.Document[*].Number",
  "$.Register.Supplies.Supply[*].Documents.Document[*].DocAmount",
  "$.Register.Supplies.Supply[*].Documents.Document[*].DocVat",
  "$.Register.Supplies.Supply[*].Documents.Document[*].DocAmountWithVat",
];

export const extraFields = [
  {
    p: "$.Register.Supplies.Supply[*]",
    fields: [
      // "SupplyNumber",
      "FundingRequestNumber",
      "FundingRequestAmount",
      "FundingFirstAmount",
      "FundingRequestDate",
      "FundingFirstDate",
    ],
  },
  {
    p: "$.Register",
    fields: [
      ["RegisterTemplateCode", "ReesterFundedSupply"],
      ["ProcessTemplateCode", "FundedCessionsProcess"],
    ],
  },
];

export const renameValues = [
  {
    p: "$.Register.Supplies.Supply[*].Number",
    to: "SupplyNumber",
  },
];

const supplyRequired = [
  "FundingRequestNumber",
  "FundingRequestAmount",
  "FundingFirstAmount",
  "FundingRequestDate",
  "FundingFirstDate",
  // "SupplyNumber",
].join(",");

function moveToSupply<T>(data: T) {
  const pt = pointer(data);
  JSONPath({
    path: "$.Register.Supplies.Supply[*]",
    json: data,
    callback: (ee: any, b: any, c: any) => {
      const po = JSONPath.toPointer(JSONPath.toPathArray(c.path));
      toMove.forEach((move) => {
        if (pt.has(`/Register/${move}`) && !pt.has(`${po}/${move}`)) {
          pt.set(`${po}/${move}`, pt.get(`/Register/${move}`));
        }
      });
    },
  });
}

function addExtraFields<T>(data: T) {
  const pt = pointer(data);
  extraFields.forEach((e) => {
    JSONPath({
      path: e.p,
      json: data,
      callback: (ee: any, b: any, c: any) => {
        const po = JSONPath.toPointer(JSONPath.toPathArray(c.path));
        e.fields.forEach((field: string | string[]) => {
          const [f, v] = typeof field == "string" ? [field, ""] : field;
          const pp = `${po}/${f}`;
          if (!pt.has(pp)) {
            pt.set(pp, v);
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

export function findEmpty<T>(data: T) {
  const empty = new Set<string>();
  JSONPath({
    path: `$..Supplies.Supply[*][${supplyRequired}]`,
    json: data,
    callback: (e: any, b: any, c: any) => {
      if (c.value === "") {
        empty.add(JSONPath.toPointer(JSONPath.toPathArray(c.path)));
      }
    },
  });
  return empty;
}

export function rename<T>(data: T) {
  renameValues.forEach(({ p, to }) => {
    JSONPath({
      path: p,
      json: data,
      callback: (e: any, b: any, c: any) => {
        console.log(c);
        if (!c.parent[to]) {
          c.parent[to] = c.value;
          delete c.parent[c.parentProperty];
        }
      },
    });
  });
}

export default function parse(xml: string | null) {
  if (!xml) return {} as Data;
  const data: Data = parser.parse(xml);
  if (!data["Register"]) {
    data["Register"] = data["TransferRegisterXml"];
    delete data["TransferRegisterXml"];
  }
  delete data["?xml"];

  // rename(data);
  addExtraFields(data);
  moveToSupply(data);
  return fitToSchema(data);
}
