import { useCallback, useEffect, useState, MutableRefObject } from "react";
import { getVideoLayout } from "../video-layout-helper";
import { useRenderVideo } from "./useRenderVideo";
import { Dimension, Pagination, CellLayout } from "../video-types";
import { ZoomClient, MediaStream, Participant } from "../../../index-types";
/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  dimension: Dimension,
  pagination: any
) {
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>(
    []
  );
  const [layout, setLayout] = useState<CellLayout[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<number[]>([]);
  const { page, pageSize, totalPage, totalSize, selfViewGalleryLayout } =
    pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }

  useEffect(() => {
    setLayout(
      getVideoLayout(
        dimension.width,
        dimension.height,
        selfViewGalleryLayout ? size - 1 : size
      )
    );
  }, [dimension, size, selfViewGalleryLayout]);
  const onParticipantsChange = useCallback(() => {
    const participants = zmClient.getAllUser();
    const info = {
      ...zmClient.getSessionInfo(),
    };
    // if(selfViewGalleryLayout){
    //   console.log("pageParticipants s")
    // var index = participants.findIndex((e: any) => e.userId === info.userId);
    //   console.log("DDS",participants,index)
    //   participants.splice(index, 1);
    // }
    const currentUser = zmClient.getCurrentUserInfo();
    if (currentUser && participants.length > 0) {
      let pageParticipants: any[] = [];
      let demoArray: any[] = [];
      if (participants.length === 1) {
        pageParticipants = participants;
      } else {
        // if (selfViewGalleryLayout) {
        //   demoArray = participants.filter((e: any) => e.userId !== info.userId);
        // } else {
        //   demoArray = participants;
        // }
        pageParticipants = participants
          .filter((user) => user.userId !== currentUser.userId)
          .sort(
            (user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn)
          );
        pageParticipants.splice(1, 0, currentUser);
        if (selfViewGalleryLayout) {
          var index = pageParticipants.findIndex(
            (e: any) => e.userId === info.userId
          );
          pageParticipants.splice(index, 1);
        }
        pageParticipants = pageParticipants.filter(
          (_user, index) => Math.floor(index / pageSize) === page
        );
      }

      console.log("pageParticipants", pageParticipants);
      setVisibleParticipants(pageParticipants);
      const videoParticipants = pageParticipants
        .filter((user) => user.bVideoOn)
        .map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  }, [zmClient, page, pageSize, selfViewGalleryLayout]);
  useEffect(() => {
    zmClient.on("user-added", onParticipantsChange);
    zmClient.on("user-removed", onParticipantsChange);
    zmClient.on("user-updated", onParticipantsChange);
    return () => {
      zmClient.off("user-added", onParticipantsChange);
      zmClient.off("user-removed", onParticipantsChange);
      zmClient.off("user-updated", onParticipantsChange);
    };
  }, [zmClient, onParticipantsChange]);
  useEffect(() => {
    onParticipantsChange();
  }, [onParticipantsChange, selfViewGalleryLayout]);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants
  );
  return {
    visibleParticipants,
    setVisibleParticipants,
    layout,
  };
}
