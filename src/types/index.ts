import { AVPlaybackStatus } from "expo-av";
import { ReactNode } from "react";
import { FlatListProps } from "react-native";

export type VideoItemType = {
  source: string;
  thumbnail: string;
  key: string;
  [key: string]: any;
};

export type ReelsListProps = {
  currentVideoIndex: number;
  initialVideoIndex?: number;
  handleGetItemLayout: FlatListProps<VideoItemType>["getItemLayout"];
  onViewableItemsChanged: FlatListProps<VideoItemType>["onViewableItemsChanged"];
  videos: VideoItemType[];
  videoHeight: number;
  isMuted?: boolean;
  handleMuteToggle?: () => void;
  showSeekbar?: boolean;
  showLoadingIndicator?: boolean;
  useNativeControls?: boolean;
  overlayComponent?: ({
    item,
    index,
  }: {
    item: VideoItemType;
    index: number;
  }) => ReactNode;
  holdToPause?: boolean;
} & Omit<FlatListProps<VideoItemType>, "renderItem" | "data">;

export type VideoPlayerHandler = {
  pause: () => Promise<void>;
  unload: () => Promise<void>;
  status: AVPlaybackStatus | undefined;
};

export type VideoPlayerItemProps = {
  videoDetails: VideoItemType;
  index: number;
  currentVideoIndex: number;
  videoHeight: number;
  isMuted?: boolean;
  handleMuteToggle?: () => void;
  showSeekbar?: boolean;
  showLoadingIndicator?: boolean;
  useNativeControls?: boolean;
  overlayComponent?: ReactNode;
  holdToPause?: boolean;
};

export type VideoControlsProps = {
  positionMillis: number;
  durationMillis: number;
  setPosition: (position: number) => void;
};
