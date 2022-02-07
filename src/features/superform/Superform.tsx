import { Button, Stack, styled } from "@mui/material";
import { applyXML, Data } from "./formSlicer";
import { useAppDispatch } from "../../app/hooks";
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

function getXml(data: Data) {
  const element = document.createElement("a");
  const file = new Blob(
    ['<?xml version="1.0" encoding="UTF-8"?>\n', builder.build(data)],
    {
      type: "text/plain",
    }
  );
  element.href = URL.createObjectURL(file);
  element.download = "res.xml";
  document.body.appendChild(element);
  element.click();
}

export default function Superform() {
  const [dataXML, setDataXML] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const handleFile = (t: ChangeEvent<HTMLInputElement>) => {
    const files = t.target.files;
    if (files) {
      const file = files[0];
      if (file) {
        file.text().then((t) => {
          setDataXML(t);
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
    <Stack direction={"column"} spacing={2}>
      <Stack direction={"row"} spacing={2}>
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
        <Button variant="contained" onClick={() => getXml(data)}>
          Результат
        </Button>
      </Stack>
      {Array.from(makeCell(data))}
    </Stack>
  );
}
