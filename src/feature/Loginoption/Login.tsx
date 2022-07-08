import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import HeaderIcon from "../../assets/app_image.png";

function Loginpage(props: any) {
  const history = useHistory();
  const [emailData, setemailData] = useState("");
  const [passwordData, setpasswordData] = useState("");
  const [emailValidate, setemailValidate] = useState(false);
  const [passwordValidation, setpasswordValidation] = useState(false);

  useEffect(() => {
    setemailValidate(false);
  }, [emailData]);

  useEffect(() => {
    setpasswordValidation(false);
  }, [passwordData]); /*  */

  function validatePassword(newPassword: string) {
    var minNumberofChars = 6;
    var maxNumberofChars = 16;
    var regularExpression = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (!regularExpression.test(newPassword)) {
      return "password should contain atleast one number and one special character";
    } else if (
      newPassword.length < minNumberofChars ||
      newPassword.length > maxNumberofChars
    ) {
      return "Your password must be at least 8 characters";
    } else {
      return true;
    }
  }

  const LoginData = () => {
    if (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailData) &&
      validatePassword(passwordData)
    ) {
      history.push("/");
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailData) &&
      !passwordData
    ) {
      setemailValidate(true);
      setpasswordValidation(true);
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailData)
    ) {
      setemailValidate(true);
    }
    if (!passwordData || !validatePassword(passwordData)) {
      setpasswordValidation(true);
      var pdata = validatePassword(passwordData);
    }
  };

  return (
    <Grid container>
      <Grid
        xs={12}
        className="d-flex flex-column justify-content-center align-items-center"
      >
        <img src={HeaderIcon} alt="header_logo" style={{ width: "10rem" }} />
        <Typography
          className="pb-5"
          style={{
            fontSize: "3.54rem",
            lineHeight: "43.3px",
            color: "#434343",
          }}
        >
          Playground
        </Typography>
        <TextField
          error={emailValidate ? true : false}
          id="filled-search"
          label="Email"
          type="string"
          style={{ paddingBottom: "20px" }}
          className="w-72"
          variant="outlined"
          size="small"
          autoComplete="off"
          onChange={(e) => setemailData(e.target.value)}
        />
        <TextField
          error={passwordValidation ? true : false}
          size="small"
          style={{ paddingBottom: "20px" }}
          type="password"
          className="w-72"
          variant="outlined"
          label="Password"
          autoComplete="off"
          onChange={(e) => setpasswordData(e.target.value)}
          // InputProps={{
          //   endAdornment: (
          //     <InputAdornment position="end">
          //       <IconButton>
          //         {true ? <VisibilityOff /> : <Visibility />}
          //       </IconButton>
          //     </InputAdornment>
          //   ),
          // }}
          // helperText={
          //   passwordValidation ? "password must be in between 6 to 10" : false
          // }
        />
        <Box>
          <Button
            variant="contained"
            size="small"
            className="w-20"
            onClick={LoginData}
          >
            <span className="text-capitalize">Login</span>
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Loginpage;
