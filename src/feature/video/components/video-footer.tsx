import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  MutableRefObject,
} from "react";
import classNames from "classnames";
import { message, Tooltip } from "antd";
import ZoomContext from "../../../context/zoom-context";
import CameraButton from "./camera";
import MicrophoneButton from "./microphone";
import { ScreenShareButton } from "./screen-share";
import ZoomMediaContext from "../../../context/media-context";
import { useUnmount } from "../../../hooks";
import { MediaDevice } from "../video-types";
import "./video-footer.scss";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { IconButton, Badge } from "@mui/material";
import { Box, Menu, MenuItem, Typography } from "@material-ui/core";
import moment from "moment";
import { topicInfo } from "../../../config/dev";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import ClosedCaptionOffOutlinedIcon from "@mui/icons-material/ClosedCaptionOffOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import { useHistory } from "react-router-dom";
import nosleep from "nosleep.js";

interface VideoFooterProps {
  className?: string;
  shareRef?: MutableRefObject<HTMLCanvasElement | null>;
  sharing?: boolean;
  setmodalOpenClose: any;
  modalOpenClose: any;
  setLinkShowCard: any;
  LinkShowCard: any;
  NewMsg: boolean;
  StartStopRecording: any;
  RecordingStatus: boolean;
  handleselfView: any;
}
const isAudioEnable = typeof AudioWorklet === "function";
const VideoFooter = (props: VideoFooterProps) => {
  const history = useHistory();

  const {
    className,
    shareRef,
    sharing,
    setmodalOpenClose,
    modalOpenClose,
    setLinkShowCard,
    LinkShowCard,
    NewMsg,
    StartStopRecording,
    RecordingStatus,
    handleselfView,
  } = props;

  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [isStartedScreenShare, setIsStartedScreenShare] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMicrophone, setActiveMicrophone] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState("");
  const [activeCamera, setActiveCamera] = useState("");
  const [micList, setMicList] = useState<MediaDevice[]>([]);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>([]);
  const [cameraList, setCameraList] = useState<MediaDevice[]>([]);
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);

  const [MirrorView, setMirrorView] = useState(true);

  const [onCaptionClick, setonCaptionClick] = useState(false);

  var noSleep = new nosleep();

  useEffect(() => {
    // onCameraClick();
    onMicrophoneClick();
  }, []);

  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      setIsStartedVideo(false);
    } else {
      await mediaStream?.startVideo();
      setIsStartedVideo(true);
      await mediaStream?.mirrorVideo(false);
      setMirrorView(false);
    }
  }, [mediaStream, isStartedVideo]);
  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
        setIsMuted(false);
      } else {
        await mediaStream?.muteAudio();
        setIsMuted(true);
      }
    } else {
      await mediaStream?.startAudio();
      setIsStartedAudio(true);
    }
  }, [mediaStream, isStartedAudio, isMuted]);
  const onMicrophoneMenuClick = async (key: string) => {
    if (mediaStream) {
      const [type, deviceId] = key.split("|");
      if (type === "microphone") {
        if (deviceId !== activeMicrophone) {
          await mediaStream.switchMicrophone(deviceId);
          setActiveMicrophone(mediaStream.getActiveMicrophone());
        }
      } else if (type === "speaker") {
        if (deviceId !== activeSpeaker) {
          await mediaStream.switchSpeaker(deviceId);
          setActiveSpeaker(mediaStream.getActiveSpeaker());
        }
      } else if (type === "leave audio") {
        await mediaStream.stopAudio();
        setIsStartedAudio(false);
      }
    }
  };
  const onSwitchCamera = async (key: string) => {
    if (mediaStream) {
      if (activeCamera !== key) {
        await mediaStream.switchCamera(key);
        setActiveCamera(mediaStream.getActiveCamera());
      }
    }
  };
  const onHostAudioMuted = useCallback((payload) => {
    const { action, source, type } = payload;
    if (action === "join" && type === "computer") {
      setIsStartedAudio(true);
    } else if (action === "leave") {
      setIsStartedAudio(false);
    } else if (action === "muted") {
      setIsMuted(true);
      if (source === "passive(mute one)") {
        message.info("Host muted you");
      }
    } else if (action === "unmuted") {
      setIsMuted(false);
      if (source === "passive") {
        message.info("Host unmuted you");
      }
    }
  }, []);
  const onScreenShareClick = useCallback(async () => {
    if (!isStartedScreenShare && shareRef && shareRef.current) {
      await mediaStream?.startShareScreen(shareRef.current);
      setIsStartedScreenShare(true);
    } else if (isStartedScreenShare) {
      await mediaStream?.stopShareScreen();
      setIsStartedScreenShare(false);
    }
  }, [mediaStream, isStartedScreenShare, shareRef]);
  const onPassivelyStopShare = useCallback(({ reason }) => {
    console.log("passively stop reason:", reason);
    setIsStartedScreenShare(false);
  }, []);
  const onDeviceChange = useCallback(() => {
    if (mediaStream) {
      setMicList(mediaStream.getMicList());
      setSpeakerList(mediaStream.getSpeakerList());
      setCameraList(mediaStream.getCameraList());
      setActiveMicrophone(mediaStream.getActiveMicrophone());
      setActiveSpeaker(mediaStream.getActiveSpeaker());
      setActiveCamera(mediaStream.getActiveCamera());
    }
  }, [mediaStream]);
  useEffect(() => {
    zmClient.on("current-audio-change", onHostAudioMuted);
    zmClient.on("passively-stop-share", onPassivelyStopShare);
    zmClient.on("device-change", onDeviceChange);
    return () => {
      zmClient.off("current-audio-change", onHostAudioMuted);
      zmClient.off("passively-stop-share", onPassivelyStopShare);
      zmClient.off("device-change", onDeviceChange);
    };
  }, [zmClient, onHostAudioMuted, onPassivelyStopShare, onDeviceChange]);
  useUnmount(() => {
    if (isStartedAudio) {
      mediaStream?.stopAudio();
    }
    if (isStartedVideo) {
      mediaStream?.stopVideo();
    }
    if (isStartedScreenShare) {
      mediaStream?.stopShareScreen();
    }
  });

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [HideSelfView, setHideSelfView] = useState(false);

  window.onbeforeunload = function () {
    zmClient.leave();
  };

  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMirrorView = async (data: boolean) => {
    await mediaStream?.mirrorVideo(data);
    setMirrorView(data);
  };

  return (
    <div className={classNames("video-footer", className)}>
      <div className="d-flex footer-left">
        <Box
          className="text-white px-3"
          style={{ fontWeight: "bold" }}
          sx={{
            display: { xs: "none", sm: "block" },
            borderRight: { md: "1px solid white" },
          }}
        >
          {moment().format("LT")}
        </Box>

        {topicInfo ? (
          <Box
            className="text-white px-3 "
            style={{ fontWeight: "bold" }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {topicInfo}
          </Box>
        ) : (
          <Box
            className="text-white px-3 "
            style={{ fontWeight: "bold" }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {urlParams.get("topic")}
          </Box>
        )}
      </div>
      <div className="d-flex footer-center justify-content-center">
        {isAudioEnable && (
          <MicrophoneButton
            isStartedAudio={isStartedAudio}
            isMuted={isMuted}
            onMicrophoneClick={onMicrophoneClick}
            onMicrophoneMenuClick={onMicrophoneMenuClick}
            microphoneList={micList}
            speakerList={speakerList}
            activeMicrophone={activeMicrophone}
            activeSpeaker={activeSpeaker}
          />
        )}
        <CameraButton
          isStartedVideo={isStartedVideo}
          onCameraClick={onCameraClick}
          onSwitchCamera={onSwitchCamera}
          cameraList={cameraList}
          activeCamera={activeCamera}
        />

        {/* <Tooltip title="Turn on captions (c)">
          <IconButton
            // className={isMuted ? "microphone-button" : "microphone-button"}
            className="ml-3 screen-share-button"
            style={{
              backgroundColor: onCaptionClick ? "#8ab4f8" : "#3c4043",
              color: onCaptionClick ? "#202124" : "white",
            }}
            onClick={() => setonCaptionClick(!onCaptionClick)}
          >
            <ClosedCaptionOffOutlinedIcon />
          </IconButton>
        </Tooltip> */}

        {sharing && (
          <ScreenShareButton
            isStartedScreenShare={isStartedScreenShare}
            onScreenShareClick={onScreenShareClick}
          />
        )}
        {/* <Tooltip title="More Option"> */}
        <IconButton
          // className={isMuted ? "microphone-button" : "microphone-button"}
          className="ml-3 screen-share-button"
          style={{ backgroundColor: true ? "#3c4043" : "#ea4335" }}
          // onClick={onMicrophoneClick}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <MoreVertOutlinedIcon style={{ fill: "#fff" }} />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          style={{ marginBottom: "-18px" }}
        >
          <MenuItem
            disabled={isStartedVideo ? false : true}
            onClick={() => {
              handleMirrorView(!MirrorView);
              setAnchorEl(null);
            }}
          >
            {MirrorView ? "Off Mirror View" : "On mirror View"}
          </MenuItem>
          {!HideSelfView ? (
            <MenuItem
              onClick={() => {
                handleselfView(!HideSelfView);
                setHideSelfView(!HideSelfView);
                setAnchorEl(null);
              }}
            >
              Hide Self view
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleselfView(!HideSelfView);
                setHideSelfView(!HideSelfView);
                setAnchorEl(null);
              }}
            >
              Show Self view
            </MenuItem>
          )}
        </Menu>
        {/* </Tooltip> */}
        <Typography
          className="rounded-pill ml-3"
          style={{
            padding: "8px 16px",
            backgroundColor: "#ea4335",
            cursor: "pointer",
          }}
          onClick={async () => {
            if (RecordingStatus) {
              StartStopRecording(!RecordingStatus).then(async () => {
                zmClient.leave();
                noSleep.disable();
                localStorage.removeItem("UserID");
                history.push("/");
                window.location.reload();
              });
            } else {
              zmClient.leave();
              noSleep.disable();
              localStorage.removeItem("UserID");
              history.push("/");
              window.location.reload();
            }
          }}
        >
          {/* <Tooltip title={"Call Ended"} style={{ backgroundColor: "black" }}> */}
          <CallEndIcon style={{ fill: "#fff" }} />
          {/* </Tooltip> */}
        </Typography>
        {/* <a className="exit" href="/">
        <i className="far fa-times-circle"></i>{" "}
      </a> */}
        {/* {(zmClient.isManager() || zmClient.isHost())&& (
        <ScreenShareLockButton
        isLockedScreenShare={isLockedScreenShare}
        onScreenShareLockClick={()=>{
          mediaStream?.lockShare(!isLockedScreenShare);
          setIsLockedScreenShare(!isLockedScreenShare);
        }}
      />
      )} */}
      </div>
      <div className="footer-right mr-5">
        <Tooltip title="Meeting details">
          <IconButton
            className="ml-2 HoverIcon"
            onClick={() => {
              setmodalOpenClose(false);
              setLinkShowCard(!LinkShowCard);
            }}
          >
            <InfoOutlinedIcon style={{ fill: "#fff" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chat with everyone">
          <IconButton
            className="ml-2 HoverIcon"
            onClick={() => {
              setmodalOpenClose(!modalOpenClose);
              setLinkShowCard(false);
            }}
          >
            <Badge variant={NewMsg ? "dot" : "standard"} color="info">
              <CommentOutlinedIcon style={{ fill: "#fff" }} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title={RecordingStatus ? "Stop Recording" : "Start Recording"}>
          <IconButton
            onClick={() => {
              StartStopRecording(!RecordingStatus);
            }}
            className="ml-2 HoverIcon"
          >
            <RadioButtonCheckedIcon
              style={{ fill: RecordingStatus ? "red" : "#fff" }}
              color="action"
            />
          </IconButton>
        </Tooltip>
        {/* <Tooltip title="Show everyone">
          <IconButton className="ml-2 HoverIcon">
            <Badge badgeContent={4} color="info">
              <GroupOutlinedIcon style={{ fill: "#fff" }} color="action" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Activities">
          <IconButton className="ml-2 HoverIcon">
            <CategoryOutlinedIcon style={{ fill: "#fff" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Host controls">
          <IconButton className="ml-2 HoverIcon">
            <LockClockOutlinedIcon style={{ fill: "#fff" }} />
          </IconButton>
        </Tooltip> */}
      </div>
    </div>
  );
};
export default VideoFooter;
