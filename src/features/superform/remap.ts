export const remap = [
  {
    to: "$.Registry.Supplies.Supply[0]",
    prepend: {
      "FundingRequestNumber": "",
      "FundingRequestAmount": "",
      "FundingFirstAmount": "",
      "FundingRequestDate": "",
      "FundingFirstDat": "",
    }
  },
  {
    from: "$.Registry.Supplies.Supply[0].Provider",
    to: '$.Registry'
  },
]

export const required = [
  '$.Registry.Supplies.Supply[*].FundingRequestNumber',
  '$.Registry.Supplies.Supply[*].FundingRequestAmount',
  '$.Registry.Supplies.Supply[*].FundingFirstAmount',
  '$.Registry.Supplies.Supply[*].FundingRequestDate',
  '$.Registry.Supplies.Supply[*].FundingFirstDat',
]