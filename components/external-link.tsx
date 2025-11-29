import { Linking, TouchableOpacity, type ComponentProps } from 'react-native';
import { ThemedText } from './themed-text';

type Props = ComponentProps<typeof TouchableOpacity> & { href: string };

export function ExternalLink({ href, children, ...rest }: Props) {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(href);
    if (supported) {
      await Linking.openURL(href);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} {...rest}>
      {typeof children === 'string' ? <ThemedText type="link">{children}</ThemedText> : children}
    </TouchableOpacity>
  );
}
