import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import React, {
  useCallback,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { VideoPlayerItem } from "./components";
import { ReelsListProps, VideoItemType, VideoPlayerHandler } from "./types";
import { useNavigation } from "@react-navigation/native";

const ReelsList = forwardRef<(VideoPlayerHandler | null)[], ReelsListProps>(
  (
    {
      currentVideoIndex,
      initialVideoIndex = 0,
      handleGetItemLayout,
      onViewableItemsChanged,
      videos,
      videoHeight,
      isMuted,
      handleMuteToggle,
      showSeekbar,
      showLoadingIndicator,
      useNativeControls,
      holdToPause,
      bottomOffset,
      overlayComponent,
      onCurrentPlaybackStatusUpdate,
      ...props
    },
    refs
  ) => {
    const { addListener } = useNavigation();

    const videoRefs = useRef<(VideoPlayerHandler | null)[]>([]);

    useImperativeHandle(refs, () => videoRefs.current);

    const renderItem = useCallback(
      ({ item, index }: ListRenderItemInfo<VideoItemType>) => {
        return (
          <VideoPlayerItem
            ref={(el) => (videoRefs.current[index] = el)}
            videoHeight={videoHeight}
            videoDetails={item}
            index={index}
            currentVideoIndex={currentVideoIndex}
            isMuted={isMuted}
            handleMuteToggle={handleMuteToggle}
            showSeekbar={showSeekbar}
            showLoadingIndicator={showLoadingIndicator}
            useNativeControls={useNativeControls}
            holdToPause={holdToPause}
            bottomOffset={bottomOffset}
            overlayComponent={overlayComponent}
            onCurrentPlaybackStatusUpdate={onCurrentPlaybackStatusUpdate}
          />
        );
      },
      [
        videoHeight,
        currentVideoIndex,
        isMuted,
        handleMuteToggle,
        showSeekbar,
        showLoadingIndicator,
        useNativeControls,
        overlayComponent,
        holdToPause,
        bottomOffset,
        onCurrentPlaybackStatusUpdate,
      ]
    );

    const handleUnloadVideos = useCallback(() => {
      for (let i = 0; i < videoRefs.current.length; i++) {
        const video = videoRefs.current[i];
        if (Math.abs(currentVideoIndex - i) > 1) {
          video?.unload();
        } else {
          video?.pause();
        }
      }
    }, [currentVideoIndex]);

    useEffect(() => {
      const unsubscribe = addListener("blur", handleUnloadVideos);

      return unsubscribe;
    }, [addListener, handleUnloadVideos]);

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 60,
    };

    return (
      <View style={styles.emptyContainer}>
        <FlatList
          disableIntervalMomentum
          initialScrollIndex={initialVideoIndex}
          data={videos}
          windowSize={5}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          onEndReachedThreshold={2}
          removeClippedSubviews
          pagingEnabled
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={renderItem}
          getItemLayout={handleGetItemLayout}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          {...props}
        />
      </View>
    );
  }
);

ReelsList.displayName = "ReelsList";
export default ReelsList;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
});
