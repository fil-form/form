import React from "react";
import "./App.css";
import Form from "./features/superform/Form";
import { Box } from "@mui/material";

function App() {
  return (
    <div className="App">
      <Box
        // maxWidth={1200}
        margin={2}
      >
        <Form />
      </Box>
    </div>
  );
}

export default App;
