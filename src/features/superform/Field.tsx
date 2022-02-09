import { changeValue, pathType } from "./formSlicer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Accordion, AccordionSummary, Grid, TextField } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
const { JSONPath } = require("jsonpath-plus");
const pointer = require("json-pointer");

interface FieldProps<T> {
  name: string;
  data: T;
  p: pathType;
}

function Field<T>({ name, p }: FieldProps<T>) {
  const dispatch = useAppDispatch();
  const pp = (["$"] as pathType).concat(p);
  const po = JSONPath.toPointer(pp);
  const value = useAppSelector((state) => {
    const pt = pointer(state.form.data);
    if (pt.has(po)) {
      return pointer(state.form.data).get(po);
    } else return "";
  });

  const isEmpty = useAppSelector((state) => state.form.empty.indexOf(po) >= 0);
  return (
    <TextField
      label={name}
      value={value}
      fullWidth
      onChange={(t) => {
        dispatch(changeValue({ p: pp, v: t.target.value }));
      }}
      error={isEmpty}
      helperText={isEmpty ? "Обязательное поле" : ""}
    />
  );
}

export function* makeCell<T>(
  data: T,
  path?: pathType,
  name?: string
): Generator<JSX.Element> {
  const p = name ? (path || []).concat([name]) : path || [];

  if (typeof data == "string" || typeof data == "number") {
    yield (
      <Grid
        item
        xs={12}
        sm={p.length < 4 ? 6 : 12}
        md={p.length < 4 ? 4 : 12}
        lg={p.length < 4 ? 3 : 6}
        key={JSONPath.toPointer(p)}
      >
        <Field name={name || ""} data={data} p={p} />
      </Grid>
    );
  } else if (Array.isArray(data)) {
    const accName = p[p.length - 2];
    yield (
      <Grid
        item
        xs={12}
        md={p.length > 1 && p.length < 4 && accName !== "Supplies" ? 6 : 12}
        key={JSONPath.toPointer(p)}
      >
        <Accordion sx={{ padding: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {accName}
          </AccordionSummary>
          <Grid container spacing={1}>
            {data.reduce(
              (a, b, i) =>
                a.concat(Array.from(makeCell(b, p.concat([i] as pathType)))),
              []
            )}
          </Grid>
        </Accordion>
      </Grid>
    );
  } else {
    if (Object.keys(data).length === 1) {
      const [n, v] = Object.entries(data)[0];
      yield* makeCell(v, p, n);
    } else {
      const accName = name || p[p.length - 1];
      yield (
        <Grid
          item
          xs={12}
          md={p.length > 1 && p.length < 7 ? 6 : 12}
          key={JSONPath.toPointer(p)}
        >
          <Accordion sx={{ padding: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {accName}
            </AccordionSummary>
            <Grid container spacing={1}>
              {Object.entries(data).reduce((a, b) => {
                const [n, v] = b;
                const next = Array.from(makeCell(v, p, n));
                // @ts-ignore
                return a.concat(next);
              }, [])}
            </Grid>
          </Accordion>
        </Grid>
      );
    }
  }
}
