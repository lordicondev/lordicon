import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import IconClick from './icon-click';
import IconLoop from './icon-loop';
import IconOnce from './icon-once';
import IconTrash from './icon-trash';

export default function App() {    
  return (
    <View style={styles.container}>

      <View style={styles.row}>
        <IconOnce/>
        <IconLoop/>
      </View>

      <View style={styles.row}>
        <IconClick/>
        <IconTrash/>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  row: {
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonContainer: {
    backgroundColor: '#08c18a', borderRadius: 10, paddingHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 24,
    padding: 10,
  },
});
