// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import update from 'immutability-helper';
import moment from 'moment-timezone';
import 'tsiclient';

import './telemetryChart.scss';

// Extend the immutability helper to include object autovivification
update.extend('$auto', (val, obj) => update(obj || {}, val));

export const chartColors = [
  '#01B8AA',
  '#F2C80F',
  '#E81123',
  '#3599B8',
  '#33669A',
  '#26FFDE',
  '#E0E7EE',
  '#FDA954',
  '#FD625E',
  '#FF4EC2',
  '#FFEE91'
];
export const chartColorObjects = chartColors.map(color => ({ color }));

export class TelemetryChart extends Component {

  static telemetryChartCount = 0;

  constructor(props) {
    super(props);

    this.chartId = `telemetry-chart-container-${TelemetryChart.telemetryChartCount++}`;

    this.state = {
      telemetryKeys: [],
      telemetryKey: '',
      renderChart: true
    };

    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);

    this.tsiClient = new window.TsiClient();
  }

  handleWindowBlur = () => this.setState({ renderChart: false });
  handleWindowFocus = () => this.setState({ renderChart: true });

  componentDidMount() {
    this.lineChart = new this.tsiClient.ux.LineChart(document.getElementById(this.chartId));
  }

  componentWillUnmount() {
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  componentWillUpdate({ metrics, theme }, { telemetryKey }) {
    if (metrics) {
      const chartData = this.props.metrics;
      const offset = moment.tz.guess();

      // Set a timeout to allow the panel height to be calculated before updating the graph
      setTimeout(() => {
        if (this && this.state && this.lineChart && this.state.renderChart) {
          this.lineChart.render(
            chartData,
            {
              grid: false,
              legend: 'compact',
              tooltip: true,
              yAxisState: 'shared', // Default to all values being on the same axis
              theme,
              is24HourTime: false,
              offset // offset for all timestamps in minutes or timezone from UTC
            },
            this.props.colors
          );
        }
      }, 10);
    }
  }

  setTelemetryKey = telemetryKey => () => this.setState({ telemetryKey });

  render() {
    return (
      <div className="telemetry-chart-container">
        <div className="chart-container" id={this.chartId} />
      </div>
    );
  }
}
