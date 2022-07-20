import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useReducer,
} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Redirect,
} from "react-router-dom";
import ZoomVideo, { ConnectionState } from "@zoom/videosdk";
import { message, Modal } from "antd";
import "antd/dist/antd.css";
import produce from "immer";
import Home from "./feature/home/home";
import Video from "./feature/video/video";
import VideoSingle from "./feature/video/video-single";
import Preview from "./feature/preview/preview";
import ZoomContext from "./context/zoom-context";
import ZoomMediaContext from "./context/media-context";
import ChatContext from "./context/chat-context";
import LoadingLayer from "./component/loading-layer";
import Chat from "./feature/chat/chat";
import { ChatClient, MediaStream } from "./index-types";
import "./App.css";
import Joinpage from "./feature/Join/Joinpage";
import Homepage from "./feature/home/Homepage";
import Loginoption from "./feature/Loginoption/Loginoption";
import Loginpage from "./feature/Loginoption/Login";
import RegisterPage from "./feature/Loginoption/Register";
import { devConfig, topicInfo } from "./config/dev";
import { getExploreName } from "./utils/platform";
import jwt_decode from "jwt-decode";
import { useSnackbar } from "notistack";

interface AppProps {
  meetingArgs: {
    sdkKey: string;
    topic: string;
    signature: string;
    name: string;
    password?: string;
  };
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

function App(props: AppProps) {
  const {
    meetingArgs: { sdkKey, topic, signature, name, password },
  } = props;

  const history = useHistory();
  const [loading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("closed");
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [isSupportGalleryView, setIsSupportGalleryView] =
    useState<boolean>(true);
  const [UserInfo, setUserInfo] = useState({
    exp: "",
    name: "",
    sub: "",
    userId: "",
  });

  const [LoginOrNot, setLoginOrNot] = useState(false);

  const [DisplayDataInfo, setDisplayDataInfo] = useState({
    Displayname: "",
    emailinfo: "",
  });

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!UserInfo.name && accessToken) {
      console.log(" njnknk");
      // var decoded = jwt_decode(accessToken);
      // if (decoded) {
      setUserInfo(jwt_decode(accessToken));
      // handleClickVariant("success");
      // }
    }
  }, [accessToken, LoginOrNot]);

  const zmClient = useContext(ZoomContext);

  const { enqueueSnackbar } = useSnackbar();

  const handleClickVariant = (variant: any) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar("Logged In", { variant });
  };

  useEffect(() => {
    console.log("UserInfo", UserInfo);
    if (UserInfo) {
      setDisplayDataInfo({ ...DisplayDataInfo, emailinfo: UserInfo.sub });
    }
  }, [UserInfo]);

  // if (topicInfo?.length && !UserInfo.sub) {
  //   return <Redirect to="/Join" />;
  // }

  useEffect(() => {
    if (topicInfo?.length && UserInfo.name?.length) {
      init(UserInfo.name);
    }
  }, [topicInfo, UserInfo]);

  const init = async (nameData: any) => {
    setIsLoading(true);
    console.log("name", nameData);
    await zmClient.init("en-US", `${window.location.origin}/lib`, "zoom.us");
    try {
      setLoadingText("Joining the session...");
      await zmClient.join(topic, signature, nameData, password);
      const stream = zmClient.getMediaStream();
      setMediaStream(stream);
      console.log(
        "stream.isSupportMultipleVideos()",
        stream.isSupportMultipleVideos()
      );
      setIsSupportGalleryView(stream.isSupportMultipleVideos());
      const chatClient = zmClient.getChatClient();
      setChatClient(chatClient);
      console.log(zmClient.getSessionInfo());

      // history.push(`/video${window.location.search}`);
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      message.error(e.reason);
    }
  };

  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
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

  const onLeaveOrJoinSession = useCallback(async () => {
    if (status === "closed") {
      setIsLoading(true);
      await zmClient.join(topic, signature, name, password);
      setIsLoading(false);
    } else if (status === "connected") {
      await zmClient.leave();
      message.warn("You have left the session.");
    }
  }, [zmClient, status, topic, signature, name, password]);

  useEffect(() => {
    zmClient.on("connection-change", onConnectionChange);
    zmClient.on("media-sdk-change", onMediaSDKChange);
    return () => {
      zmClient.off("connection-change", onConnectionChange);
      zmClient.off("media-sdk-change", onMediaSDKChange);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange]);
  return (
    <div className="App">
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <ZoomMediaContext.Provider value={{ ...mediaState, mediaStream }}>
          <ChatContext.Provider value={chatClient}>
            <Router>
              <Switch>
                <Route
                  path="/"
                  render={(props) => (
                    <Homepage
                      {...props}
                      status={status}
                      UserInfo={UserInfo}
                      init={init}
                      setLoginOrNot={setLoginOrNot}
                    />
                  )}
                  exact
                />
                <Route
                  path="/Join"
                  render={(props) => (
                    <Joinpage
                      {...props}
                      status={status}
                      init={init}
                      setDisplayDataInfo={setDisplayDataInfo}
                      DisplayDataInfo={DisplayDataInfo}
                    />
                  )}
                  exact
                />
                <Route
                  path="/LoginOption"
                  render={(props) => <Loginoption {...props} status={status} />}
                  exact
                />
                <Route
                  path="/Login"
                  render={(props) => (
                    <Loginpage
                      {...props}
                      status={status}
                      setUserInfo={setUserInfo}
                      handleClickVariant={handleClickVariant}
                      setLoginOrNot={setLoginOrNot}
                    />
                  )}
                  exact
                />
                <Route
                  path="/Register"
                  render={(props) => (
                    <RegisterPage {...props} status={status} />
                  )}
                  exact
                />

                {/* <Route
                  path="/index.html"
                  render={(props) => <Home {...props} status={status} />}
                  exact
                /> */}
                <Route path="/preview" component={Preview} />
                {UserInfo.name || DisplayDataInfo.Displayname || accessToken ? (
                  <Route
                    path="/video"
                    render={(props) =>
                      isSupportGalleryView ? (
                        <Video {...props} DisplayDataInfo={DisplayDataInfo} />
                      ) : (
                        <VideoSingle
                          {...props}
                          DisplayDataInfo={DisplayDataInfo}
                        />
                      )
                    }
                  />
                ) : (
                  <Redirect to="/Join" />
                )}
                <Route path="/chat" component={Chat} />
              </Switch>
            </Router>
          </ChatContext.Provider>
        </ZoomMediaContext.Provider>
      )}
    </div>
  );
}

export default App;
