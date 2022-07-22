import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Apis, baseURL, supabase } from "../../Api";

import HeaderIcon from "../../assets/app_image.png";

function RegisterPage(props: any) {
  const history = useHistory();
  const [RegisterData, setRegisterData] = useState({
    email: "",
    Fname: "",
    Lname: "",
    date: "",
    pword: "",
    cpword: "",
    invitecode: "",
  });

  const inputFormData = (e: any) => {
    setRegisterData({ ...RegisterData, [e.target.name]: e.target.value });
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar("Register Success", { variant });
  };

  const RegisterForm = async () => {
    // RegisterData.pword &&
    // RegisterData.cpword &&
    // RegisterData.invitecode
    if (
      RegisterData.email &&
      RegisterData.Fname &&
      RegisterData.Lname &&
      RegisterData.date &&
      RegisterData.pword
    ) {
      await supabase.auth.signUp(
        {
          email: RegisterData.email,
          password: RegisterData.pword,
        },
        {
          redirectTo: window.location.origin,
          data: {
            fullname: RegisterData.Fname + " " + RegisterData.Lname,
            Dob: RegisterData.date,
          },
        }
      );
      //   const info = {
      //     fullName: `${RegisterData.Fname + " " + RegisterData.Lname}`,
      //     email: RegisterData.email,
      //     password: RegisterData.pword,
      //     dob: RegisterData.date,
      //     inviteCode: RegisterData.invitecode,
      //   };
      //   await axios
      //     .post(Apis.Register, { ...info })
      //     .then(function (response) {
      //       console.log(response);
      //       handleClickVariant("success");
      //       history.push("/Login");
      //     })
      //     .catch(function (error) {
      //       console.log(error);
      //     });
    }
  };

  return (
    <Grid className="d-flex flex-column  justify-content-center align-items-center px-4">
      <Grid
        // container
        // direction="column"
        // alignItems="center"
        // justifyContent="center"
        xs={12}
        sm={12}
        md={4}
      >
        <Grid xs={12} className="">
          <img src={HeaderIcon} alt="header_logo" style={{ width: "10rem" }} />
          <Typography
            className="pb-3"
            style={{
              fontSize: "36.54px",
              fontWeight: 550,
              lineHeight: "43.3px",
              color: "#434343",
            }}
          >
            Playground
          </Typography>
        </Grid>
        <Grid xs={12} className="pb-2">
          <TextField
            id="filled-search"
            label="Email"
            type="email"
            className="w-100"
            variant="outlined"
            size="small"
            name="email"
            value={RegisterData.email}
            onChange={inputFormData}
          />
        </Grid>
        <Grid container className=" pb-2">
          <Grid xs={6} className="pr-1">
            <TextField
              id="filled-search"
              label="First Name"
              type="string"
              className="w-100"
              variant="outlined"
              size="small"
              name="Fname"
              value={RegisterData.Fname}
              autoComplete="off"
              onChange={inputFormData}
            />
          </Grid>
          <Grid xs={6} className="pl-1">
            <TextField
              id="filled-search"
              label="Last Name"
              type="string"
              className="w-100"
              variant="outlined"
              size="small"
              name="Lname"
              value={RegisterData.Lname}
              autoComplete="off"
              onChange={inputFormData}
            />
          </Grid>
        </Grid>
        <Grid xs={12} className="pb-2">
          <TextField
            id="filled-search"
            // label="Email"
            type="date"
            className="w-100"
            variant="outlined"
            size="small"
            name="date"
            value={RegisterData.date}
            autoComplete="off"
            onChange={inputFormData}
          />
        </Grid>
        <Grid xs={12} className="pb-2">
          <TextField
            id="filled-search"
            label="Password"
            type="password"
            className="w-100"
            variant="outlined"
            size="small"
            name="pword"
            value={RegisterData.pword}
            autoComplete="off"
            onChange={inputFormData}
          />
        </Grid>
        {/*<Grid xs={12} className="pb-2">
          <TextField
            id="filled-search"
            label="Confirm Password"
            type="password"
            className="w-100"
            variant="outlined"
            size="small"
            name="cpword"
            autoComplete="off"
            onChange={inputFormData}
          />
        </Grid>
        <Grid xs={12} className="pb-2">
          <TextField
            id="filled-search"
            label="Invite Code"
            type="string"
            className="w-100"
            variant="outlined"
            size="small"
            name="invitecode"
            autoComplete="off"
            onChange={inputFormData}
          />
        </Grid> */}
        {/* <Grid xs={12}></Grid>
        <Grid xs={12}></Grid> */}
        <Box className="mt-3">
          <Button
            variant="contained"
            size="small"
            className="w-20"
            onClick={RegisterForm}
          >
            <span className="text-capitalize text-sm">Register</span>
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default RegisterPage;
