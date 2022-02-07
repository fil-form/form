import React from "react";
import "./App.css";
import Superform from "./features/superform/Superform";
import { Box } from "@mui/material";

function App() {
  return (
    <div className="App">
      <Box
        // maxWidth={1200}
        margin={5}
      >
        <Superform />
      </Box>
    </div>
  );
}

export default App;
