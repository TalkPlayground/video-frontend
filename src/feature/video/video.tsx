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
  Button,
  Card,
  CardActions,
  CardContent,
  Drawer,
  Menu,
  Typography,
} from "@material-ui/core";
import MeetingDetails from "./components/MeetingDetails";
import ChatContainer from "../chat/chat";
import axios from "axios";
import { devConfig } from "../../config/dev";
import { useSnackbar } from "notistack";
import { Apis, getQueryString } from "../../Api";
import { MenuItem } from "@mui/material";
import { AnyArray } from "immer/dist/internal";
import nosleep from "nosleep.js";

interface VideoProps extends RouteComponentProps {
  DisplayDataInfo: any;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const { DisplayDataInfo } = props;
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
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(
    zmClient,
    canvasDimension
  );

  const [NewMsg, setNewMsg] = useState(false);

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

  useEffect(() => {
    if (modalOpenClose) {
      setNewMsg(false);
    }
    if (NewMsg && modalOpenClose) {
      setNewMsg(false);
    }
  }, [modalOpenClose, NewMsg]);

  const { enqueueSnackbar } = useSnackbar();

  const JoinSessionApi = async () => {
    var UserId = localStorage.getItem("UserID");
    const info = {
      ...zmClient.getSessionInfo(),
    };
    var a = false;
    await axios
      .post("/api/v1/user/session/store", {
        userId: UserId,
        sessionId: info.sessionId,
      })
      .then(function (response) {
        console.log(response);
        a = true;
        // handleClickVariant("success");
        // history.push("/Login");
        // init(DisplayDataInfo.Displayname);
        // history.push(
        //   `/${type}?topic=${devConfig.topic}${window.location.search}`
        // );
      })
      .catch(function (error) {
        console.log(error);
        // setemailValidate(true);
        // setnameValidation(true);
      });
    if (a) {
      return a;
    }
  };

  useEffect(() => {
    noSleep.enable();
    const startAPi = async () => {
      const data: any = await JoinSessionApi();
      console.log("sss", data);
      if (data) {
        StartStopRecording(!RecordingStatus);
      }
    };
    startAPi();
  }, []);

  const StartStopRecording = async (data: boolean) => {
    // console.log(
    //   "process.env.ZOMM_VIDEO_SDK_JWT_TOKEN}",
    //   process.env.REACT_APP_ZOOM_JWT_KEY
    // );
    // let config = {
    //   headers: {
    //     Authorization: `Bearer ${process.env.REACT_APP_ZOOM_JWT_KEY}`,
    //   },
    // };
    // console.log("first", zmClient.getSessionInfo());
    const info = {
      ...zmClient.getSessionInfo(),
    };
    await axios
      .post("/api/v1/user/session/recording", {
        sessionId: info.sessionId,
        status: data,
      })
      .then(function (response) {
        console.log(response);
        setRecordingStatus(data);
        if (data) {
          enqueueSnackbar("Recording Started", { variant: "info" });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const [RenderShowHide, setRenderShowHide] = useState(false);
  const [AllvisibleParticipants, setAllvisibleParticipants] =
    useState<AnyArray>([]);

  const info = {
    ...zmClient.getSessionInfo(),
  };

  const handleselfView = (data: any) => {
    if (data) {
      var index = visibleParticipants.findIndex(
        (e: any) => e.userId === info.userId
      );
      AllvisibleParticipants.push(visibleParticipants[index]);

      setRenderShowHide(true);
      visibleParticipants.splice(index, 1);

      console.log("cccc", visibleParticipants, AllvisibleParticipants, data);
      setselfViewGalleryLayout(true);
    } else {
      setselfViewGalleryLayout(false);
      console.log("dddd", visibleParticipants, AllvisibleParticipants, data);
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
      {/* <a className="exit" href="/"> <i className="far fa-times-circle"></i> </a> */}
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

      {/* <MeetingDetails modalOpenClose={modalOpenClose} /> */}
      <div className={modalOpenClose ? "ChatTransition" : "ChatTransitionOpen"}>
        <ChatContainer
          modalOpenClose={modalOpenClose}
          setmodalOpenClose={setmodalOpenClose}
          setNewMsg={setNewMsg}
        />
      </div>

      <VideoFooter
        className="video-operations"
        sharing
        shareRef={selfShareRef}
        setmodalOpenClose={setmodalOpenClose}
        modalOpenClose={modalOpenClose}
        setLinkShowCard={setLinkShowCard}
        LinkShowCard={LinkShowCard}
        NewMsg={NewMsg}
        StartStopRecording={StartStopRecording}
        RecordingStatus={RecordingStatus}
        handleselfView={handleselfView}
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
