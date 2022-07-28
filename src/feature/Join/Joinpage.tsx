import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Grid, Typography, Box, makeStyles } from "@material-ui/core";
import { Button, IconButton, Tooltip } from "@mui/material";

import AcUnitIcon from "@mui/icons-material/AcUnit";
import TextField from "@mui/material/TextField";
import SettingsIcon from "@mui/icons-material/Settings";
import Snackbar from "@mui/material/Snackbar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Header from "../../component/pages/Header";
import HeaderIcon from "../../assets/app_image.png";
import { RouteComponentProps } from "react-router-dom";
import { devConfig } from "../../config/dev";
import { generateVideoToken } from "../../utils/util";
import ZoomVideo, { ConnectionState } from "@zoom/videosdk";
import zoomContext from "../../context/zoom-context";
import { ChatClient, MediaStream } from "../../index-types";
import { message, Modal } from "antd";
import produce from "immer";
import LoadingLayer from "../../component/loading-layer";
import "./Joinpage.scss";
import OtpInput from "react-otp-input";
import { transform } from "lodash";
import axios from "axios";
import { Apis, getQueryString, supabase } from "../../Api";
import { useSnackbar } from "notistack";
import { CloseCircleFilled } from "@ant-design/icons";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import DisplayAction from "../redux/actions/DisplayAction";

interface JoinProps extends RouteComponentProps {
  status: string;
  init: any;
  DisplayDataInfo: any;
  setDisplayDataInfo: any;
}

const useStyles = makeStyles((theme) => ({
  root: {
    "&.css-1eqdgzv-MuiPaper-root-MuiSnackbarContent-root": {
      padding: "0px 16px",
      color: "#919499",
      backgroundColor: "#fff",
    },
  },
}));

