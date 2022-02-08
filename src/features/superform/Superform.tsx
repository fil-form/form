import { Button, Stack, styled,  TextField} from "@mui/material";
import { applyXML, Data, perc } from "./formSlicer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import React, { ChangeEvent, useEffect, useState } from "react";
import parse from "./parse";
import { makeCell } from "./Field";

const { XMLBuilder } = require("fast-xml-parser");
const builder = new XMLBuilder({
  format: true,
});

const Input = styled("input")({
  display: "none",
});

function getXml(data: Data, name: string, empty: string[]) {
  if (empty.length > 0) {
    if (
      !window.confirm(
        `Есть незаполненные поля: \n${empty.join("\n")}\nПродолжить?`
      )
    ) {
      return;
    }
  }
  const element = document.createElement("a");
  const file = new Blob(
    ['<?xml version="1.0" encoding="UTF-8"?>\n', builder.build(data)],
    {
      type: "text/plain",
    }
  );
  element.href = URL.createObjectURL(file);
  element.download = name;
  document.body.appendChild(element);
  element.click();
}

function GetXml(p: { name: string }) {
  const data = useAppSelector((state) => state.form.data);
  const empty = useAppSelector((state) => state.form.empty);

  return (
    <Button
      variant="contained"
      onClick={() => getXml(data, "out-" + p.name || "res.xml", empty)}
    >
      Результат
    </Button>
  );
}

export default function Superform() {
  const [[name, dataXML], setDataXML] = useState<
    [string, string] | [null, null]
  >([null, null]);
  const dispatch = useAppDispatch();

  const handleFile = (t: ChangeEvent<HTMLInputElement>) => {
    const files = t.target.files;
    if (files) {
      const file = files[0];
      if (file) {
        file.text().then((t) => {
          setDataXML([file.name, t]);
        });
      }
    }
  };

  const data = parse(dataXML);

  useEffect(() => {
    if (data) {
      dispatch(applyXML(data));
    }
  }, [data, dispatch]);


  return (
    <Stack direction={"column"} spacing={1.5}>
      <Stack direction={"row"} spacing={1.5}>
        <label htmlFor="contained-button-file">
          <Input
            id="contained-button-file"
            type="file"
            onChange={handleFile}
            accept={".xml"}
          />
          <Button variant="contained" component="span">
            Загрузить XML
          </Button>
        </label>
        <GetXml name={name || "res.xml"} />
        <TextField
          fullWidth
          label={"Процент от CessionAmount"}
          onChange={t=> {
          dispatch(perc(Number.parseFloat(t.target.value)));
        }} defaultValue={1}></TextField>
      </Stack>
      {Array.from(makeCell(data))}
    </Stack>
  );
}
