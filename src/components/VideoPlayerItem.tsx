import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  RefObject,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { VideoControls } from "./VideoControls";
import { VideoPlayerHandler, VideoPlayerItemProps } from "../types";
import { useFocusEffect } from "@react-navigation/native";

const VIEWPORT_WIDTH = Dimensions.get("window").width;

const VideoPlayer = forwardRef<VideoPlayerHandler, VideoPlayerItemProps>(
  (
    {
      index,
      videoHeight,
      currentVideoIndex,
      videoDetails,
      isMuted = false,
      handleMuteToggle,
      showSeekbar,
      showLoadingIndicator,
      useNativeControls,
      holdToPause,
      bottomOffset = 0,
      overlayComponent,
      onCurrentPlaybackStatusUpdate,
    },
    parentRef
  ) => {
    const video = useRef<Video>(null);
    const [status, setStatus] = useState<AVPlaybackStatus | undefined>();

    useImperativeHandle(parentRef, () => ({
      unload: () => unloadVideo(),
      pause: async () => {
        video.current?.pauseAsync();
      },
      status: status,
    }));

    const replayVideo = useCallback(async () => {
      try {
        if (
          currentVideoIndex === index &&
          status?.didJustFinish &&
          status?.isLoaded &&
          status?.positionMillis === status?.durationMillis &&
          !status?.isPlaying
        ) {
          await video?.current?.setPositionAsync(0);
          await video?.current?.playAsync();
        }
      } catch (error) {
        console.error("Error replaying video", error);
      }
    }, [status, currentVideoIndex, index]);

    useEffect(() => {
      replayVideo();
    }, [replayVideo]);

    const loadVideo = useCallback(
      async (ref?: RefObject<Video>) => {
        const status = await (ref || video)?.current?.getStatusAsync();
        try {
          if (status && !status?.isLoaded) {
            await (ref || video)?.current?.loadAsync(
              {
                uri: videoDetails.source,
              },
              {},
              false
            );
          }
        } catch (error) {
          console.error("Error loading video", error);
        }
      },
      [videoDetails.source]
    );

    const unloadVideo = useCallback(async (ref?: RefObject<Video>) => {
      const status = await (ref || video)?.current?.getStatusAsync();
      try {
        if (status && status?.isLoaded) {
          await (ref || video)?.current?.unloadAsync();
        }
      } catch (error) {
        console.error("Error unloading video", error);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        if (status?.isLoaded) {
          if (index === currentVideoIndex) {
            video?.current?.playAsync();
          } else if (Math.abs(index - currentVideoIndex) <= 1) {
            video?.current?.pauseAsync();
          } else {
            video?.current?.stopAsync();
          }
        }

        if (Math.abs(index - currentVideoIndex) > 2) {
          unloadVideo(video);
        } else {
          loadVideo(video);
        }
      }, [currentVideoIndex, index, loadVideo, status?.isLoaded, unloadVideo])
    );

    useEffect(() => {
      if (status?.isLoaded) {
        video?.current?.setIsMutedAsync(isMuted);
      }
    }, [isMuted, status?.isLoaded]);

    const videoNotPlayable =
      !status?.isLoaded ||
      (!status?.isPlaying &&
        (status?.playableDurationMillis || 0) <=
          Math.min(status?.durationMillis || 0, 1200));

    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd((_, success) => {
        if (!useNativeControls && success && handleMuteToggle) {
          handleMuteToggle();
        }
      });

    const longPress = Gesture.LongPress()
      .runOnJS(true)
      .onStart(() => {
        if (!useNativeControls && holdToPause) {
          video?.current?.pauseAsync();
        }
      })
      .onEnd((_, success) => {
        if (!useNativeControls && success && holdToPause) {
          video?.current?.playAsync();
        }
      });

    const composed = Gesture.Exclusive(tap, longPress);

    return (
      <View style={[styles.container, { height: videoHeight }]}>
        {Math.abs(index - currentVideoIndex) <= 2 ? (
          <>
            {overlayComponent?.({ item: videoDetails, index })}
            <View style={[styles.bottomContainer, { bottom: bottomOffset }]}>
              {showLoadingIndicator &&
                (!status?.isLoaded ||
                  (status?.isBuffering && !status?.isPlaying)) && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={styles.bufferingIndicator}
                  />
                )}
              {showSeekbar && (
                <VideoControls
                  positionMillis={status?.positionMillis || 0}
                  durationMillis={status?.durationMillis || 0}
                  setPosition={(position: number) => {
                    if (index === currentVideoIndex) {
                      video?.current?.setPositionAsync(position);
                    }
                  }}
                />
              )}
            </View>
            <GestureDetector gesture={composed}>
              <View style={styles.videoContainer}>
                {videoNotPlayable && (
                  <Image
                    source={{ uri: videoDetails?.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                )}
                <Video
                  ref={video}
                  shouldPlay={false}
                  style={styles.video}
                  source={{
                    uri: videoDetails.source,
                  }}
                  posterSource={{
                    uri: videoDetails?.thumbnail,
                  }}
                  onPlaybackStatusUpdate={(pbstatus) => {
                    onCurrentPlaybackStatusUpdate?.(pbstatus);
                    setStatus(pbstatus);
                  }}
                  useNativeControls={useNativeControls}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              </View>
            </GestureDetector>
          </>
        ) : (
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: videoDetails?.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    );
  }
);

VideoPlayer.displayName = "VideoPlayerItem";
export const VideoPlayerItem = React.memo(VideoPlayer);

const styles = StyleSheet.create({
  makeFlex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    width: VIEWPORT_WIDTH,
  },
  videoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: VIEWPORT_WIDTH,
  },
  descriptionText: {
    color: "white",
    fontSize: 14,
    marginTop: 8,
  },
  bottomContainer: {
    width: "100%",
    position: "absolute",
    zIndex: 2,
  },
  avatar: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: "white",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    height: "100%",
    width: "100%",
  },
  bufferingIndicator: {
    alignSelf: "flex-end",
    right: 8,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  thumbnail: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 1,
  },
});
