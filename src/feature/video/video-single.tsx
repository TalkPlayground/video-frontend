import React, { useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { VideoQuality } from '@zoom/videosdk';
import classnames from 'classnames';
import _ from 'lodash';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
// import AvatarActionContext from './context/avatar-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
// import ShareView from './components/share-view';
// import RemoteCameraControlPanel from './components/remote-camera-control';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { Participant } from '../../index-types';
import { SELF_VIDEO_ID } from './video-constants';
// import { useNetworkQuality } from './hooks/useNetworkQuality';
// import { useAvatarAction } from './hooks/useAvatarAction';
import { usePrevious } from '../../hooks';
import './video.scss';
import { isShallowEqual } from '../../utils/util';
import { Box } from '@mui/material';
import ChatContainer from '../chat/chat';
import { getQueryString } from '../../Api';
import axios from 'axios';
import moment from 'moment';
import { isAndroidOrIOSBrowser } from '../../utils/platform';
import { useSnackbar } from 'notistack';
import { AnyArray } from 'immer/dist/internal';
import { ChatRecord } from '../chat/chat-types';

interface VideoProps extends RouteComponentProps {
  DisplayDataInfo?: any;
  setIsLoading?: Function;
  setLoadingText?: Function;
  SaveTranscript: any;
}

const VideoContainer: React.FunctionComponent<VideoProps> = (props) => {
  const { DisplayDataInfo, setIsLoading, setLoadingText, SaveTranscript } = props;
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const selfVideoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shareViewRef = useRef<{ selfShareRef: HTMLCanvasElement | HTMLVideoElement | null }>(null);
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeVideo, setActiveVideo] = useState<number>(mediaStream?.getActiveVideoId() ?? 0);
  const previousActiveUser = useRef<Participant>();
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const selfCanvasDimension = useCanvasDimension(mediaStream, selfVideoCanvasRef);
  // const networkQuality = useNetworkQuality(zmClient);
  const previousCanvasDimension = usePrevious(canvasDimension);

  const [modalOpenClose, setmodalOpenClose] = useState(false);
  const [LinkShowCard, setLinkShowCard] = useState(false);
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [RecordingStatus, setRecordingStatus] = useState(false);
  const [selfViewGalleryLayout, setselfViewGalleryLayout] = useState(false);
  const myVideoRef = useRef<HTMLCanvasElement | null>(null);
  const [IncallMemberCard, setIncallMemberCard] = useState(false);
  const RecordingZoomApi: any = zmClient?.getRecordingClient();
  var UserId = localStorage.getItem('UserID');
  const [ShowAlert, setShowAlert] = useState(false);
  const [RenderShowHide, setRenderShowHide] = useState(false);
  const [AllvisibleParticipants, setAllvisibleParticipants] = useState<AnyArray>([]);
  const [NewMsg, setNewMsg] = useState(false);
  const selfShareRef = useRef<HTMLCanvasElement & HTMLVideoElement>(null);

  const { enqueueSnackbar } = useSnackbar();
  const info = {
    ...zmClient.getSessionInfo()
  };

  useParticipantsChange(zmClient, (payload) => {
    setParticipants(payload);
  });
  const onActiveVideoChange = useCallback((payload: any) => {
    const { userId } = payload;
    setActiveVideo(userId);
  }, []);
  useEffect(() => {
    zmClient.on('video-active-change', onActiveVideoChange);
    return () => {
      zmClient.off('video-active-change', onActiveVideoChange);
    };
  }, [zmClient, onActiveVideoChange]);
  // active user = regard as `video-active-change` payload, excluding the case where it is self and the video is turned on.
  // In this case, the self video is rendered seperately.
  const activeUser = useMemo(
    () =>
      participants.find(
        (user) => user.userId === activeVideo && !(user.userId === zmClient.getSessionInfo().userId && user.bVideoOn)
      ),
    [participants, activeVideo, zmClient]
  );
  const isCurrentUserStartedVideo = zmClient.getCurrentUserInfo()?.bVideoOn;
  useEffect(() => {
    if (mediaStream && videoRef.current) {
      if (activeUser?.bVideoOn !== previousActiveUser.current?.bVideoOn) {
        //
        if (
          activeUser?.bVideoOn &&
          !(activeUser.userId === zmClient.getSessionInfo().userId && isCurrentUserStartedVideo)
        ) {
          mediaStream.renderVideo(
            videoRef.current,
            activeUser.userId,
            canvasDimension.width,
            canvasDimension.height,
            0,
            0,
            VideoQuality.Video_360P as any
          );
        } else {
          if (previousActiveUser.current?.bVideoOn) {
            mediaStream.stopRenderVideo(videoRef.current, previousActiveUser.current?.userId);
          }
        }
      }
      if (activeUser?.bVideoOn && previousActiveUser.current?.bVideoOn) {
        if (activeUser.userId !== previousActiveUser.current.userId) {
          mediaStream.stopRenderVideo(videoRef.current, previousActiveUser.current?.userId);
          mediaStream.renderVideo(
            videoRef.current,
            activeUser.userId,
            canvasDimension.width,
            canvasDimension.height,
            0,
            0,
            VideoQuality.Video_360P as any
          );
        } else {
          if (!isShallowEqual(canvasDimension, previousCanvasDimension)) {
            mediaStream.adjustRenderedVideoPosition(
              videoRef.current,
              activeUser.userId,
              canvasDimension.width,
              canvasDimension.height,
              0,
              0
            );
          }
        }
      }
      previousActiveUser.current = activeUser;
    }
  }, [
    mediaStream,
    activeUser,
    isVideoDecodeReady,
    canvasDimension,
    previousCanvasDimension,
    zmClient,
    isCurrentUserStartedVideo
  ]);
  useEffect(() => {
    if (
      selfVideoCanvasRef.current &&
      selfCanvasDimension.width > 0 &&
      selfCanvasDimension.height > 0 &&
      isCurrentUserStartedVideo
    ) {
      mediaStream?.adjustRenderedVideoPosition(
        selfVideoCanvasRef.current,
        zmClient.getSessionInfo().userId,
        selfCanvasDimension.width,
        selfCanvasDimension.height,
        0,
        0
      );
    }
  }, [selfCanvasDimension, mediaStream, zmClient, isCurrentUserStartedVideo]);
  // const avatarActionState = useAvatarAction(zmClient, activeUser ? [activeUser] : []);

  const handleselfView = async (data: any) => {
    // if (data) {
    //   setShowAlert(true);
    //   setselfViewGalleryLayout(true);
    //   var index = visibleParticipants.findIndex((e: any) => e.userId === info.userId);
    //   AllvisibleParticipants.push(visibleParticipants[index]);
    //   setRenderShowHide(true);
    //   visibleParticipants.splice(index, 1);
    // } else {
    //   setselfViewGalleryLayout(false);
    //   visibleParticipants.push(AllvisibleParticipants[0]);
    //   setRenderShowHide(false);
    //   setAllvisibleParticipants([]);
    // }
  };

  const StartStopRecording = async (data: boolean) => {
    if (data) {
      await RecordingZoomApi.startCloudRecording()
        .then(async function (response: any) {
          setRecordingStatus(data);
          if (SaveTranscript) {
            enqueueSnackbar('Transcript Started', {
              variant: 'info',
              anchorOrigin: { horizontal: 'left', vertical: isAndroidOrIOSBrowser() ? 'top' : 'bottom' }
            });
          } else {
            await axios.post('/api/v1/user/transcripts/delete/statusChange', {
              userId: UserId,
              status: false,
              sessionId: info.sessionId
            });
          }
          ///Call Api Here with else
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: `Recording Started on ${moment().format('DD/MM/YYYY LT')}`
              })
          );
        })
        .catch(async function (error: any) {
          console.log(error);
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: error?.message + ' ' + moment().format('DD/MM/YYYY LT')
              })
          );
        });
    } else {
      await RecordingZoomApi.stopCloudRecording()
        .then(async function (response: any) {
          setRecordingStatus(data);
          if (SaveTranscript) {
            enqueueSnackbar('Transcript Stoped', {
              variant: 'info',
              anchorOrigin: { horizontal: 'left', vertical: isAndroidOrIOSBrowser() ? 'top' : 'bottom' }
            });
          }
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: `Recording Stoped on ${moment().format('DD/MM/YYYY LT')}`
              })
          );
        })
        .catch(async function (error: any) {
          console.log(error);
          await axios.post(
            '/api/v1/user/session/frontend/loggers' +
              '?' +
              getQueryString({
                logs: error?.message + ' ' + moment().format('DD/MM/YYYY LT')
              })
          );
        });
    }
  };

  // useEffect(() => {
  //   if (ShowAlert) {
  //     setTimeout(() => {
  //       setShowAlert(false);
  //     }, 1000);
  //   }
  // }, [ShowAlert]);

  return (
    <div className="viewport">
      {/* <ShareView ref={shareViewRef} onRecieveSharingChange={setIsRecieveSharing} /> */}
      <div
        className={classnames('video-container', 'single-video-container', {
          'video-container-in-sharing': isRecieveSharing
        })}
      >
        {mediaStream?.isRenderSelfViewWithVideoElement() ? (
          <video
            id={SELF_VIDEO_ID}
            autoPlay
            muted
            playsInline
            className={classnames('self-video', {
              'single-self-video': participants.length === 1,
              'self-video-show': isCurrentUserStartedVideo
            })}
          />
        ) : (
          <canvas
            id={SELF_VIDEO_ID}
            width="254"
            height="143"
            className={classnames('self-video', {
              'single-self-video': participants.length === 1,
              'self-video-show': isCurrentUserStartedVideo
            })}
            ref={selfVideoCanvasRef}
          />
        )}
        <div className="single-video-wrap" style={{width:"100%",height:"100%"}}>
          <canvas className="video-canvas video-canvas-single" id="video-canvas" width="800" height="600" ref={videoRef} />

          {/* <AvatarActionContext.Provider value={avatarActionState}> */}
            {activeUser && (
              <Avatar
                participant={activeUser}
                isActive={false}
                className="single-view-avatar"
                // networkQuality={networkQuality[`${activeUser.userId}`]}
              />
            )}
            {/* <RemoteCameraControlPanel />
          </AvatarActionContext.Provider> */}
        </div>
      </div>
      {/* <VideoFooter className="video-operations" sharing selfShareCanvas={shareViewRef.current?.selfShareRef} /> */}
      <Box style={{ width: modalOpenClose ? '100vw' : '' }}>
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
        setIncallMemberCard={setIncallMemberCard}
      />
    </div>
  );
};

export default VideoContainer;
