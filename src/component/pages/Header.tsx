import {
  Box,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Typography,
} from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Header_logo from "../../assets/header_logo.png";

import Header_icon from "../../assets/app_image.png";
import "./Header.scss";
// import { useNavigate } from "react-router-dom";

function Header() {
  //   const navigate = useNavigate();
  return (
    <Grid container className="align-items-center py-2 px-5">
      <Grid xs={12} md={6} className="d-flex justify-items-start">
        <img src={Header_logo} className="Header_logo" alt="Header_logo" />
      </Grid>
      <Grid xs={12} md={6} className="d-flex justify-content-end">
        <Box className="d-flex align-items-center">
          <Typography className="pr-4">
            {moment().format("LT")} <span className="px-1">&#8226;</span>
            {moment().format("dddd, MMMM DD")}
          </Typography>
          <Button
            variant="outlined"
            style={{ textTransform: "inherit", color: "#949494" }}
            // onClick={() => navigate("/Loginoption")}
            startIcon={
              <img
                src={Header_icon}
                style={{ width: "20px" }}
                alt="Header_logo"
              />
            }
          >
            Login to view insight
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Header;
