import React, { useContext, useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { RouteComponentProps } from "react-router-dom";
import ZoomContext from "../../context/zoom-context";
import ZoomMediaContext from "../../context/media-context";
import Avatar from "./components/avatar";
import VideoFooter from "./components/video-footer";
import Pagination from "./components/pagination";
import { useCanvasDimension } from "./hooks/useCanvasDimension";
import { useGalleryLayout } from "./hooks/useGalleryLayout";
import { usePagination } from "./hooks/usePagination";
import { useActiveVideo } from "./hooks/useAvtiveVideo";
import { useShare } from "./hooks/useShare";
import "./video.scss";
import { isSupportWebCodecs } from "../../utils/platform";
import BasicCard from "../../component/pages/Linkcard";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Drawer,
  Menu,
  Paper,
  Slide,
  Typography,
} from "@material-ui/core";
import MeetingDetails from "./components/MeetingDetails";
import ChatContainer from "../chat/chat";
import axios from "axios";
import { devConfig } from "../../config/dev";
import { useSnackbar } from "notistack";
import { Apis, getQueryString } from "../../Api";
import { Alert, MenuItem } from "@mui/material";
import { AnyArray } from "immer/dist/internal";
import nosleep from "nosleep.js";
import { ChatRecord } from "../chat/chat-types";
import moment from "moment";

