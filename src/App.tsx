import React from "react";
import "./App.css";
import Superform from "./features/superform/Superform";
import { Box } from "@mui/material";

function App() {
  return (
    <div className="App">
      <Box
        // maxWidth={1200}
        marginLeft={10}
        marginRight={10}
        marginTop={10}
      >
        <Superform />
      </Box>
    </div>
  );
}

export default App;
