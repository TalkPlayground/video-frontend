import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Header_logo from "../../assets/header_logo.png";

import Header_icon from "../../assets/app_image.png";
import "./index.scss";
import { useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { useSnackbar } from "notistack";
// import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { supabase } from "../../Api";

function Header({ UserInfo, setisLoginOrNot }: any) {
  const history = useHistory();
  const [LoginOrNot, setLoginOrNot] = useState(false);

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    if (LoginOrNot) {
      setAnchorEl(event.currentTarget);
    } else {
      history.push("/Loginoption");
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { enqueueSnackbar } = useSnackbar();

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (accessToken) {
      var decoded = jwt_decode(accessToken);
      if (decoded) {
        setLoginOrNot(true);
      }
    }
  }, [UserInfo, accessToken]);

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar("Logout successfully", { variant });
  };

  const Loggedout = async () => {
    localStorage.removeItem("accessToken");
    await supabase.auth.signOut();
    // setisLoginOrNot(false);
    setLoginOrNot(false);
    setAnchorEl(null);
    handleClickVariant("success");
  };

  const getProfile = async (info: any) => {
    try {
      setLoading(true);

      var { data, error, status } = await supabase
        .from("users")
        .select(`username, website, avatar_url`)
        .eq("id", info?.id)
        .single();
      console.log("user?.id", data, info?.id);
      if (error && status !== 406) {
        throw error;
      }

      console.log("first");
      if (data) {
        console.log("DDD", data);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      // alert(error.message);
    } finally {
      console.log("first======");
      setLoading(false);
    }
  };

  useEffect(() => {
    // if (user) {
    //   setLoginOrNot(true);
    //   getProfile(user);
    // }
    // async function getdata() {
    // const { user, error } = await supabase.auth.api.getUser(
    //   "ACCESS_TOKEN_JWT"
    // );
    const user = supabase.auth.user();
    const session = supabase.auth.session();
    console.log("ssee", session, user);
    if (user) {
      // const user = supabase.auth.api.getUser(session.access_token);
      setLoginOrNot(true);
    } else {
      supabase.auth.signOut();
      setLoginOrNot(false);
    }

    // }

    // getdata();
  });

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
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            // onClick={() =>
            //   accessToken ? Loggedout() : history.push("/Loginoption")
            // }
            onClick={handleClick}
            startIcon={
              <img
                src={Header_icon}
                style={{ width: "20px" }}
                alt="Header_logo"
              />
            }
          >
            <span className={LoginOrNot ? "text-capitalize" : ""}>
              {LoginOrNot ? `Logged In` : "Login to view insight"}
            </span>
          </Button>

          {/* <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            Dashboard
          </Button> */}
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            style={{ marginTop: "2.5em" }}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            {/* <MenuItem onClick={handleClose}>Logout</MenuItem> */}
            <MenuItem className="mx-1" onClick={Loggedout} disableRipple>
              <LogoutIcon style={{ marginRight: "10px", fontSize: "20px" }} />
              <span style={{ fontSize: ".9rem" }}>Logout</span>
            </MenuItem>
          </Menu>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Header;
