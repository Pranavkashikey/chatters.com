import React, { useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const VideoConference = ({ username }) => {
  function getUrlParams(url) {
    let urlStr = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlStr);
    return Object.fromEntries(urlSearchParams.entries());
  }

  useEffect(() => {
    const roomID =
      getUrlParams(window.location.href)["roomID"] ||
      Math.floor(Math.random() * 10000).toString();
    const userID = Math.floor(Math.random() * 10000).toString();
    const appID = 429487953;
    const serverSecret = "ed1f60b6ec766126a9ec36b984696946";

    // Ensure the username is capitalized
    const finalUserName = username ? username.charAt(0).toUpperCase() + username.slice(1) : `User${userID}`;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      finalUserName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: document.querySelector("#root"),
      sharedLinks: [
        {
          name: "Personal link",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?roomID=" +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showUserList: true,
      maxUsers: 2,
      layout: "Auto",
      showLayoutButton: false,
    });
  }, [username]);

  return <div id="root" style={{ width: "100vw", height: "100vh" }}></div>;
};

export default VideoConference;
