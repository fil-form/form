import { changeValue, pathType } from "./formSlicer";
import { useAppDispatch } from "../../app/hooks";
import { Accordion, AccordionSummary, Grid, TextField } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

interface FieldProps<T> {
  name: string;
  data: T;
  p: pathType;
}

function Field<T>({ name, data, p }: FieldProps<T>) {
  const dispatch = useAppDispatch();
  console.log(`name ${name} path ${p}`)
  return (
    <TextField
      label={name}
      defaultValue={data}
      fullWidth
      onBlur={(t) => {
        dispatch(
          changeValue({ p: (["$"] as pathType).concat(p), v: t.target.value })
        );
      }}
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
    // console.log(p.toString());
    yield (
      <Grid item xs={12} sm={p.length < 4 ? 6: 12} md={p.length < 4 ? 4: 12} lg={p.length < 4 ? 3: 6} >
        <Field name={name || ""} data={data} p={p} />
      </Grid>
    );
  } else if (Array.isArray(data)) {
    yield (
      <Grid item xs={12} md={p.length > 1 && p.length < 4 ? 6 : 12}>
        <Accordion sx={{ padding: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {p[p.length - 2]}
          </AccordionSummary>
          <Grid container spacing={2}>
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
      yield (
        <Grid item xs={12} md={p.length > 1 && p.length < 4 ? 6 : 12}>
          <Accordion sx={{ padding: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {name || p[p.length - 1]}
            </AccordionSummary>
            <Grid container spacing={2}>
              {Object.entries(data).reduce((a, b, i) => {
                const [n, v] = b;
                // console.log(`make ${n} with path ${p}`);
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
