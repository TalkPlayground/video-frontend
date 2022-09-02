import React, {
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { RouteComponentProps } from "react-router-dom";
import { VideoQuality, VideoActiveState } from "@zoom/videosdk";
import classnames from "classnames";
import ZoomContext from "../../context/zoom-context";
import ZoomMediaContext from "../../context/media-context";
import Avatar from "./components/avatar";
import VideoFooter from "./components/video-footer";
import { useShare } from "./hooks/useShare";
import { useParticipantsChange } from "./hooks/useParticipantsChange";
import { useCanvasDimension } from "./hooks/useCanvasDimension";
import { usePrevious, useMount } from "../../hooks";
import { Participant } from "../../index-types";
import "./video.scss";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Menu,
  Typography,
} from "@material-ui/core";
import MeetingDetails from "./components/MeetingDetails";
import BasicCard from "../../component/pages/Linkcard";
import ChatContainer from "../chat/chat";
import axios from "axios";
import { devConfig } from "../../config/dev";
import { useSnackbar } from "notistack";
import { MenuItem } from "@mui/material";

interface VideoProps extends RouteComponentProps {
  DisplayDataInfo: any;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const { DisplayDataInfo } = props;
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady },
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<HTMLCanvasElement | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeVideo, setActiveVideo] = useState<number>(0);
  const [activeSpeaker, setActiveSpeaker] = useState<number>(0);
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(
    zmClient,
    mediaStream,
    shareRef
  );
  const [RecordingStatus, setRecordingStatus] = useState(false);

  const [LinkShowCard, setLinkShowCard] = useState(true);
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
  const previousActiveVideo = usePrevious(activeVideo);
  useParticipantsChange(zmClient, (payload) => {
    setParticipants(payload);
  });
  const onActiveVideoChange = useCallback((payload) => {
    const { state, userId } = payload;
    if (state === VideoActiveState.Active) {
      setActiveVideo(userId);
    } else if (state === VideoActiveState.Inactive) {
      setActiveVideo(0);
    }
  }, []);
  const onActiveSpeakerChange = useCallback((payload) => {
    if (Array.isArray(payload) && payload.length > 0) {
      const { userId } = payload[0];
      setActiveSpeaker(userId);
    }
  }, []);
  useEffect(() => {
    zmClient.on("video-active-change", onActiveVideoChange);
    zmClient.on("active-speaker", onActiveSpeakerChange);
    return () => {
      zmClient.off("video-active-change", onActiveVideoChange);
      zmClient.off("active-speaker", onActiveSpeakerChange);
    };
  }, [zmClient, onActiveVideoChange, onActiveSpeakerChange]);

  const [modalOpenClose, setmodalOpenClose] = useState(false);

  const activeUser = useMemo(() => {
    let user = undefined;
    if (activeVideo) {
      user = participants.find((user) => user.userId === activeVideo);
    } else if (activeSpeaker) {
      user = participants.find((user) => user.userId === activeSpeaker);
    } else {
      user = participants.find((user) => user.isHost);
    }
    if (!user) {
      user = zmClient.getCurrentUserInfo();
    }
    return user;
  }, [activeSpeaker, participants, activeVideo, zmClient]);
  useEffect(() => {
    if (mediaStream && videoRef.current && isVideoDecodeReady) {
      if (activeVideo && previousActiveVideo !== activeVideo) {
        /**
         * Can not specify the width and height of the rendered video, also applied to the position of video.
         * Passing these arguments just for consistency.
         */
        mediaStream.renderVideo(
          videoRef.current,
          activeVideo,
          canvasDimension.width,
          canvasDimension.height,
          0,
          0,
          VideoQuality.Video_360P as any
        );
      } else if (activeVideo === 0 && previousActiveVideo) {
        mediaStream.stopRenderVideo(videoRef.current, previousActiveVideo);
      }
    }
  }, [
    mediaStream,
    activeVideo,
    previousActiveVideo,
    isVideoDecodeReady,
    canvasDimension,
  ]);
  useMount(() => {
    if (mediaStream) {
      setActiveVideo(mediaStream.getActiveVideoId());
    }
  });

  const { enqueueSnackbar } = useSnackbar();

  const StartStopRecording = async (data: boolean) => {
    setRecordingStatus(data);
    enqueueSnackbar(`${data ? "Start Recording" : "Stop Recording"}`, {
      variant: "info",
    });
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
          <canvas
            className={classnames("share-canvas", { hidden: isRecieveSharing })}
            ref={selfShareRef}
          />
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
        {activeUser && (
          <Avatar
            participant={activeUser}
            isActive={false}
            className="single-view-avatar"
          />
        )}
      </div>

      <div className={modalOpenClose ? "ChatTransition" : "ChatTransitionOpen"}>
        <ChatContainer
          modalOpenClose={modalOpenClose}
          setmodalOpenClose={setmodalOpenClose}
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
        StartStopRecording={StartStopRecording}
        RecordingStatus={RecordingStatus}
        handleselfView={null}
        videoRef={videoRef}
      />
    </div>
  );
};

export default VideoContainer;
