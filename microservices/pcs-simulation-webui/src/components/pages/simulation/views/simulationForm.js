// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Config from 'app.config';
import { svgs, LinkedComponent, Validator, int } from 'utilities';
import {
  Btn,
  BtnToolbar,
  ErrorMsg,
  FormActions,
  FormControl,
  FormGroup,
  FormLabel,
  FormSection,
  Radio,
  SectionDesc,
  SectionHeader,
  Svg,
  Tooltip
} from 'components/shared';

import { SimulationService } from 'services';

import './simulationForm.scss';

const newDeviceModel = () => ({
  name: '',
  count: 0,
  messageThroughput: '',
  interval: {}
});

const isIntRegex = /^-?\d*$/;
const nonInteger = x => !x.match(isIntRegex);
const stringToInt = x => x === '' || x === '-' ? x : int(x);

class SimulationForm extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      connectionStrFocused: false,
      preprovisionedIoTHub: true,
      preProvisionedRadio: '',
      iotHubString: '',
      iotHubSku: 'S2',
      iotHubUnits: 1,
      duration: {},
      durationRadio: 'indefinite',
      frequency: {},
      deviceModelOptions: [],
      deviceModel: '',
      deviceModels: [],
      errorMessage: '',
      devicesDeletionRequired: false,
      autoscaleAcknowledged: false,
      formSubmitted: false
    };

    this.subscriptions = [];

    // State to input links
    const simulationNameMaxLength = Config.formFieldMaxLength;
    const simulationDescMaxLength = Config.formDescMaxLength;
    const minimumDurationInMinutes = 5;

    this.name = this.linkTo('name')
      .check(x => Validator.notEmpty(x === '-' ? '' : x), () => this.props.t('simulation.form.errorMsg.nameCantBeEmpty'))
      .check(x => x.length < simulationNameMaxLength, () => this.props.t('simulation.form.errorMsg.nameGTMaxLength', { simulationNameMaxLength }));

    this.description = this.linkTo('description')
      .check(x => x.length < simulationDescMaxLength, () => this.props.t('simulation.form.errorMsg.descGTMaxLength', { simulationDescMaxLength }));

    this.iotHubString = this.linkTo('iotHubString')
      .check(Validator.notEmpty, () => props.t('simulation.form.errorMsg.hubNameCantBeEmpty'));

    this.iotHubSku = this.linkTo('iotHubSku')
      .check(Validator.notEmpty, () => this.props.t('simulation.form.errorMsg.invalidHubSku'));

    this.iotHubUnits = this.linkTo('iotHubUnits')
      .check(x => (x > 0 && x <= 10), () => this.props.t('simulation.form.errorMsg.invalidHubUnits'));

    this.deviceModel = this.linkTo('deviceModel')
      .check(Validator.notEmpty, () => props.t('simulation.form.errorMsg.deviceModelIsRequired'));

    this.duration = this.linkTo('duration')
      .check(({ ms }) => ms >= minimumDurationInMinutes * 60 * 1000, () => props.t('simulation.form.errorMsg.valueLTMinDuration', { minimumDurationInMinutes }));

    this.targetHub = this.linkTo('preProvisionedRadio')
      .check(Validator.notEmpty)
      .check(value => (value === 'customString' && !this.iotHubString.error) || value === 'preProvisioned');

    this.durationRadio = this.linkTo('durationRadio')
      .check(Validator.notEmpty)
      .check(value => (value === 'endIn' && !this.duration.error) || value === 'indefinite');

    this.sensorLink = this.linkTo('sensors');
    this.deviceModelsLink = this.linkTo('deviceModels');
  }

  formIsValid() {
    return [
      this.name,
      this.description,
      this.targetHub,
      this.durationRadio
    ].every(link => !link.error);
  }

  componentDidMount() {
    this.getFormState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getFormState(nextProps);
  }

  componentDidUpdate(prevProps, prevState) {
    const { deviceModels: prevModels } = prevState;
    const { deviceModels } = this.state;

    // Populate telemetry interval for each device model
    deviceModels.forEach(({ name }, index) => {
      if (name !== ((prevModels || [])[index] || {}).name) {
        this.setTelemetryFrequency(name, index);
      }
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getFormState = (props) => {
    const {
      deviceModels,
      preprovisionedIoTHub
    } = props;
    const deviceModelOptions = (deviceModels || [])
      .map(this.toSelectOption)
      .sort((a, b) => a.label.localeCompare(b.label));
    const preProvisionedRadio = preprovisionedIoTHub ? 'preProvisioned' : 'customString';

    this.setState({
      deviceModelOptions,
      preProvisionedRadio,
      preprovisionedIoTHub
    });
  }

  toDeviceModelReplicable = ({ id, count, interval }) => ({
    name: id,
    count,
    interval: this.toTelemetryInterval(interval)
  })

  setTelemetryFrequency = (name, idx) => {
    const { deviceModelEntities } = this.props;
    const { deviceModels } = this.state;

    if (!name || !deviceModelEntities) return;

    const timespan = this.props.deviceModelEntities[name].simulation.Interval || '00:00:00';
    const interval = this.toTelemetryInterval(timespan);

    this.setState({
      deviceModels: deviceModels.map((model, index) =>
        (index === idx) ? { ...model, interval } : model)
    });
  }

  toTelemetryInterval = timespan => {
    const duration = moment.duration(timespan);
    return {
      ms: duration.asMilliseconds(),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds()
    };
  }

  getMessageThrottlingLimit = hubSku => {
    switch (hubSku) {
      case 'S1':
        return Config.iotHubRateLimits.s1.deviceMessagesPerSecond;
      case 'S2':
        return Config.iotHubRateLimits.s2.deviceMessagesPerSecond;
      case 'S3':
        return Config.iotHubRateLimits.s3.deviceMessagesPerSecond;
      default:
        return Config.iotHubRateLimits.s2.deviceMessagesPerSecond;
    }
  }

  inputOnBlur = () => this.setState({ connectionStrFocused: false })

  inputOnFocus = () => this.setState({ connectionStrFocused: true })

  toSelectOption = ({ id, name, simulation: { Interval = {} } = {}  }) => ({ value: id, label: name || id, interval: Interval });

  convertDurationToISO = ({ hours, minutes, seconds }) => `NOW+PT${hours}H${minutes}M${seconds}S`;

  toggleBulkDeletionCheckBox = () => this.setState({ devicesDeletionRequired: !this.state.devicesDeletionRequired });

  toggleAutoscaleAckownledgeCheckBox = () => this.setState({ autoscaleAcknowledged: !this.state.autoscaleAcknowledged });

  apply = (event) => {
    event.preventDefault();
    const {
      name,
      description,
      durationRadio,
      duration,
      deviceModels,
      iotHubString,
      iotHubSku,
      iotHubUnits,
      preProvisionedRadio,
      devicesDeletionRequired
    } = this.state;

    const simulationDuration = {
      startTime: 'NOW',
      endTime: (durationRadio === 'endIn') ? this.convertDurationToISO(duration) : ''
    };

    const modelUpdates = {
      name,
      description,
      enabled: true,
      iotHubs: [{
        connectionString: preProvisionedRadio === 'preProvisioned' ? '' : iotHubString,
        iotHubSku,
        iotHubUnits
      }],
      deviceModels,
      ...simulationDuration,
      devicesDeletionRequired
    };

    this.setState(
      { formSubmitted: true },
      () => this.subscriptions.push(SimulationService.createSimulation(modelUpdates)
        .subscribe(
          ({ id }) => {
            this.props.history.push(`/simulations/${id}`);
            this.props.onClose();
          },
          error => this.setState({ error: error.message })
        )
      )
    );
  };

  addDeviceModel = () => this.deviceModelsLink.set([ ...this.deviceModelsLink.value, newDeviceModel() ]);

  deleteDeviceModel = (index) =>
    () => this.deviceModelsLink.set(this.deviceModelsLink.value.filter((_, idx) => index !== idx));

  render () {
    const { t } = this.props;
    const { deviceModels, devicesDeletionRequired, autoscaleAcknowledged, formSubmitted } = this.state;
    const connectStringInput = (
      <FormControl
        className="long"
        type={this.state.connectionStrFocused ? 'text' : 'password'}
        onBlur={this.inputOnBlur}
        onFocus={this.inputOnFocus}
        link={this.iotHubString}
        placeholder="Enter IoT Hub connection string" />
    );

    const deviceModelLinks = this.deviceModelsLink.getLinkedChildren((deviceModelLink, idx) => {
      const maxSimulatedDevices = global.DeploymentConfig.maxDevicesPerSimulation;
      const currentDevicesCount = deviceModels.reduce(
        (sum, {count = 0}) => sum + count,
        0
      );

      // TODO: remove when service support duplicate device models
      const selectedDeviceModels = {};
      for (let i=0; i < deviceModels.length; i++) {
        const name = deviceModels[i].name;
        if (!selectedDeviceModels[name]) {
          selectedDeviceModels[name] = 0;
        }
        selectedDeviceModels[name]++;
      }

      const name = deviceModelLink.forkTo('name')
        .check(x => selectedDeviceModels[x] < 2, t('simulation.form.errorMsg.duplicateModelsNotAllowed'))
        .check(Validator.notEmpty, t('simulation.form.errorMsg.deviceModelNameCantBeEmpty'));

      const count = deviceModelLink.forkTo('count')
        .reject(nonInteger)
        .map(stringToInt)
        .check(x => Validator.notEmpty(x === '-' ? '' : x), t('simulation.form.errorMsg.countCantBeEmpty'))
        .check(num => num > 0, t('simulation.form.errorMsg.countShouldBeGTZero'))
        .check(_ => currentDevicesCount <= maxSimulatedDevices, t('simulation.form.errorMsg.countShouldBeLTMax', { maxSimulatedDevices }));

      const minTelemetryInterval = global.DeploymentConfig.minTelemetryInterval;
      const interval = deviceModelLink.forkTo('interval')
        .check(({ ms }) => ms >= minTelemetryInterval, t('simulation.form.errorMsg.frequencyCantBeLessThanMinTelemetryInterval', { interval: minTelemetryInterval / 1000 }));

      const edited = !(!name.value && !count.value);
      const error = (edited && (name.error || count.error));

      return { name, count, interval, edited, error };
    });

    const editedDeviceModel = deviceModelLinks.filter(({ edited }) => edited);
    const someDeviceModelLinksHasErrors = editedDeviceModel.some(({ error }) => !!error);
    const deviceModelsHaveError = (deviceModelLinks.length === 0 || someDeviceModelLinksHasErrors);
    const deviceModelHeaders = [
      t('simulation.form.deviceModels.name'),
      t('simulation.form.deviceModels.count'),
      t('simulation.form.deviceModels.throughput'),
      t('simulation.form.deviceModels.duration')
    ];

    const totalDevicesCount = deviceModels.reduce((sum, { count = 0 }) => sum + count, 0);
    const messageThrottlingLimit = this.getMessageThrottlingLimit(this.state.iotHubSku) * this.state.iotHubUnits;
    const requiredVMsCount = Math.ceil( totalDevicesCount / Config.maxDevicesPerVM);
    const additionalVMsRequired = totalDevicesCount > Config.maxDevicesPerVM;
    const autoscaleAcknowledgedRequired = additionalVMsRequired
      ? autoscaleAcknowledged ? false : true
      : false;

    return (
      <form onSubmit={this.apply}>
        <FormSection>
          <SectionHeader>{ t('simulation.name') }</SectionHeader>
          <FormGroup className="simulation-name-box">
            <FormControl className="long" type="text" placeholder={ t('simulation.namePlaceholderText') } link={this.name} onBlur={this.inputOnBlur} onFocus={this.inputOnFocus} />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionHeader>{ t('simulation.description') }</SectionHeader>
          <FormGroup className="simulation-description-box">
            <FormControl className="long" type="textarea" rows="4" placeholder={ t('simulation.descPlaceholderText') } link={this.description} onBlur={this.inputOnBlur} onFocus={this.inputOnFocus} />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionHeader>{ t('simulation.form.duration.header') }</SectionHeader>
          <SectionDesc>{ t('simulation.form.duration.description') }</SectionDesc>
          <Radio link={this.durationRadio} value="endIn">
            <FormLabel>{ t('simulation.form.duration.endsInBtn') }</FormLabel>
            <FormControl type="duration" link={this.duration} />
          </Radio>
          <Radio link={this.durationRadio} value="indefinite">
            { t('simulation.form.duration.runIndefinitelyBtn') }
          </Radio>
        </FormSection>

        <FormSection>
          <SectionHeader>{ t('simulation.form.deviceModels.header') }</SectionHeader>
          <SectionDesc>{ t('simulation.form.deviceModels.description') }</SectionDesc>
          <div className="device-models-container">
          {
            deviceModels.length > 0 &&
              <div className="device-model-headers">
                {
                  deviceModelHeaders.map((header, idx) => (
                    <div className="device-model-header" key={idx}>{header}</div>
                  ))
                }
              </div>
          }
          {
            deviceModelLinks.map(({ name, count, interval, edited, error }, idx) => {
              let throughput = 0;
              const maxDevicesPerSimulation = global.DeploymentConfig.maxDevicesPerSimulation;

              if (count.value && interval.value.ms) {
                throughput = (count.value * 1000) / interval.value.ms;
              }

              return (
                <div className="device-model-row" key={idx}>
                  <FormGroup className="device-model-box">
                    <FormControl
                      className="long"
                      type="select"
                      options={this.state.deviceModelOptions}
                      link={name}
                      clearable={false}
                      searchable={true}
                      simpleValue={true}
                      placeholder="Select model" />
                  </FormGroup>
                  <FormGroup className="device-model-box">
                    <FormControl
                      className="short"
                      type="text"
                      link={count}
                      max={maxDevicesPerSimulation} />
                  </FormGroup>
                  <FormGroup className="device-model-box">
                    <FormControl
                      className="short"
                      type="text"
                      readOnly
                      value={throughput} />
                  </FormGroup>
                  <FormGroup className="duration-box">
                    <FormControl
                      type="duration"
                      name="frequency"
                      link={interval}
                      showHeaders={false} />
                  </FormGroup>
                  <Btn
                    className="delete-device-model-btn"
                    svg={svgs.trash}
                    onClick={this.deleteDeviceModel(idx)} />
                </div>
              );
            })
        }
        </div>
        {
          deviceModels.length < 10 &&
            <Btn
              svg={svgs.plus}
              onClick={this.addDeviceModel}>
              { t('simulation.form.deviceModels.addDeviceModelBtn') }
            </Btn>
        }
        </FormSection>

        <FormSection>
          <SectionHeader>{ t('simulation.form.targetHub.header') }</SectionHeader>
          <SectionDesc>{ t('simulation.form.targetHub.description') }</SectionDesc>
          {
            this.state.preprovisionedIoTHub
            ? <div>
              <Radio link={this.targetHub} value="preProvisioned">
                { t('simulation.form.targetHub.usePreProvisionedBtn') }
              </Radio>
              <Radio link={this.targetHub} value="customString">
                {connectStringInput}
              </Radio>
            </div>
            : connectStringInput
          }

          <SectionDesc className="hub-sku-desc">
            { t('simulation.form.targetHub.sku.description') }
            <Link
              className="learn-more"
              target="_blank"
              to="//docs.microsoft.com/azure/iot-hub/iot-hub-devguide-quotas-throttling">
              { t('simulation.form.targetHub.sku.learnMore') }
            </Link>
          </SectionDesc>

          <div>
            <div className="hub-sku-radios">
              <Radio link={this.iotHubSku} value="S1">
                { t('simulation.form.targetHub.sku.s1') }
              </Radio>
              <Radio link={this.iotHubSku} value="S2">
                { t('simulation.form.targetHub.sku.s2') }
              </Radio>
              <Radio link={this.iotHubSku} value="S3">
                { t('simulation.form.targetHub.sku.s3') }
              </Radio>
            </div>
            <FormLabel className="hub-units-desc">{ t('simulation.form.targetHub.sku.unitsLabel') }</FormLabel>
            <FormGroup className="hub-units-box">
              <FormControl
                className="short"
                type="text"
                link={this.iotHubUnits}
                max={10} />
              <div className="warning-box">
                <FormLabel className="warning-label">{ t('simulation.form.targetHub.sku.warningLabel') }</FormLabel>
                <FormLabel className="warning-desc">{ t('simulation.form.targetHub.sku.warningMessage', { messageThrottlingLimit })}</FormLabel>
              </div>
            </FormGroup>
           </div>

        </FormSection>

        <FormSection className="bulk-deletion-container">
          <div className="checkbox-container" onClick={this.toggleBulkDeletionCheckBox}>
            { t('simulation.form.deleteDevicesWhenSimulationEnds') }
            <input
              type="checkbox"
              name="isChecked"
              onChange={this.toggleBulkDeletionCheckBox}
              checked={devicesDeletionRequired} />
            <span className="checkmark"></span>
          </div>
          <Tooltip message={ t('simulation.form.tooltip.bulkDeletion') } position={'top'}>
            <Svg path={svgs.infoBubble} className="tooltip-trigger-icon" />
          </Tooltip>
        </FormSection>

        <FormActions>
          {
            this.state.error ? <ErrorMsg> {this.state.error}</ErrorMsg> : ''
          }
          {
            additionalVMsRequired &&
            <div className="autoscale-ackownledge-container">
              <div className="checkbox-container">
                { t('simulation.form.autoScaleAcknowledgement', { totalDevicesCount, additionVMsCount: requiredVMsCount - 1 }) }
                <Link
                  className="learn-more"
                  target="_blank"
                  to="//azure.microsoft.com/en-us/pricing/calculator/">
                  { t('simulation.form.learnMore') }
                </Link>
                <input
                  type="checkbox"
                  name="autoscaleAcknowledged"
                  onChange={this.toggleAutoscaleAckownledgeCheckBox}
                  checked={autoscaleAcknowledged} />
                <span className="checkmark"></span>
              </div>
            </div>
          }
          <BtnToolbar>
            <Btn
              svg={svgs.startSimulation}
              type="submit"
              className="apply-btn"
              disabled={!this.formIsValid() || deviceModelsHaveError || autoscaleAcknowledgedRequired || formSubmitted}>
                { t('simulation.start') }
            </Btn>
          </BtnToolbar>
        </FormActions>
      </form>
    );
  }
}

export default SimulationForm;
