import {
  Button,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Modal,
  Box,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import LinkIcon from "@mui/icons-material/Link";
import HomepagePhoto from "../../assets/homepagePhoto.jpg";
//   import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import Snackbar, { SnackbarOrigin } from "@mui/material/Snackbar";
import Header from "../../component/pages/Header";
import { RouteComponentProps } from "react-router-dom";
import "../../index.css";
import { devConfig } from "../../config/dev";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #fff",
  boxShadow: 24,
  p: 2,
};

function KeepMountedModal({ setOpenModal, openModal }: any) {
  const handleClose = () => setOpenModal(false);
  const [copyLinkDone, setcopyLinkDone] = useState(false);

  const url = `${window.location.origin}/video?topic=${devConfig.topic}`;

  const copyLink = () => {
    setcopyLinkDone(true);
    navigator.clipboard.writeText(url);
    setTimeout(() => {
      setcopyLinkDone(false);
    }, 2000);
  };

  return (
    <>
      <Modal
        keepMounted
        open={openModal}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Box className="d-flex justify-content-between align-items-center">
            <Typography
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "43.3px",
                color: "black",
              }}
            >
              Hear's the link of your meeting
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon className="cursor-pointer" />
            </IconButton>
          </Box>
          <Typography variant="h6" fontSize={18}>
            Copy this link and send it to people you want to meet with. Be sure
            to save it so you can use it later, too.
          </Typography>
          <Box className="d-flex justify-content-between align-items-center bg-light px-2 my-3 rounded mb-5 ">
            <p id="copyInput">
              {url?.length > 35 ? url.slice(0, 35) + "..." : url}
            </p>
            <IconButton onClick={copyLink}>
              <ContentCopyIcon className="cursor-pointer" />
            </IconButton>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={copyLinkDone}
        message="Copied meeting link"
        key={"bottom" + "left"}
      />
    </>
  );
}

interface HomeProps extends RouteComponentProps {
  status: string;
}

const Homepage: React.FunctionComponent<HomeProps> = (props) => {
  const { history, status } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  // const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const startSession = () => {
    // navigate("/Join");
    history.push(`/Join`);
  };

  const createSession = () => {
    setOpenModal(true);
  };

  return (
    <>
      <Header />
      <KeepMountedModal setOpenModal={setOpenModal} openModal={openModal} />
      <Grid
        container
        className="px-5 d-flex justify-items-center align-items-center h-75"
      >
        <Grid xs={12} md={6} className=" text-left">
          <Typography
            style={{
              fontSize: "32px",
              fontWeight: 500,
              lineHeight: "43.3px",
              color: "black",
            }}
            className="pt-4 px-5"
          >
            The video platform for connection.
          </Typography>
          <Typography
            style={{
              fontSize: "32px",
              fontWeight: 500,
              lineHeight: "43.3px",
              color: "black",
            }}
            className="px-5"
          >
            Free and available for all.
          </Typography>
          <Typography
            style={{
              fontSize: "22px",
              fontWeight: 300,
              lineHeight: "31.51px",
              // color: "gray",
            }}
            className="pb-4 pt-1 px-5 bg-red-600"
          >
            Designed specifically for building emotional <br /> awareness. Free
            and available for all.
          </Typography>
          <Box className="mt-3 pb-10 px-5">
            <Button
              id="demo-positioned-button"
              aria-controls={open ? "demo-positioned-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              startIcon={<VideocamOutlinedIcon />}
              variant="contained"
              style={{ backgroundColor: "#494CE2", color: "#fff" }}
            >
              <span className="text-capitalize">New Meeting</span>
            </Button>
            <Menu
              id="demo-positioned-menu"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              style={{ marginLeft: "38px" }}
            >
              <MenuItem onClick={startSession} className="py-1 mb-1">
                <VideocamOutlinedIcon className="mr-2" />
                <ListItemText
                  primary={
                    <span className="capitalize text-xs">
                      Start a session now
                    </span>
                  }
                />
              </MenuItem>
              <MenuItem onClick={handleClose} className="py-1">
                <LinkIcon className="mr-2" />
                <ListItemText
                  onClick={createSession}
                  primary={
                    <span className="capitalize text-xs">
                      Create a session for later
                    </span>
                  }
                />
              </MenuItem>
            </Menu>
          </Box>
          <Divider className="ml-5 mt-3" />
          <Typography className="pt-3 px-5" style={{ fontSize: "15px" }}>
            <span className="LearnMore pr-1" style={{ color: "#494CE2" }}>
              Learn more
            </span>
            about Playground
          </Typography>
        </Grid>
        <Grid xs={12} md={6}>
          <img
            className="rounded HomepagePhoto"
            src={HomepagePhoto}
            alt="HomepagePhoto"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Homepage;
