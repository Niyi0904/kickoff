import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND, TEXT_COLOR } from '../theme';

export const LoadingView = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    borderColor: CARD_BACKGROUND,
  },
  text: { 
    color: TEXT_COLOR, 
    fontSize: 13, 
    fontWeight: '600' 
  },
});
