import React from "react";
import { StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { VideoControlsProps } from "../types";

export const VideoControls = React.memo(
  ({ durationMillis, positionMillis, setPosition }: VideoControlsProps) => {
    return (
      <Slider
        style={styles.slider}
        minimumTrackTintColor={"#fff"}
        maximumTrackTintColor="#8E9092"
        thumbImage={require("../assets/images/slider-thumb-image.png")}
        value={durationMillis ? positionMillis / durationMillis : 0}
        onSlidingComplete={(e) => {
          const position = e * durationMillis;
          setPosition(position);
        }}
      />
    );
  }
);

VideoControls.displayName = "VideoControls";

const styles = StyleSheet.create({
  slider: {
    flex: 1,
  },
});
