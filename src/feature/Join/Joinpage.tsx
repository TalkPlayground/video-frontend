import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Grid, Typography, Box } from "@material-ui/core";
import { Button, IconButton } from "@mui/material";

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
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import DisplayAction from "../redux/actions/DisplayAction";

interface JoinProps extends RouteComponentProps {
  status: string;
  init: any;
}

const Joinpage: React.FunctionComponent<JoinProps> = (props) => {
  const { history, init } = props;
  const [openToast, setopenToast] = useState(false);
  const [DisplayDataInfo, setDisplayDataInfo] = useState({
    Displayname: "",
    emailinfo: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setopenToast(true);
    }, 2000);
  }, []);

  function DisplayNameData(e: any) {
    setDisplayDataInfo({ ...DisplayDataInfo, [e.target.name]: e.target.value });
  }

  const onCardClick = (type: string) => {
    init(DisplayDataInfo.Displayname);
    history.push(`/${type}?topic=${devConfig.topic}${window.location.search}`);
  };

  const url = `${window.location.origin}/video?topic=${devConfig.topic}`;
  return (
    <>
      <Header />
      <Grid className="d-flex justify-content-center">
        <Grid
          container
          className="border rounded mx-5"
          style={{ width: "60rem", marginTop: "5em" }}
        >
          <Grid
            xs={12}
            md={6}
            className="flex flex-col justify-content-center py-5 align-items-center "
          >
            <img src={HeaderIcon} alt="header_logo" className="Joinpagelogo" />
            <Typography
              style={{
                fontSize: "2.54rem",
                fontWeight: "inherit",
                lineHeight: "43.3px",
                color: "#434343",
              }}
            >
              Playground
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={6}
            className="d-flex flex-column justify-content-center align-items-center"
          >
            {/* <Box className="d-flex flex-column justify-content-center align-items-center"> */}
            <TextField
              id="filled-search"
              label="Name to display"
              type="string"
              style={{ paddingBottom: "20px" }}
              className="w-50"
              variant="outlined"
              autoComplete="off"
              size="small"
              name="Displayname"
              onChange={DisplayNameData}
            />
            <TextField
              size="small"
              style={{ paddingBottom: "20px" }}
              type="email"
              className="w-50"
              variant="outlined"
              autoComplete="off"
              label="Email"
              name="emailinfo"
              onChange={DisplayNameData}
            />
            <Button
              id="demo-positioned-button"
              size="small"
              variant="contained"
              className="w-25"
              style={{ backgroundColor: "#494CE2", color: "white" }}
              onClick={() => onCardClick("video")}
            >
              Join
            </Button>
          </Grid>

          <Grid xs={12}>
            <Box className="d-flex justify-content-end align-items-center pb-2 pr-4 ">
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
      <Snackbar
        open={openToast}
        id="JoinMeetingLink"
        message={
          <Box className="d-flex justify-content-between align-items-center ">
            <p>{url?.length > 50 ? url.slice(0, 50) + "..." : url}</p>

            <IconButton onClick={() => navigator.clipboard.writeText(url)}>
              <ContentCopyIcon className="cursor-pointer" />
            </IconButton>
          </Box>
        }
      />
    </>
  );
};

export default Joinpage;
