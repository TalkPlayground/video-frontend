import React, { useEffect, useContext, useState, useCallback, useReducer, useMemo } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import ZoomVideo, { ConnectionState, ReconnectReason } from '@zoom/videosdk';
import { message, Modal } from 'antd';
import 'antd/dist/antd.min.css';
import produce from 'immer';
import Video from './feature/video/video';
import Preview from './feature/preview/preview';
import ZoomContext from './context/zoom-context';
import ZoomMediaContext from './context/media-context';
import ChatContext from './context/chat-context';
import CommandContext from './context/cmd-context';
import LiveTranscriptionContext from './context/live-transcription';
import RecordingContext from './context/recording-context';
import LoadingLayer from './component/loading-layer';
import Chat from './feature/chat/chat';
import Command from './feature/command/command';
// import Subsession from './feature/subsession/subsession';
import {
  ChatClient,
  CommandChannelClient,
  LiveTranscriptionClient,
  MediaStream,
  RecordingClient,
  SubsessionClient
} from './index-types';
import './App.css';
import SubsessionContext from './context/subsession-context';
import { devConfig } from './config/dev';
import Homepage from './feature/home/Homepage';
import Joinpage from './feature/Join/Joinpage';
interface AppProps {
  meetingArgs: {
    sdkKey: string;
    topic: string;
    signature: string;
    name: string;
    password?: string;
    webEndpoint?: string;
    enforceGalleryView?: string;
  };
}
const mediaShape = {
  audio: {
    encode: false,
    decode: false
  },
  video: {
    encode: false,
    decode: false
  },
  share: {
    encode: false,
    decode: false
  }
};
const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case 'audio-encode': {
      draft.audio.encode = action.payload;
      break;
    }
    case 'audio-decode': {
      draft.audio.decode = action.payload;
      break;
    }
    case 'video-encode': {
      draft.video.encode = action.payload;
      break;
    }
    case 'video-decode': {
      draft.video.decode = action.payload;
      break;
    }
    case 'share-encode': {
      draft.share.encode = action.payload;
      break;
    }
    case 'share-decode': {
      draft.share.decode = action.payload;
      break;
    }
    case 'reset-media': {
      Object.assign(draft, { ...mediaShape });
      break;
    }
    default:
      break;
  }
}, mediaShape);

declare global {
  interface Window {
    webEndpoint: string | undefined;
    zmClient: any | undefined;
    mediaStream: any | undefined;
    crossOriginIsolated: boolean;
  }
}

export const url = `${window.location.origin}/video?topic=${devConfig.topic}`;

