// Fallback for using Unicode symbols on Android and web.

import { OpaqueColorValue, Text, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, string>;

/**
 * Add your SF Symbols to Unicode symbol mappings here.
 * Using Unicode symbols for cross-platform compatibility without external dependencies.
 */
const MAPPING: IconMapping = {
  'house.fill': '🏠',
  'paperplane.fill': '✈️',
  'chevron.left.forwardslash.chevron.right': '</>',
  'chevron.right': '›',
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses Unicode symbols for cross-platform compatibility.
 * Icon `name`s are based on SF Symbols and mapped to Unicode equivalents.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
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