interface VideoProps extends RouteComponentProps {
  DisplayDataInfo: any;
  setIsLoading?: Function;
  setLoadingText?: Function;
  SaveTranscript: any;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const { DisplayDataInfo, setIsLoading, setLoadingText, SaveTranscript } =
    props;
  const [LinkShowCard, setLinkShowCard] = useState(true);
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady },
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(
    null
  );
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const myVideoRef = useRef<HTMLCanvasElement | null>(null);

  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(
    zmClient,
    canvasDimension
  );

  const [selfViewGalleryLayout, setselfViewGalleryLayout] = useState(false);
  const {
    visibleParticipants,
    setVisibleParticipants,
    layout: videoLayout,
  } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      myVideoRef,
      page,
      pageSize,
      totalPage,
      totalSize,
      selfViewGalleryLayout,
    }
  );

  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(
    zmClient,
    mediaStream,
    shareRef
  );

  const [modalOpenClose, setmodalOpenClose] = useState(false);
  const [RecordingStatus, setRecordingStatus] = useState(false);
  var UserId = localStorage.getItem("UserID");

  const isSharing = isRecieveSharing || isStartedShare;
  const contentDimension = sharedContentDimension;
  if (isSharing && shareContainerRef.current) {
    const { width, height } = sharedContentDimension;
    const { width: containerWidth, height: containerHeight } =
      shareContainerRef.current.getBoundingClientRect();
    const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
    contentDimension.width = Math.floor(width * ratio);
    contentDimension.height = Math.floor(height * ratio);
  }

  var noSleep = new nosleep();

  const { enqueueSnackbar } = useSnackbar();

  const JoinSessionApi = async () => {
    const info = {
      ...zmClient.getSessionInfo(),
    };
    var a = false;
    if (UserId) {
      await axios
        .post("/api/v1/user/session/store", {
          userId: UserId,
          sessionId: info.sessionId,
        })
        .then(function (response) {
          a = true;
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    if (a) {
      return a;
    }
  };

  const participants = zmClient.getAllUser();
  const RecordingZoomApi: any = zmClient?.getRecordingClient();

  console.log("RecordingZoomApi", RecordingZoomApi);

  useEffect(() => {
    noSleep.enable();
    const startAPi = async () => {
      const data: any = await JoinSessionApi();
      if (data && participants?.length == 1) {
        StartStopRecording(!RecordingStatus);
      } else if (data) {
        if (RecordingZoomApi?.getCloudRecordingStatus() == "Recording") {
          setRecordingStatus(true);
          if (SaveTranscript) {
            enqueueSnackbar("Transcript Started", { variant: "info" });
          } else {
            await axios.post("/api/v1/user/transcripts/delete/statusChange", {
              UserId,
              status: false,
            });
          }
          ///Call Api Here with else
        } else {
          StartStopRecording(true);
        }
      }
    };
    startAPi();
  }, []);

  const StartStopRecording = async (data: boolean) => {
    if (data) {
      await RecordingZoomApi.startCloudRecording()
        .then(async function (response: any) {
          setRecordingStatus(data);
          if (SaveTranscript) {
            enqueueSnackbar("Transcript Started", { variant: "info" });
          } else {
            await axios.post("/api/v1/user/transcripts/delete/statusChange", {
              UserId,
              status: false,
            });
          }
          ///Call Api Here with else
          await axios.post(
            "/api/v1/user/session/frontend/loggers" +
              "?" +
              getQueryString({
                logs: `Recording Started on ${moment().format(
                  "DD/MM/YYYY LT"
                )}`,
              })
          );
        })
        .catch(async function (error: any) {
          console.log(error);
          await axios.post(
            "/api/v1/user/session/frontend/loggers" +
              "?" +
              getQueryString({
                logs: error?.message + " " + moment().format("DD/MM/YYYY LT"),
              })
          );
        });
    } else {
      await RecordingZoomApi.stopCloudRecording()
        .then(async function (response: any) {
          setRecordingStatus(data);
          if (SaveTranscript) {
            enqueueSnackbar("Transcript Stoped", { variant: "info" });
          }
          await axios.post(
            "/api/v1/user/session/frontend/loggers" +
              "?" +
              getQueryString({
                logs: `Recording Stoped on ${moment().format("DD/MM/YYYY LT")}`,
              })
          );
        })
        .catch(async function (error: any) {
          console.log(error);
          await axios.post(
            "/api/v1/user/session/frontend/loggers" +
              "?" +
              getQueryString({
                logs: error?.message + " " + moment().format("DD/MM/YYYY LT"),
              })
          );
        });
    }
  };

  const [NewMsg, setNewMsg] = useState(false);

  const hand = () => {
    setTimeout(() => {
      if (!modalOpenClose) {
        setNewMsg(true);
      }
    }, 1000);
  };

  if (NewMsg && modalOpenClose) {
    setNewMsg(false);
  }

  useEffect(() => {
    if (modalOpenClose == false) {
      zmClient.on("chat-on-message", hand);
    }
    if (modalOpenClose) {
      setNewMsg(false);
    }
  }, [modalOpenClose, zmClient]);

  const [RenderShowHide, setRenderShowHide] = useState(false);
  const [AllvisibleParticipants, setAllvisibleParticipants] =
    useState<AnyArray>([]);

  const [ShowAlert, setShowAlert] = useState(false);

  const info = {
    ...zmClient.getSessionInfo(),
  };

  useEffect(() => {
    if (ShowAlert) {
      setTimeout(() => {
        setShowAlert(false);
      }, 1000);
    }
  }, [ShowAlert]);

  const handleselfView = (data: any) => {
    if (data) {
      setShowAlert(true);
      setselfViewGalleryLayout(true);
      var index = visibleParticipants.findIndex(
        (e: any) => e.userId === info.userId
      );
      AllvisibleParticipants.push(visibleParticipants[index]);
      setRenderShowHide(true);
      visibleParticipants.splice(index, 1);
    } else {
      setselfViewGalleryLayout(false);
      visibleParticipants.push(AllvisibleParticipants[0]);
      setRenderShowHide(false);
      setAllvisibleParticipants([]);
    }
  };

  return (
    <div className="viewport">
      {LinkShowCard && (
        <BasicCard
          setLinkShowCard={setLinkShowCard}
          LinkShowCard={LinkShowCard}
          DisplayDataInfo={DisplayDataInfo}
        />
      )}
      <div
        className={classnames("share-container", {
          "in-sharing": isSharing,
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${contentDimension.width}px`,
            height: `${contentDimension.height}px`,
          }}
        >
          <canvas
            className={classnames("share-canvas", { hidden: isStartedShare })}
            ref={shareRef}
          />
          {isSupportWebCodecs() ? (
            <video
              className={classnames("share-canvas", {
                hidden: isRecieveSharing,
              })}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={classnames("share-canvas", {
                hidden: isRecieveSharing,
              })}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={classnames("video-container", {
          "in-sharing": isSharing,
        })}
      >
        <canvas
          className="video-canvas"
          id="video-canvas"
          width="800"
          height="600"
          ref={videoRef}
        />
        <ul className="avatar-list">
          {visibleParticipants?.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const { width, height, x, y } = dimension;
            const { height: canvasHeight } = canvasDimension;
            return (
              <Avatar
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`,
                }}
              />
            );
          })}
        </ul>
      </div>

      <Slide direction="left" in={ShowAlert} mountOnEnter unmountOnExit>
        <Box>
          <Alert>Hide Self View</Alert>
        </Box>
      </Slide>

      <Box>
        <ChatContainer
          modalOpenClose={modalOpenClose}
          setmodalOpenClose={setmodalOpenClose}
          setChatRecords={setChatRecords}
          chatRecords={chatRecords}
        />
      </Box>

      <VideoFooter
        className="video-operations"
        sharing
        shareRef={selfShareRef}
        setmodalOpenClose={setmodalOpenClose}
        modalOpenClose={modalOpenClose}
        setLinkShowCard={setLinkShowCard}
        LinkShowCard={LinkShowCard}
        chatRecords={chatRecords}
        StartStopRecording={StartStopRecording}
        RecordingStatus={RecordingStatus}
        handleselfView={handleselfView}
        NewMsg={NewMsg}
        videoRef={myVideoRef}
        setIsLoading={setIsLoading}
        setLoadingText={setLoadingText}
        SaveTranscript={SaveTranscript}
      />

      {totalPage > 1 && (
        <Pagination
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          inSharing={isSharing}
        />
      )}
    </div>
  );
};

export default VideoContainer;
