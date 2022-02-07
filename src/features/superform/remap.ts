export const remap = [
  {
    to: "$...Supply[*]",
    prepend: {
      "FundingRequestNumber": "",
      "FundingRequestAmount": "",
      "FundingFirstAmount": "",
      "FundingRequestDate": "",
      "FundingFirstDat": "",
    }
  },
  {
    from: "$...Supply[0].Provider",
    to: '$.'
  },
]