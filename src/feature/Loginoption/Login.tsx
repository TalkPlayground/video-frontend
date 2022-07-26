import {
  Box,
  Button,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useStytch } from "@stytch/stytch-react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Apis, baseURL, supabase } from "../../Api";

import HeaderIcon from "../../assets/app_image.png";

const useStyles = makeStyles({
  root: {
    color: "rgb(73, 76, 226)",
    cursor: "pointer",
    "&:hover": {
      color: "rgb(73, 76, 226)",
      textDecoration: "underline",
    },
  },
});

function Loginpage(props: any) {
  const history = useHistory();
  const classes = useStyles();
  const { setUserInfo, setLoginOrNot } = props;
  const [email, setemailData] = useState("");
  const [passwordData, setpasswordData] = useState("");
  const [emailValidate, setemailValidate] = useState(false);
  const [passwordValidation, setpasswordValidation] = useState(false);
  const [IsError, setIsError] = useState(false);
  const [SendingEmail, setSendingEmail] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setemailValidate(false);
  }, [email]);

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

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar("Logged In", { variant });
  };

  const LoginData = async () => {
    if (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
      // &&
      // validatePassword(passwordData)
    ) {
      const user = await supabase.auth.signIn(
        { email },
        {
          shouldCreateUser: false,
          redirectTo: window.location.origin,
        }
      );
      console.log("daata", user);
      if (user.error?.message) {
        setIsError(true);
      } else {
        enqueueSnackbar(`Email Sended`, { variant: "success" });
        setSendingEmail(true);
      }
      // const info = {
      //   username: email,
      //   password: passwordData,
      // };
      // await axios
      //   .post("/api/v1/user/login", { ...info })
      //   .then(function (response) {
      //     console.log(response);
      //     localStorage.setItem("accessToken", response.data.data.accessToken);
      //     // var decoded = jwt_decode(response.data.data.accessToken);
      //     // setUserInfo(decoded);
      //     setLoginOrNot(true);
      //     handleClickVariant("success");
      //     history.push("/");
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) &&
      !passwordData
    ) {
      setemailValidate(true);
      setpasswordValidation(true);
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
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
        {!IsError && !SendingEmail ? (
          <>
            <TextField
              error={emailValidate ? true : false}
              id="filled-search"
              label="Email"
              type="email"
              style={{ paddingBottom: "20px" }}
              className="w-72"
              variant="outlined"
              size="small"
              autoComplete="off"
              onChange={(e) => setemailData(e.target.value)}
            />

            <Box>
              <Button
                variant="contained"
                size="small"
                className="w-20"
                onClick={LoginData}
              >
                <span className="text-capitalize">Send Email</span>
              </Button>
            </Box>
          </>
        ) : IsError ? (
          <>
            <Button
              color="primary"
              size="small"
              className="mb-3 px-3"
              style={{ borderRadius: "50px" }}
              variant="contained"
              onClick={() => setIsError(false)}
            >
              <span className="text-capitalize">Send Email Again</span>
            </Button>
            <span
              // style={{ color: "rgb(73, 76, 226)", cursor: "pointer" }}
              className={classes.root}
              // href="/Register"
              onClick={() => history.push("/Register")}
            >
              Don't have an Account? Sign up
            </span>
          </>
        ) : SendingEmail ? (
          <>
            <img
              src="https://c.tenor.com/0ceXa2Dg8ywAAAAC/email-sent.gif"
              height={200}
            />
          </>
        ) : null}
      </Grid>
    </Grid>
  );
}

export default Loginpage;

{
  /* <TextField
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
        /> */
}
