import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { CropPoints } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  points: CropPoints;
  onPointsChange: (points: CropPoints) => void;
  imageWidth: number;
  imageHeight: number;
}

export default function CropOverlay({
  points,
  onPointsChange,
  imageWidth,
  imageHeight,
}: Props) {
  // Shared values for each corner
  const topLeft = useSharedValue({ x: points.topLeft.x, y: points.topLeft.y });
  const topRight = useSharedValue({ x: points.topRight.x, y: points.topRight.y });
  const bottomLeft = useSharedValue({ x: points.bottomLeft.x, y: points.bottomLeft.y });
  const bottomRight = useSharedValue({ x: points.bottomRight.x, y: points.bottomRight.y });

  const CropHandle = ({
    position,
    sharedValue,
  }: {
    position: keyof CropPoints;
    sharedValue: SharedValue<{ x: number; y: number }>;
  }) => {
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        // Update position with constraints
        sharedValue.value = {
          x: Math.max(0, Math.min(imageWidth, event.absoluteX)),
          y: Math.max(0, Math.min(imageHeight, event.absoluteY)),
        };
      })
      .onEnd(() => {
        // Update parent with final position
        const newPoints = { ...points };
        newPoints[position] = {
          x: sharedValue.value.x,
          y: sharedValue.value.y,
        };
        onPointsChange(newPoints);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: withSpring(sharedValue.value.x - 20) },
        { translateY: withSpring(sharedValue.value.y - 20) },
      ],
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            animatedStyle,
            {
              position: 'absolute',
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <View
            className="w-10 h-10 rounded-full border-4 border-white items-center justify-center"
            style={{
              backgroundColor: '#3b82f6',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 8,
            }}
          >
            <Ionicons name="move" size={20} color="#ffffff" />
          </View>
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      pointerEvents="box-none"
    >
      {/* Overlay polygon showing crop area */}
      <Svg
        width={imageWidth}
        height={imageHeight}
        style={{ position: 'absolute' }}
      >
        <Polygon
          points={`
            ${points.topLeft.x},${points.topLeft.y}
            ${points.topRight.x},${points.topRight.y}
            ${points.bottomRight.x},${points.bottomRight.y}
            ${points.bottomLeft.x},${points.bottomLeft.y}
          `}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="3"
        />
      </Svg>

      {/* Corner handles */}
      <CropHandle position="topLeft" sharedValue={topLeft} />
      <CropHandle position="topRight" sharedValue={topRight} />
      <CropHandle position="bottomLeft" sharedValue={bottomLeft} />
      <CropHandle position="bottomRight" sharedValue={bottomRight} />
    </View>
  );
}