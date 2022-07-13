import React from "react";
import { Button, Tooltip } from "antd";
import classNames from "classnames";
import { IconFont } from "../../../component/icon-font";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import "./screen-share.scss";
import PresentToAllOutlinedIcon from "@mui/icons-material/PresentToAllOutlined";
import { IconButton } from "@material-ui/core";

interface ScreenShareButtonProps {
  isStartedScreenShare: boolean;
  onScreenShareClick: () => void;
}

interface ScreenShareLockButtonProps {
  isLockedScreenShare: boolean;
  onScreenShareLockClick: () => void;
}

const ScreenShareButton = (props: ScreenShareButtonProps) => {
  const { isStartedScreenShare, onScreenShareClick } = props;
  return (
    <Tooltip
      title={isStartedScreenShare ? "stop screen share" : "start screen share"}
    >
      <IconButton
        className={classNames("screen-share-button ml-3", {
          "started-share": isStartedScreenShare,
        })}
        style={{
          backgroundColor: isStartedScreenShare ? "#8ab4f8" : "#3c4043",
          color: isStartedScreenShare ? "#202124" : "white",
        }}
        // icon={
        //   isStartedScreenShare ? (
        //     <StopScreenShareIcon type="icon-share" />
        //   ) : (
        //     <ScreenShareIcon type="icon-share" />
        //   )
        // }
        // // eslint-disable-next-line react/jsx-boolean-value
        // ghost={true}
        // shape="circle"
        // size="large"
        onClick={onScreenShareClick}
      >
        {isStartedScreenShare ? (
          <PresentToAllOutlinedIcon type="icon-share" />
        ) : (
          <PresentToAllOutlinedIcon type="icon-share" />
        )}
      </IconButton>
    </Tooltip>
  );
};

const ScreenShareLockButton = (props: ScreenShareLockButtonProps) => {
  const { isLockedScreenShare, onScreenShareLockClick } = props;
  return (
    <Tooltip
      title={isLockedScreenShare ? "unlock screen share" : " lock screen share"}
    >
      <Button
        className={"screen-share-button"}
        icon={isLockedScreenShare ? <LockOutlined /> : <UnlockOutlined />}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onScreenShareLockClick}
      />
    </Tooltip>
  );
};

export { ScreenShareButton, ScreenShareLockButton };
