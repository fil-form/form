import { Grid, TextField } from "@mui/material";
import { perc, setSyncValue, syncPrefix } from "./formSlicer";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PercentageInput } from "./NumberField";

interface SyncFieldProps {
  p: string;
  modifier?: (v: string) => string;
}

export function HeaderItem(p: { children: JSX.Element[] | JSX.Element }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={2}>
      {p.children}
    </Grid>
  );
}

export function SyncField(p: SyncFieldProps) {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.form.syncValues[p.p]);
  const label = p.p.split(".").pop();
  return (
    <HeaderItem>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(t) => {
          dispatch(
            setSyncValue({
              p: p.p,
              v: t.target.value,
            })
          );
        }}
        defaultValue={""}
      />
    </HeaderItem>
  );
}

export function SyncRequestNumber(p: {}) {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.form.prefix);
  return (
    <HeaderItem>
      <TextField
        fullWidth
        value={value}
        label={"RequestNumberPrefix"}
        onChange={(t) => {
          dispatch(syncPrefix(t.target.value));
        }}
        defaultValue={""}
      />
    </HeaderItem>
  );
}

export function SyncPercent(p: {}) {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.form.perc);
  return (
    <HeaderItem>
      <PercentageInput
        fullWidth
        value={value}
        label={"Процент от CessionAmount"}
        onChange={(t) => {
          dispatch(perc(Number.parseFloat(t.target.value)));
        }}
      />
    </HeaderItem>
  );
}
