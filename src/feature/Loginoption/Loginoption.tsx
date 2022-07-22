import { Box, Button, Divider, Grid, Typography } from "@material-ui/core";
import React from "react";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import HeaderIcon from "../../assets/app_image.png";
import { useHistory } from "react-router-dom";

function Loginoption(props: any) {
  const history = useHistory();
  return (
    <Grid
      xs={12}
      className="d-flex justify-content-center align-items-center flex-column h-100"
    >
      {/* <Box className="flex flex-col justify-center items-center"> */}
      <img src={HeaderIcon} alt="header_logo" style={{ width: "10rem" }} />
      <Typography
        style={{
          fontSize: "36.54px",
          fontWeight: 550,
          lineHeight: "43.3px",
          color: "#434343",
        }}
      >
        Playground
      </Typography>
      <Typography
        style={{
          fontSize: "16.54px",
          fontWeight: 400,
          lineHeight: "43.3px",
          color: "#434343",
        }}
      >
        Know Yourself, Better
      </Typography>
      {/* </Box> */}
      <Divider className="w-75 mx-auto" />
      <Box className="my-4">
        <Button
          variant="contained"
          size="small"
          className="w-100"
          onClick={() => history.push("/Register")}
        >
          <span className="text-capitalize">Register</span>
        </Button>
      </Box>
      <Box>
        <Button
          variant="contained"
          size="small"
          className="w-100"
          onClick={() => history.push("/Login")}
        >
          <span className="text-capitalize">Login</span>
        </Button>
      </Box>
    </Grid>
  );
}

export default Loginoption;