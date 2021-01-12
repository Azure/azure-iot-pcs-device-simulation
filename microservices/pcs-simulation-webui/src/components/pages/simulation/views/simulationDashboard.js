// Copyright (c) Microso;ft. All rights reserved.

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import Config from 'app.config';

import { Btn, PageContent, ContextMenu, SectionHeader } from 'components/shared';
import { NewSimulation } from '../flyouts';
import { svgs, humanizeDuration } from 'utilities';
import SimulationTile from './simulationTile';
import { SimulationsGrid } from './simulationsGrid';

import './simulationDashboard.scss';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceModelId: undefined
};

const newSimulationFlyout = 'new-simulation';
const dateTimeFormat = Config.dateTimeFormat;

export class SimulationDashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      ...closedFlyoutState,
      showAll: false,
      contextBtns: null
    };
  }

  componentDidMount() {
    const { state = {} } = this.props.location;
    this.setState({ ...state });
    this.props.fetchSimulationList();
  }

  componentWillReceiveProps({ location }) {
    const { state = {} } = location;
    this.setState({ ...state });
  }

  openFlyout = (flyoutName) => () => this.setState({ openFlyoutName: flyoutName });

  closeFlyout = () => this.setState(closedFlyoutState);

  openNewSimulationFlyout = () => {
    this.setState({ flyoutOpen: newSimulationFlyout })
  };

  onSoftSelectChange = ({ id }) => this.props.history.push(`/simulations/${id}`)

  onContextMenuChange = contextBtns => this.setState({
    contextBtns,
    flyoutOpen: false
  });

  toggleDashboardView = contextBtns => this.setState({
    contextBtns,
    showAll: !this.state.showAll
  });

  getSoftSelectId = ({ id }) => id;

  toSimulationGridModel = (input = []) => input.map(
    (simulation = {}) => {
      const { t, deviceModelEntities } = this.props;
      const stopTime = simulation.stopTime || simulation.endTime;
      return ({
        status: simulation.isRunning ? t('simulation.status.running') : t('simulation.status.stopped'),
        startTime: moment(simulation.startTime).format(dateTimeFormat),
        endTime: simulation.isRunning ? '' : moment(stopTime).format(dateTimeFormat),
        duration: simulation.isRunning ? '' : humanizeDuration(moment.duration((moment(stopTime)).diff(moment(simulation.startTime)))),
        id: simulation.id,
        name: simulation.name,
        totalMessages: simulation.statistics.totalMessagesCount,
        averageMessages: simulation.statistics.averageMessagesPerSecond,
        deviceModels: (simulation.deviceModels || [])
          .map(dm =>
              (dm.count + ' ' + (deviceModelEntities && deviceModelEntities[dm.id] ? (deviceModelEntities[dm.id]).name : '-')))
              .join ('; '),
        totalDevices: (simulation.deviceModels || []).reduce ((total, obj) => { return total + obj['count']; }, 0)
      });
    }
  );

  render() {
    const { t, simulationList = [], deviceModelEntities } = this.props;
    const gridProps = {
      rowData: this.toSimulationGridModel(simulationList || []),
      onSoftSelectChange: this.onSoftSelectChange,
      t
    };
    const newSimulationFlyoutOpen = this.state.flyoutOpen === newSimulationFlyout;

    const activeSimulationsList = simulationList.filter(({isActive}) => isActive);
    const isActive = activeSimulationsList.length > 0;
    const maxCount = isActive ? 6 : 9;
    const pastSimulationsList = simulationList.filter(sim => !sim.isActive).slice(0, maxCount);
    const className = isActive ? 'simulation-tile-link twoCol' : 'simulation-tile-link threeCol';

    return [
      <ContextMenu key="context-menu">
        <Btn className="new-simulation-btn" svg={svgs.plus} onClick={this.openNewSimulationFlyout} disabled={isActive}>
          { t('simulation.newSim') }
        </Btn>
      </ContextMenu>,
      <PageContent className="simulation-dashboard-container" key="page-content">
        <SectionHeader className="dashboard-header">
          {t('header.simulationsDashboard')}
          <Btn className="toggle-view-button" onClick={this.toggleDashboardView}>
            {!this.state.showAll ? t('simulation.showAll') : t('simulation.showDashboard')}
          </Btn>
        </SectionHeader>

        {
          !this.state.showAll ?
          <div className="simulation-containers">
              {
                activeSimulationsList.length > 0 &&
                <div className="active-simulations">
                  {
                    activeSimulationsList.map(sim =>
                      <NavLink className="simulation-tile-link oneCol" to={`/simulations/${sim.id}`} key={sim.id}>
                        <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                      </NavLink>
                    )
                  }
                </div>
            }
            <div className="past-simulations">
            {
                pastSimulationsList.map(sim =>
                <NavLink className={className} to={`/simulations/${sim.id}`} key={sim.id}>
                  <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                </NavLink>
              )
            }
            </div>
          </div>
          : <SimulationsGrid {...gridProps} />
        }
        {
          newSimulationFlyoutOpen &&
          <NewSimulation onClose={this.closeFlyout} {...this.props} />
        }

      </PageContent>
    ];
  }
}