const Joinpage: React.FunctionComponent<JoinProps> = (props) => {
  const { history, init, setDisplayDataInfo, DisplayDataInfo } = props;
  const [openToast, setopenToast] = useState(false);
  const [nameValidation, setnameValidation] = useState(false);
  const [emailValidate, setemailValidate] = useState(false);
  const [OTP, setOTP] = useState("");

  const classes = useStyles();

  useEffect(() => {
    setTimeout(() => {
      setopenToast(true);
    }, 2000);
  }, []);

  function DisplayNameData(e: any) {
    setDisplayDataInfo({ ...DisplayDataInfo, [e.target.name]: e.target.value });
    setemailValidate(false);
    setnameValidation(false);
  }

  const user = supabase.auth.user();

  useEffect(() => {
    if (user) {
      setDisplayDataInfo({
        Displayname: `${
          user?.user_metadata?.fullname ? user?.user_metadata?.fullname : ""
        }`,
        emailinfo: `${user.email}`,
      });
    }
  }, [user]);

  const [UrlShowJoin, setUrlShowJoin] = useState("true");
  const [UrlCloseID, setUrlCloseID] = useState(0);

  useEffect(() => {
    if (UrlShowJoin === "true") {
      enqueueSnackbar(`${url}`, {
        action,
        variant: "default",
        persist: true,
        preventDuplicate: true,
      });
    }
  }, [UrlShowJoin]);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar("Joined Successfully", { variant });
  };

  const [OpenOTP, setOpenOTP] = useState(false);

  const zmClient = useContext(zoomContext);

  const onSubmitForm = async (type: string) => {
    closeSnackbar(UrlCloseID);
    // init(`abcd123-${DisplayDataInfo.Displayname}-${DisplayDataInfo.emailinfo}`);
    // history.push(`/${type}?topic=${devConfig.topic}${window.location.search}`);
    const info = {
      ...zmClient.getSessionInfo(),
    };
    await axios
      .post(
        "/api/v1/user/session/join" +
          "?" +
          getQueryString({
            name: DisplayDataInfo.Displayname,
            email: DisplayDataInfo.emailinfo,
          })
      )
      .then(function (response) {
        console.log(response);
        handleClickVariant("success");
        // history.push("/Login");
        // init(DisplayDataInfo.Displayname);
        // history.push(
        //   `/${type}?topic=${devConfig.topic}${window.location.search}`
        // );
        localStorage.setItem("UserID", `${response.data.data}`);
        init(`${response.data.data}-${DisplayDataInfo.Displayname}`);
        history.push(
          `/${type}?topic=${devConfig.topic}${window.location.search}`
        );
      })
      .catch(function (error) {
        console.log(error);
        setemailValidate(true);
        setnameValidation(true);
      });
  };

  const onCardClick = () => {
    if (
      DisplayDataInfo.Displayname?.length > 0 &&
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        DisplayDataInfo.emailinfo
      )
    ) {
      setOpenOTP(true);
    } else if (
      DisplayDataInfo.Displayname?.length == 0 &&
      DisplayDataInfo.emailinfo?.length == 0
    ) {
      setemailValidate(true);
      setnameValidation(true);
    } else if (DisplayDataInfo.Displayname?.length == 0) {
      setnameValidation(true);
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        DisplayDataInfo.emailinfo
      ) ||
      DisplayDataInfo.emailinfo?.length == 0
    ) {
      setemailValidate(true);
    }
  };

  const action = (snackbarId: any) => (
    <>
      {setUrlCloseID(snackbarId)}
      <IconButton onClick={() => navigator.clipboard.writeText(url)}>
        <ContentCopyIcon
          style={{ fill: "#919499" }}
          className="cursor-pointer"
        />
      </IconButton>
      <IconButton>
        <CloseCircleFilled
          style={{ fill: "#fff" }}
          className="cursor-pointer"
          onClick={() => {
            closeSnackbar(snackbarId);
            setTimeout(() => {
              setUrlShowJoin(snackbarId);
            }, 500);
          }}
        />
      </IconButton>
    </>
  );

  const url = `${window.location.origin}/video?topic=${devConfig.topic}`;

  return (
    <>
      <Header />
      {/* <Grid xs={8} className="d-flex justify-content-center border rounded"> */}
      <Grid className="d-flex justify-content-center  align-items-center h-75">
        <Grid
          container
          // direction="column"
          // alignItems="center"
          // justifyContent="center"
          className="border rounded pt-5"
          // xs={12}
          sm={12}
          md={8}
        >
          <Grid
            xs={12}
            sm={6}
            md={6}
            className="flex flex-col justify-content-center  align-items-center "
          >
            <img src={HeaderIcon} alt="header_logo" className="Joinpagelogo" />
            <Typography
              style={{
                fontSize: "2.54rem",
                fontWeight: "inherit",
                lineHeight: "43.3px",
                color: "#434343",
              }}
              className="pb-3"
            >
              Playground
            </Typography>
          </Grid>
          {true ? (
            <Grid
              xs={12}
              sm={6}
              md={6}
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ transform: "rotateY(0deg)", transition: ".1s all" }}
            >
              {/* <Box className="d-flex flex-column justify-content-center align-items-center"> */}
              <TextField
                error={nameValidation ? true : false}
                id="filled-search"
                label="Name to display"
                type="string"
                value={DisplayDataInfo.Displayname}
                style={{ paddingBottom: "20px" }}
                className="w-50"
                variant="outlined"
                autoComplete="off"
                size="small"
                name="Displayname"
                onChange={DisplayNameData}
              />
              <TextField
                error={emailValidate ? true : false}
                size="small"
                style={{ paddingBottom: "20px" }}
                type="email"
                className="w-50"
                variant="outlined"
                autoComplete="off"
                label="Email"
                name="emailinfo"
                value={DisplayDataInfo.emailinfo}
                onChange={DisplayNameData}
                disabled={user ? true : false}
              />

              <Button
                id="demo-positioned-button"
                size="small"
                variant="contained"
                className="w-25"
                style={{ backgroundColor: "#494CE2", color: "white" }}
                onClick={() => onSubmitForm("video")}
                // onClick={onCardClick}
              >
                {/* OTP */}Join
              </Button>
            </Grid>
          ) : (
            <Grid
              xs={12}
              md={6}
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ transform: "rotateY(360deg)", transition: ".1s all" }}
            >
              <h2 className="lebalOTP">
                <span>OTP</span>
              </h2>
              {/* {OpenOTP && ( */}
              <OtpInput
                isInputNum={true}
                value={OTP}
                onChange={setOTP}
                numInputs={6}
                separator={<span style={{ width: "10px" }}></span>}
                inputStyle="OTPField"
              />
              {/* )} */}
              <Grid
                container
                className="d-flex justify-content-center align-items-center mt-4"
              >
                <Grid xs={3}>
                  <Button
                    // id="demo-positioned-button"
                    size="small"
                    color="inherit"
                    variant="contained"
                    className="w-25"
                    // style={{ backgroundColor: "#494CE2", color: "white" }}
                    onClick={() => setOpenOTP(!OpenOTP)}
                    // onClick={onSubmitForm}
                  >
                    back
                  </Button>
                </Grid>
                <Grid xs={3}>
                  <Button
                    id="demo-positioned-button"
                    size="small"
                    variant="contained"
                    className="w-25"
                    style={{ backgroundColor: "#494CE2", color: "white" }}
                    onClick={() => onSubmitForm("video")}
                    // onClick={onSubmitForm}
                  >
                    Join
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid xs={12}>
            <Box className="d-flex justify-content-end align-items-center pb-2 pt-4 pr-4 ">
              <Box className=" hover:text-[#494CE2] d-flex align-items-center">
                <SettingsIcon fontSize="small" />
                <Typography variant="caption" className="pl-1">
                  Settings
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      {UrlShowJoin !== "true" && (
        <Tooltip title="Copy URL">
          <IconButton
            className="d-flex ml-5 mt-4"
            style={{ backgroundColor: "rgb(73, 76, 226)", color: "#fff" }}
            onClick={() => setUrlShowJoin("true")}
          >
            <ArrowForwardIosIcon
              fontSize="small"
              style={{ cursor: "pointer" }}
            />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

export default Joinpage;
