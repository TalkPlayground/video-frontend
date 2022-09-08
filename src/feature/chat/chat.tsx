import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import produce from "immer";
import { Input } from "antd";
import { ChatPrivilege } from "@zoom/videosdk";
import ZoomContext from "../../context/zoom-context";
import { ChatReceiver, ChatRecord } from "./chat-types";
import { useParticipantsChange } from "./hooks/useParticipantsChange";
import ChatContext from "../../context/chat-context";
import ChatMessageItem from "./component/chat-message-item";
import ChatReceiverContainer from "./component/chat-receiver";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

import { useMount } from "../../hooks";
import "./chat.scss";
import {
  Grow,
  IconButton,
  InputAdornment,
  Slide,
  TextareaAutosize,
} from "@material-ui/core";
import { Visibility } from "@mui/icons-material";
import { Alert } from "@mui/material";
const { TextArea } = Input;
const ChatContainer = ({
  modalOpenClose,
  setmodalOpenClose,
  setChatRecords,
  chatRecords,
  setNewMsg,
}: any) => {
  const zmClient = useContext(ZoomContext);
  const chatClient = useContext(ChatContext);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [chatReceivers, setChatReceivers] = useState<ChatReceiver[]>([]);
  const [chatPrivilege, setChatPrivilege] = useState<ChatPrivilege>(
    ChatPrivilege.All
  );
  const [chatUser, setChatUser] = useState<ChatReceiver | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [chatDraft, setChatDraft] = useState<string>("");
  const chatWrapRef = useRef<HTMLDivElement | null>(null);

  const onChatMessage = useCallback(
    (payload: ChatRecord) => {
      setChatRecords(
        produce((records: ChatRecord[]) => {
          const length = records.length;
          if (length > 0) {
            const lastRecord = records[length - 1];
            if (
              payload.sender.userId === lastRecord.sender.userId &&
              payload.receiver.userId === lastRecord.receiver.userId &&
              payload.timestamp - lastRecord.timestamp < 1000 * 60 * 5
            ) {
              if (Array.isArray(lastRecord.message)) {
                lastRecord.message.push(payload.message as string);
              } else {
                lastRecord.message = [
                  lastRecord.message,
                  payload.message as string,
                ];
              }
            } else {
              records.push(payload);
            }
          } else {
            records.push(payload);
          }
        })
      );
      if (chatWrapRef.current) {
        chatWrapRef.current.scrollTo(0, chatWrapRef.current.scrollHeight);
      }
    },
    [chatWrapRef]
  );
  const onChatPrivilegeChange = useCallback(
    (payload) => {
      setChatPrivilege(payload.chatPrivilege);
      if (chatClient) {
        setChatReceivers(chatClient.getReceivers());
      }
    },
    [chatClient]
  );

  const [ErrorValidate, setErrorValidate] = useState(false);

  useEffect(() => {
    if (ErrorValidate) {
      setTimeout(() => {
        setErrorValidate(false);
      }, 4000);
    }
  }, [ErrorValidate]);

  const onChatInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setChatDraft(event.target.value);
      if (event.target.value?.length > 10200) {
        setErrorValidate(true);
      } else {
        setErrorValidate(false);
      }
    },
    []
  );
  useEffect(() => {
    zmClient.on("chat-on-message", onChatMessage);
    return () => {
      zmClient.off("chat-on-message", onChatMessage);
    };
  }, [zmClient, onChatMessage]);
  useEffect(() => {
    zmClient.on("chat-privilege-change", onChatPrivilegeChange);
    return () => {
      zmClient.off("chat-privilege-change", onChatPrivilegeChange);
    };
  }, [zmClient, onChatPrivilegeChange]);
  useParticipantsChange(zmClient, () => {
    if (chatClient) {
      setChatReceivers(chatClient.getReceivers());
    }
    setIsHost(zmClient.isHost());
    setIsManager(zmClient.isManager());
  });
  useEffect(() => {
    if (chatUser) {
      const index = chatReceivers.findIndex(
        (user) => user.userId === chatUser.userId
      );
      if (index === -1) {
        setChatUser(chatReceivers[0]);
      }
    } else {
      if (chatReceivers.length > 0) {
        setChatUser(chatReceivers[0]);
      }
    }
  }, [chatReceivers, chatUser]);
  const setChatUserId = useCallback(
    (userId) => {
      const user = chatReceivers.find((u) => u.userId === userId);
      if (user) {
        setChatUser(user);
      }
    },
    [chatReceivers]
  );
  const KeyActionButton = (e: any) => {
    if (!e.shiftKey && e.key == "Enter") {
      sendMessage(e);
    }
  };

  const sendMessage = useCallback(
    (event: any) => {
      event.preventDefault();
      if (chatUser && chatDraft && chatDraft?.length <= 10200) {
        chatClient?.send(chatDraft, chatUser?.userId);
        setChatDraft("");
      }
    },
    [chatClient, chatDraft, chatUser]
  );

  useMount(() => {
    setCurrentUserId(zmClient.getSessionInfo().userId);
    if (chatClient) {
      setChatPrivilege(chatClient.getPrivilege());
    }
  });

  useEffect(() => {
    if (chatWrapRef.current) {
      chatWrapRef.current.scrollTop = chatWrapRef.current.scrollHeight;
    }
  }, [modalOpenClose]);

  return (
    <Slide direction="left" in={modalOpenClose} mountOnEnter unmountOnExit>
      <div className="chat-container">
        <div className="chat-wrap px-2">
          {/* <a className="exit-chat" href="/"> <i className="far fa-times-circle"></i> </a> */}
          <div className="d-flex justify-content-between align-items-center px-3">
            <p style={{ fontSize: 18, color: "black" }}>In-call messages</p>
            <IconButton onClick={() => setmodalOpenClose(false)}>
              <CloseIcon className="cursor-pointer" />
            </IconButton>
          </div>
          {/* {ErrorValidate && (
            <Grow in={ErrorValidate}>
              <Alert variant="filled" severity="error" icon={false}>
                Message failed to send! Messages longer than 2000 words cannot
                be sent.
              </Alert>
            </Grow>
          )} */}

          <div className="chat-message-wrap" ref={chatWrapRef}>
            {chatRecords?.length > 0 &&
              chatRecords.map((record: any) => (
                <ChatMessageItem
                  record={record}
                  currentUserId={currentUserId}
                  setChatUser={setChatUserId}
                  key={record.timestamp}
                />
              ))}
          </div>
          {ChatPrivilege.NoOne !== chatPrivilege || isHost || isManager ? (
            <>
              <ChatReceiverContainer
                chatUsers={chatReceivers}
                selectedChatUser={chatUser}
                isHostOrManager={isHost || isManager}
                chatPrivilege={chatPrivilege}
                setChatUser={setChatUserId}
              />
              <div className="chat-message-box d-flex align-items-center">
                {/* <TextArea
                onPressEnter={sendMessage}
                onChange={onChatInput}
                placeholder="Send a message to everyone"
              /> */}
                <TextareaAutosize
                  value={chatDraft}
                  maxRows={2}
                  aria-label="maximum height"
                  placeholder="Send a message to everyone"
                  onChange={onChatInput}
                  className="py-2"
                  onKeyPress={(e) => KeyActionButton(e)}
                />
                <IconButton
                  onClick={(e) => sendMessage(e)}
                  disabled={chatDraft?.length > 0 ? false : true}
                >
                  <SendIcon
                    style={{
                      fill:
                        chatDraft?.length > 0 && chatDraft?.length <= 10200
                          ? "rgb(73, 76, 226)"
                          : "rgba(60,64,67,.38)",
                    }}
                  />
                </IconButton>
              </div>
            </>
          ) : (
            <div className="chat-disabled">Chat disabled</div>
          )}
        </div>
      </div>
    </Slide>
  );
};

export default ChatContainer;
