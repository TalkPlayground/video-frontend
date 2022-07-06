import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
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
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import DisplayAction from "../redux/actions/DisplayAction";

interface JoinProps extends RouteComponentProps {
    status: string;
  }
  

  const mediaShape = {
    audio: {
      encode: false,
      decode: false,
    },
    video: {
      encode: false,
      decode: false,
    },
    share: {
      encode: false,
      decode: false,
    },
  };

  const mediaReducer = produce((draft, action) => {
    switch (action.type) {
      case "audio-encode": {
        draft.audio.encode = action.payload;
        break;
      }
      case "audio-decode": {
        draft.audio.decode = action.payload;
        break;
      }
      case "video-encode": {
        draft.video.encode = action.payload;
        break;
      }
      case "video-decode": {
        draft.video.decode = action.payload;
        break;
      }
      case "share-encode": {
        draft.share.encode = action.payload;
        break;
      }
      case "share-decode": {
        draft.share.decode = action.payload;
        break;
      }
      default:
        break;
    }
  }, mediaShape);

  

const Joinpage:React.FunctionComponent<JoinProps> = (props) => {

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("closed");
  const [loading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isFailover, setIsFailover] = useState<boolean>(false);
    const { history } = props;
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { DisplayInfo } = useSelector((state) => state.Displayname);
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
//   console.log("DisplayInfo", DisplayInfo);
  function DisplayNameData(e:any) {
    setDisplayDataInfo({ ...DisplayDataInfo, [e.target.name]: e.target.value });
  }

  function joinMeeting() {
    // console.log("DTF", DisplayDataInfo);
    // dispatch(DisplayAction.setName(DisplayDataInfo));
    // navigate("/Meeting");
    
}


const zmClient = useContext(zoomContext);

const [callInit, setcallInit] = useState(false)

const init = async () => {
  await zmClient.init("en-US", `${window.location.origin}/lib`, 'zoom.us');
  try {
    setLoadingText("Joining the session...");
    await zmClient.join(meetingArgs.topic, meetingArgs.signature, meetingArgs.name, meetingArgs.password);
    const stream = zmClient.getMediaStream();
    setMediaStream(stream);
      setIsSupportGalleryView(stream.isSupportMultipleVideos());
    const chatClient = zmClient.getChatClient();
    setChatClient(chatClient);
    setIsLoading(false);
    setcallInit(false)
    history.push(`/video${window.location.search}`);
  } catch (e:any) {
    setIsLoading(false);
    setcallInit(false)
    message.error(e.reason);
  }
};
//   useEffect(() => {
//     init();
//     return () => {
//       ZoomVideo.destroyClient();
//     };
//   }, [sdkKey, signature, zmClient, topic, name, password]);

  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setcallInit(true)
        setIsFailover(true);
        setStatus("connecting");
        const { reason } = payload;
        if (reason === "failover") {
          setLoadingText("Session Disconnected,Try to reconnect");
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus("connected");
        if (isFailover) {
          setIsLoading(false);
        }
      } else if (payload.state === ConnectionState.Closed) {
        setStatus("closed");
        if (payload.reason === "ended by host") {
          Modal.warning({
            title: "Meeting ended",
            content: "This meeting has been ended by host",
          });
        }
      }
    },
    [isFailover]
  );

  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === "success" });
  }, []);

  const onLeaveOrJoinSession = async  () => {
    if (status === "closed") {
      setIsLoading(true);

      await zmClient.join(meetingArgs.topic, meetingArgs.signature, meetingArgs.name, meetingArgs.password);
      setIsLoading(false);
    } else if (status === "connected") {
      await zmClient.leave();
      message.warn("You have left the session.");
    }
  }



  var meetingArgs: any = Object.fromEntries(new URLSearchParams(window.location.search));
  const onCardClick = (type: string) => {
    devConfig.name = DisplayDataInfo.Displayname
    setIsLoading(true);
if (
  !meetingArgs.sdkKey ||
  !meetingArgs.topic ||
  !meetingArgs.name ||
  !meetingArgs.signature
) {
  meetingArgs = devConfig;
}
if (!meetingArgs.signature && meetingArgs.sdkSecret && meetingArgs.topic) {
  meetingArgs.signature = generateVideoToken(
    meetingArgs.sdkKey,
    meetingArgs.sdkSecret,
    meetingArgs.topic,
    meetingArgs.password,
    'jack4',
    'jack'
    );
}
init();
  
 
};


useEffect(() => {
  sessionStorage.clear()
}, [])


useEffect(() => {
  zmClient.on("connection-change", onConnectionChange);
  zmClient.on("media-sdk-change", onMediaSDKChange);
  return () => {
    zmClient.off("connection-change", onConnectionChange);
    zmClient.off("media-sdk-change", onMediaSDKChange);
  };
}, [zmClient, onConnectionChange, onMediaSDKChange]);

  const url =
    "https://stackoverflow.com/questions/43209666/react-router-v4-cannot-get-url";
  return (
    <>
          {loading && <LoadingLayer content={loadingText} />}
      <Header />
      <Grid className="h-screen mt-20">
        <Grid
          container
          className="overflow-scroll overflow-y-hidden overflow-x-hidden  flex justify-center mt-20"
        >
          <Box className="border-2 rounded  md:w-fit">
            <Box className="md:flex md:justify-center  py-12">
              <Box className="flex flex-col justify-center items-center px-16 mb-8 md:mt-0">
                <img src={HeaderIcon} alt="header_logo" className="w-44" />
                <Typography
                  style={{
                    fontSize: "40.54px",
                    fontWeight: "inherit",
                    lineHeight: "43.3px",
                    color: "#434343",
                  }}
                >
                  Playground
                </Typography>
              </Box>
              <Box className="flex flex-col justify-center items-center px-28">
                <TextField
                  id="filled-search"
                  label="Name to display"
                  type="string"
                  style={{ paddingBottom: "20px" }}
                  className="w-72"
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
                  className="w-72"
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
                  className="w-40"
                  style={{ backgroundColor: "#494CE2", color: "white" }}
                  onClick={() => onCardClick("video")}
                >
                  Join
                </Button>
              </Box>
            </Box>
            <Box className="flex justify-end items-center py-2 pr-4 ">
              <Box className="cursor-pointer hover:text-[#494CE2] flex items-center">
                <SettingsIcon fontSize="small" />
                <Typography  className="text-xs pl-0.5 select-none">
                  Settings
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={openToast}
        id="JoinMeetingLink"
        message={
          <Box className="flex justify-between items-center h-4">
            <p>{url?.length > 50 ? url.slice(0, 50) + "..." : url}</p>
            <IconButton onClick={() => navigator.clipboard.writeText(url)}>
              <ContentCopyIcon className="cursor-pointer" />
            </IconButton>
          </Box>
        }
      />
    </>
  );
}

export default Joinpage;
