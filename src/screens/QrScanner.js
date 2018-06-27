// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar, Alert } from 'react-native';
import { CameraKitCameraScreen } from 'react-native-camera-kit';
import { Subscribe } from 'unstated';
import ScannerStore from '../stores/ScannerStore';
import AccountsStore from '../stores/AccountsStore';
import colors from '../colors';

export default class Scanner extends Component {
  static navigationOptions = {
    title: 'Transaction Details',
    headerBackTitle: 'Scanner'
  };

  render() {
    return (
      <Subscribe to={[ScannerStore, AccountsStore]}>
        {(scannerStore, accountsStore) => {
          return (
            <QrScannerView
              navigation={this.props.navigation}
              scannerStore={scannerStore}
              onReadQRCode={async e => {
                console.log(e);
                const txRequestData = e.nativeEvent.qrcodeStringValue;
                if (scannerStore.isBusy()) {
                  return;
                }
                try {
                  const data = JSON.parse(txRequestData.data);
                  if (!(await scannerStore.setTXRequest(data, accountsStore))) {
                    return;
                  } else {
                    this.props.navigation.navigate('TxDetails');
                  }
                } catch (e) {
                  Alert.alert('Unable to parse transaction', e.message, [
                    {
                      text: 'Try again',
                      onPress: () => {
                        scannerStore.cleanup();
                      }
                    }
                  ]);
                }
              }}
            />
          );
        }}
      </Subscribe>
    );
  }
}

export class QrScannerView extends Component {
  constructor(props) {
    super(props);
    this.setBusySubscription = null;
    this.setReadySubscription = null;
  }

  static propTypes = {
    onReadQRCode: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setBusySubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.props.scannerStore.setReady();
      }
    );
    this.setReadySubscription = this.props.navigation.addListener(
      'didBlur',
      () => {
        this.props.scannerStore.setBusy();
      }
    );
  }

  componentWillUnmount() {
    this.setBusySubscription.remove();
    this.setReadySubscription.remove();
  }

  render() {
    if (this.props.scannerStore.isBusy()) {
      return <View style={styles.inactive} />;
    }
    return (
      <CameraKitCameraScreen
        actions={{ rightButtonText: 'Done', leftButtonText: 'Cancel' }}
        onBottomButtonPressed={(event) => this.onBottomButtonPressed(event)}
        showFrame={true}
        scanBarcode={true}
        laserColor={"blue"}
        surfaceColor={"black"}
        frameColor={"yellow"}
        onReadCode={((event) => this.setState({ example: CheckingScreen }))}
        hideControls={true}
        // offsetForScannerFrame = {10}
        // heightForScannerFrame = {300}
        colorForScannerFrame={'blue'}
      />
    );
  }

  renderRects() {
    return (
      <View style={styles.body}>
        <View style={styles.top} />
        <View style={styles.middle}>
          <View style={styles.middleLeft} />
          <View style={styles.middleCenter} />
          <View style={styles.middleRight} />
        </View>
        <View style={styles.bottom}>
          {/* <Text style={styles.descTitle}>Scan QR Code</Text>
          <Text style={styles.descSecondary}>To Sign a New Transaction</Text> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inactive: {
    backgroundColor: colors.bg,
    padding: 20,
    flex: 1,
    flexDirection: 'column'
  },
  view: {
    flex: 1,
    backgroundColor: 'black'
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent'
  },
  top: {
    flexBasis: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  middle: {
    flexBasis: 250,
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  middleLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  middleCenter: {
    flexBasis: 250,
    backgroundColor: 'transparent'
  },
  middleRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  bottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  titleTop: {
    color: colors.bg_text,
    fontSize: 26,
    fontFamily: 'Manifold CF',
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'center'
  },
  descTitle: {
    color: colors.bg_text,
    fontSize: 18,
    fontFamily: 'Manifold CF',
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'center'
  },
  descSecondary: {
    color: colors.bg_text,
    fontSize: 14,
    fontFamily: 'Manifold CF',
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'center'
  }
});