function App(props: AppProps) {
  const {
    meetingArgs: { sdkKey, topic, signature, name, password, webEndpoint: webEndpointArg, enforceGalleryView }
  } = props;
  const [loading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('closed');
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [recordingClient, setRecordingClient] = useState<RecordingClient | null>(null);
  const [commandClient, setCommandClient] = useState<CommandChannelClient | null>(null);
  const [subsessionClient, setSubsessionClient] = useState<SubsessionClient | null>(null);
  const [liveTranscriptionClient, setLiveTranscriptionClient] = useState<LiveTranscriptionClient | null>(null);

  const [DisplayDataInfo, setDisplayDataInfo] = useState({
    Displayname: '',
    emailinfo: ''
  });

  const [SaveTranscript, setSaveTranscript] = useState(true);
  const zmClient = useContext(ZoomContext);
  let webEndpoint: any;
  if (webEndpointArg) {
    webEndpoint = webEndpointArg;
  } else {
    webEndpoint = window?.webEndpoint ?? 'zoom.us';
  }
  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);

  const init = async (usernameData: any) => {
    setIsLoading(true);
    await zmClient.init('en-US', `${window.location.origin}/lib`, {
      webEndpoint,
      enforceMultipleVideos: false,
      enforceVirtualBackground: false,
      stayAwake: true,
      patchJsMedia: true,
      leaveOnPageUnload: false
    });
    try {
      setLoadingText('Joining the session...');
      await zmClient.join(topic, signature, usernameData, password).catch((e) => {
        console.log(e);
      });
      const stream = zmClient.getMediaStream();
      setMediaStream(stream);
      const chatClient = zmClient.getChatClient();
      const commandClient = zmClient.getCommandClient();
      const recordingClient = zmClient.getRecordingClient();
      const ssClient = zmClient.getSubsessionClient();
      const ltClient = zmClient.getLiveTranscriptionClient();
      setChatClient(chatClient);
      setCommandClient(commandClient);
      setRecordingClient(recordingClient);
      setSubsessionClient(ssClient);
      setLiveTranscriptionClient(ltClient);
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      message.error(e.reason);
    }
  };


  const onConnectionChange = useCallback(
    (payload: any) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus('connecting');
        const { reason, subsessionName } = payload;
        if (reason === ReconnectReason.Failover) {
          setLoadingText('Session Disconnected,Try to reconnect');
        } else if (reason === ReconnectReason.JoinSubsession || reason === ReconnectReason.MoveToSubsession) {
          setLoadingText(`Joining ${subsessionName}...`);
        } else if (reason === ReconnectReason.BackToMainSession) {
          setLoadingText('Returning to Main Session...');
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus('connected');
        if (isFailover) {
          setIsLoading(false);
        }
        window.zmClient = zmClient;
        window.mediaStream = zmClient.getMediaStream();

        console.log('getSessionInfo', zmClient.getSessionInfo());
      } else if (payload.state === ConnectionState.Closed) {
        setStatus('closed');
        dispatch({ type: 'reset-media' });
        if (payload.reason === 'ended by host') {
          Modal.warning({
            title: 'Meeting ended',
            content: 'This meeting has been ended by host'
          });
        }
      }
    },
    [isFailover, zmClient]
  );
  const onMediaSDKChange = useCallback((payload: any) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  useEffect(() => {
    zmClient.on('connection-change', onConnectionChange);
    zmClient.on('media-sdk-change', onMediaSDKChange);
    return () => {
      zmClient.off('connection-change', onConnectionChange);
      zmClient.off('media-sdk-change', onMediaSDKChange);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange]);
  return (
    <div className="App">
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <ZoomMediaContext.Provider value={mediaContext}>
          <ChatContext.Provider value={chatClient}>
            <RecordingContext.Provider value={recordingClient}>
              <CommandContext.Provider value={commandClient}>
                <SubsessionContext.Provider value={subsessionClient}>
                  <LiveTranscriptionContext.Provider value={liveTranscriptionClient}>
                    <Router>
                      <Switch>
                        <Route path="/" render={(props) => <Homepage {...props} status={status} />} exact />
                        {/* <Route path="/index.html" component={Home} exact />*/}
                        <Route
                          path="/Join"
                          render={(props) => (
                            <Joinpage
                              {...props}
                              status={status}
                              init={init}
                              setDisplayDataInfo={setDisplayDataInfo}
                              DisplayDataInfo={DisplayDataInfo}
                              setIsLoading={setIsLoading}
                              setSaveTranscript={setSaveTranscript}
                              SaveTranscript={SaveTranscript}
                            />
                          )}
                          exact
                        />
                        <Route path="/chat" component={Chat} />
                        <Route path="/command" component={Command} />
                        <Route
                          path="/video"
                          render={(props) => (
                            DisplayDataInfo?.Displayname ? (
                              <Video
                                {...props}
                                DisplayDataInfo={DisplayDataInfo}
                                setIsLoading={setIsLoading}
                                setLoadingText={setLoadingText}
                                SaveTranscript={SaveTranscript}
                              />
                            ) : (
                              <Redirect to="/Join" />
                            )
                          )}
                        />
                        {/* <Route path="/subsession" component={Subsession} /> */}
                        <Route path="/preview" component={Preview} />
                      </Switch>
                    </Router>
                  </LiveTranscriptionContext.Provider>
                </SubsessionContext.Provider>
              </CommandContext.Provider>
            </RecordingContext.Provider>
          </ChatContext.Provider>
        </ZoomMediaContext.Provider>
      )}
    </div>
  );
}

export default App;
