// iOS version - using Unicode symbols
import { OpaqueColorValue, Text, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, string>;

const MAPPING: IconMapping = {
  'house.fill': '🏠',
  'paperplane.fill': '✈️',
  'chevron.left.forwardslash.chevron.right': '</>',
  'chevron.right': '›',
};

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color as string,
        },
        style,
      ]}>
      {MAPPING[name]}
    </Text>
  );
}
