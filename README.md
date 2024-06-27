# react-native-reels-list

`react-native-reels-list` is a customizable React Native component designed to provide an intagram/tiktok like optimized video list experience. It offers a variety of features and options to ensure smooth and efficient video playback in your React Native applications.

## Features

- Optimized video list for smooth performance
- Customizable video height
- Tap to mute functionality
- Seekbar support
- Loading indicator
- Overlay components
- Hold to pause functionality

## Installation

Install the package via npm:

```sh
npm install react-native-reels-list
```

or via yarn:

```sh
yarn add react-native-reels-list
```

## Usage

Here's an example of how to use the `ReelsList` component in your React Native application:

```jsx
import { useCallback, useContext } from "react";
import { VIEWPORT_HEIGHT } from "@/constants";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import ReelsList, { VideoItemType } from "react-native-reels-list";
import { MuteContext } from "@/context";

const videos = [
  { key: '1', uri: 'https://example.com/video1.mp4', thumbnail: 'https://example.com/thumbnail1.jpg', ...otherProperties},
  { key: '2', uri: 'https://example.com/video2.mp4', thumbnail: 'https://example.com/thumbnail4.jpg', ...otherProperties},
  // Add more videos as needed
];

const App = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { isMuted, handleMuteToggle } = useContext(MuteContext);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videoHeight = VIEWPORT_HEIGHT - tabBarHeight;

 const onViewableItemsChanged = useCallback(
    (info: {
      viewableItems: ViewToken<VideoItemType>[];
      changed: ViewToken<VideoItemType>[];
    }) => {
      setCurrentVideoIndex(
        (prev) => info.changed.find((item) => item.isViewable)?.index ?? prev
      );
    },
    []
  );

  const handleGetItemLayout = useCallback(
    (data: ArrayLike<VideoItemType> | null | undefined, index: number) => {
      return {
        length: videoHeight,
        offset: videoHeight * index,
        index,
      };
    },
    [videoHeight]
  );

   const overlayComponent = useCallback(
    ({ item }: { item: VideoItemType }) => (
      // Custom overlay component for each video item. Add your custom UI with position: 'absolute' here.
      <View style={styles.overlay}>
        <Link href={`/profile/${item.username}`} asChild>
          <Pressable>
            <Text>@{item.username}</Text>
          </Pressable>
        </Link>
      </View>
    ),
    []
  );

  return (
    <ReelsList
      videoHeight={videoHeight}
      currentVideoIndex={currentVideoIndex}
      handleGetItemLayout={handleGetItemLayout}
      onViewableItemsChanged={onViewableItemsChanged}
      videos={videos}
      isMuted={isMuted}
      handleMuteToggle={handleMuteToggle}
      showSeekbar={true}
      showLoadingIndicator={true}
      holdToPause={true}
      overlayComponent={overlayComponent}
      refreshing={refreshing}
      onRefresh={() => {
        // Refresh the video list
      }}
      onEndReached={() => {
        // Fetch more videos
      }}
    />
  );
};

export default FollowingTopTab;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay:{
    position: "absolute",
    bottom: 40,
    left: 8,
    zIndex: 2,
  }
});

export default App;
```

## Props

The `ReelsList` component accepts the following props:

- `currentVideoIndex` (number): The index of the current video being played.
- `initialVideoIndex` (number, optional): The initial video index to start playback from.
- `handleGetItemLayout` (function): Function to get the layout of each item in the list.
- `onViewableItemsChanged` (function): Callback function when viewable items change.
- `videos` (array): Array of video items to be displayed in the list.
- `videoHeight` (number): Height of each video in the list.
- `isMuted` (boolean, optional): Flag to mute/unmute videos. Default is `false`.
- `handleMuteToggle` (function, optional): Callback function to handle mute toggle.
- `showSeekbar` (boolean, optional): Flag to show/hide the seekbar. Default is `false`.
- `showLoadingIndicator` (boolean, optional): Flag to show/hide the loading indicator. Default is `false`.
- `useNativeControls` (boolean, optional): Flag to use native video controls. Default is `false`.
- `overlayComponent` (function, optional): Function to render a custom overlay component for each video.
- `holdToPause` (boolean, optional): Flag to enable hold-to-pause functionality. Default is `false`.
- `bottomOffset` (number, optional): Offset from the bottom of the screen for additional UI flexibility.
- Additionally, the component accepts all other FlatList props for added customizations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Author

Developed by [Simranjit Singh](https://github.com/Simranjits11/).

## Acknowledgments

Special thanks to all the contributors and the React Native community for their support and inspiration.
