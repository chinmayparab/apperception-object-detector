import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera-tflite';
import labels from '../labels.json';
import _ from 'lodash';
let _currentInstant = 0;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      output: '',
    };
  }

  processOutput({data}) {
    const probs = _.map(data, (item) => _.round(item / 255.0, 0.02));
    const orderedData = _.chain(data)
      .zip(labels)
      .orderBy(0, 'desc')
      .map((item) => [_.round(item[0] / 255.0, 2), item[1]])
      .value();
    const outputData = _.chain(orderedData)
      .take(3)
      .map((item) => `${item[1]}: ${item[0]}`)
      .join('\n')
      .value();
    const time = Date.now() - (_currentInstant || Date.now());
    const output = `\n${outputData}\nTime: ${(time / 1000).toFixed(2)} secs`;
    this.setState((state) => ({
      output,
    }));
    _currentInstant = Date.now();
  }

  render() {
    const modelParams = {
      file: 'mobilenet_v1_1.0_224_quant.tflite',
      inputDimX: 224,
      inputDimY: 224,
      outputDim: 1001,
      freqms: 0,
    };

    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={
            'We need your permission to use your camera phone and SPY ON YOU!!!'
          }
          onModelProcessed={(data) => this.processOutput(data)}
          modelParams={modelParams}>
          <Text style={styles.cameraText}>
            {this.state.output.toUpperCase()}
          </Text>
        </RNCamera>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraText: {
    padding: 20,
    color: 'black',
    backgroundColor: 'white',
    opacity: 0.8,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
