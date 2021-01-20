// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject } from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { SectionHeader, Svg, ErrorMsg, Indicator } from 'components/shared';
import { svgs } from 'utilities';
import { SimulationService, MetricsService, retryHandler } from 'services';
import { TelemetryChart, chartColorObjects } from './metrics';

import './simulationTile.scss';

const {
  simulationStatusPollingInterval,
  telemetryRefreshInterval,
  maxRetryAttempts,
  retryWaitTime,
  dateTimeFormat
} = Config;

const maxDate = '12/31/9999 11:59:59 PM +00:00';

class SimulationTile extends Component {

  constructor() {
    super();

    this.state = {
      isRunning: false,
      simualtionPollingError: '',
      hubMetricsPollingError: '',
      metrics:[],
    };

    this.emitter = new Subject();
    this.simulationRefresh$ = new Subject();
    this.telemetryRefresh$ = new Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    // Initialize state from the most recent status
    const { simulation: { isActive, id } } = this.props;

    const getSimulationStream = simulationId => SimulationService.getSimulation(simulationId)
      .merge(
        this.simulationRefresh$
          .delay(simulationStatusPollingInterval)
          .flatMap(_ => SimulationService.getSimulation(simulationId))
      )
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));

    this.subscriptions.push(this.emitter
      .switchMap(getSimulationStream)
      .subscribe(
         response => {
          this.setState({
            simulation: response,
            enabled: response.enabled,
            isActive: response.isActive,
            isRunning: response.isRunning,
            totalMessagesSent: response.statistics.totalMessagesSent,
            failedMessagesCount: response.statistics.failedMessagesCount,
            activeDevicesCount: response.statistics.activeDevicesCount,
            averageMessagesPerSecond: response.statistics.averageMessagesPerSecond,
            failedDeviceConnectionsCount: response.statistics.failedDeviceConnectionsCount,
            failedDeviceTwinUpdatesCount: response.statistics.failedDeviceTwinUpdatesCount
          },
          () => {
            if (response.isActive) {
              this.simulationRefresh$.next({ simulationId: response.id });
            }
          });
        },
        simualtionPollingError => this.setState({ simualtionPollingError })
      )
    );

    const getTelemetryStream = simulationId => MetricsService.fetchIothubMetrics(simulationId)
      .merge(
        this.telemetryRefresh$ // Previous request complete
          .delay(telemetryRefreshInterval) // Wait to refresh
          .flatMap(_ => MetricsService.fetchIothubMetrics(simulationId))
      )
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));

    this.subscriptions.push(
      this.emitter
        .switchMap(getTelemetryStream)
        .subscribe(
          (metrics) => {

            this.setState(
              { metrics },
              () => {
                if (this.state.isRunning) {
                  this.telemetryRefresh$.next('r')
                }
              }
            );
          },
          hubMetricsPollingError => this.setState({ hubMetricsPollingError })
        )
    );

    // Start polling
    if (isActive) this.emitter.next(id);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getActiveDevices() {
    const { t } = this.props;

    if (this.state.isRunning) {
      return (
        <div className="active-devices">
          <div className="active-devices-count"> {this.state.activeDevicesCount} </div>
          <div className="active-devices-label"> {t('simulation.status.activeDevicesCount')}</div>
        </div>
      );
    }
  }

  showDeviceCount = (models) => models.map((deviceModelItem, idx) => {
    const { deviceModelEntities } = this.props;
    return (
      <div className="device-model-row" key={`${deviceModelItem.id}-${idx}`}>
        {deviceModelItem.count} {deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}
      </div>
    )
  })

  getDevices(models, maxRows = 8) {
    return models.length <= maxRows ?
      this.showDeviceCount(models) :
      [
        this.showDeviceCount(models.slice(0, maxRows - 1)),
        <div className="device-model-row" key="extra-devices-row"><strong>{` + ${models.slice(maxRows - 1).length} more`}</strong></div>
      ];
  }

  getSimulationState = (endDateTime, t) => {
    const { simualtionPollingError, enabled, isRunning, isActive } = this.state;
    return simualtionPollingError
      ? <div className="simulation-error-container">
          <div>{ t('simulation.status.error') }</div>
          <ErrorMsg>{ simualtionPollingError.message }</ErrorMsg>
        </div>
      : enabled
          ? isRunning
              ? <>
                  <Svg path={svgs.running} className="running-icon" />
                  { t('simulation.status.running') }
                </>
              : isActive
                  ? <>
                      <Indicator size='small' className="setting-up-icon" />
                      { t('simulation.status.settingUp') }
                    </>
                  : t('simulation.status.ended', { endDateTime })
          : t('simulation.status.ended', { endDateTime })
  }

  render() {
    const {
      t,
      simulation: {
        deviceModels,
        id,
        name,
        startTime,
        endTime,
        stopTime,
        statistics
      }
    } = this.props;

    const { isRunning, metrics } = this.state;

    const className = this.state.isRunning ? 'simulation-tile-container active' : 'simulation-tile-container';
    const startDateTime = moment(startTime).format(dateTimeFormat);
    const scheduledEndTime = (!endTime || endTime === maxDate) ? '-' : moment(endTime).format(dateTimeFormat);
    const endDateTime = stopTime ? moment(stopTime).format(dateTimeFormat) : scheduledEndTime;
    return (
      <div className={className}>
        <div className="tile-header">
          <SectionHeader>{ name || id }</SectionHeader>
        </div>
        <div className="tile-body">
          <div className="time-containers">
            <div className="left-time-container">
              { t('simulation.status.created', { startDateTime }) }
            </div>
            <div className="right-time-container">
            { this.getSimulationState(endDateTime, t) }
            </div>
          </div>
          {this.getActiveDevices()}
          {
            isRunning &&
            <TelemetryChart colors={chartColorObjects} metrics={metrics} />
          }
          <div className="simulation-summary">
            <div className="device-model-rows">
              { this.getDevices(deviceModels) }
            </div>
            <div className="telemetry-container">
              <div className="simulation-status-section">
                <div className="messages-per-second">
                  { isRunning
                      ? this.state.averageMessagesPerSecond
                      : statistics.averageMessagesPerSecond
                  }
                </div>
                <div className="messages-per-second-desc">
                  { t('simulation.status.averageMessagesPerSec') }
                </div>
                <div className="total-messages">
                  { t('simulation.status.totalMessagesSentLabel') }
                  { isRunning ? this.state.totalMessagesSent : statistics.totalMessagesSent }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SimulationTile;
