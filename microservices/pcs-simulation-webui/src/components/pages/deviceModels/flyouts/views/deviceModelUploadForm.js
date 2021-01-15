// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { isEqual, isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { DeviceModelScriptsService } from 'services';
import { svgs } from 'utilities';
import { Svg, FileUpload } from 'components/shared';
import {
  Btn,
  BtnToolbar,
  ErrorMsg,
  FormActions,
  FormGroup,
  FormLabel,
  FormSection,
  Indicator
} from 'components/shared';

import './deviceModelForm.scss';

const initialFormState = {
  deviceModel: undefined,
  scripts: [],
  missingScripts: [],
  validationResults: {},
  error: undefined
};

class DeviceModelUploadForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialFormState,
      formVersion: 0
    };

    this.fileInputRef = React.createRef();
    this.singleFileInputRef = React.createRef();
    this.subscriptions = [];
  }

  validateScripts () {
    const { scripts, validationResults } = this.state;

    Observable.from(scripts)
      .filter(script => !validationResults[script.name])
      .flatMap(file =>
        DeviceModelScriptsService.validateDeviceModelScript(file)
          .map(validationResult => ({
            fileName: file.name,
            validationResult : validationResult
          }))
          .catch(error => {
            const { ajaxError: { response: { Messages = [] } } = { response: {} } } = error;

            return Observable.of({
              fileName: [file.name],
              validationResult: {
                isValid: false,
                messages: [Messages]
              }
            });
          })
      )
      .reduce((acc, { fileName, validationResult }) => ({
        ...acc, [fileName]: validationResult
      }), {})
      .subscribe(updatedValidationState => {
        this.setState({
          validationResults: {
            ...this.state.validationResults,
            ...updatedValidationState
          }
        });
      });

  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  uploadFiles = e => {
    e.preventDefault();
    this.clearAll();
    const { target: value } = e;
    const { t } = this.props;

    this.filesSanityCheck(Object.values((value || {}).files || {}), t).subscribe(
      ({ deviceModel, scriptFiles, error, jsonFile, missingScripts }) => {
        this.setState({
          error,
          deviceModel,
          jsonFile,
          missingScripts: (missingScripts || []).map(fileName => ({ fileName })),
          scripts: (scriptFiles || []),
          validationResults: {}
        }, () => this.validateScripts());
      },
      error => this.setState({ error })
    );
  };

  filesSanityCheck = (files = [], t) =>
    Observable.from(files)
      .reduce(
        (acc, file) => {
          if (file.type === 'application/json' || file.name.endsWith('.json')) {
            acc.jsonFiles.push(file);
          } else if (file.type === 'text/javascript' || file.name.endsWith('.js')) {
            acc.scriptFiles.push(file);
          }
          return acc;
        },
        { jsonFiles: [], scriptFiles: [] }
      )
      .flatMap(({ jsonFiles, scriptFiles }) => {
        if (jsonFiles.length < 1) {
          return Observable.throw(t('deviceModels.flyouts.upload.missingJsonFileErrorMessage'));
        }

        if (jsonFiles.length > 1) {
          return Observable.throw(t('deviceModels.flyouts.upload.tooManyJsonFilesErrorMessage'));
        }

        return this.readFileAsText(jsonFiles[0]).map(content => {
          let deviceModel = null;

          try {
            deviceModel = JSON.parse(content);
          }
          catch (error) {
            return Observable.throw(t('deviceModels.flyouts.upload.invalidJSONFileErrorMessage', { error }));
          }

          const jsonFile = jsonFiles[0];
          const { CloudToDeviceMethods = {}, Simulation: { Scripts } = { Scripts: [] } } = deviceModel || {};
          const requiredScripts = [...Object.values(CloudToDeviceMethods), ...Scripts];
          const requiredScriptNames = new Set(requiredScripts.map(({ Path }) => Path));
          const uploadedScriptNames = new Set(scriptFiles.map(({ name }) => name));
          let missingScripts = [];

          if (!isEqual(requiredScriptNames, uploadedScriptNames)) {
            const missingScriptNames = new Set([...requiredScriptNames].filter(x => !uploadedScriptNames.has(x)));
            const scriptsToBeRemoved = new Set([...uploadedScriptNames].filter(x => !requiredScriptNames.has(x)));

            missingScripts = [...missingScriptNames];

            for (let script of scriptsToBeRemoved) {
              scriptFiles.splice(scriptFiles.findIndex(x => x.name === script), 1);
            }
          }

          return {
            deviceModel,
            scriptFiles,
            jsonFile,
            missingScripts
          };
        });
      });

  readFileAsText = file => {
    const reader = new FileReader();

    return Observable.create(observer => {
      reader.onerror = ({ target: error }) => {
        reader.abort();
        observer.throw(error);
      };

      reader.onload = () => {
        observer.next(reader.result);
        observer.complete();
      };

      reader.readAsText(file);
    });
  };

  formIsValid() {
    const { deviceModel, missingScripts, validationResults } = this.state;
    return !isEmpty(deviceModel) && missingScripts.length === 0 && Object.values(validationResults || {}).every(v => v && v.isValid);
  }

  apply = event => {
    event.preventDefault();
    const { deviceModel = {}, scripts } = this.state;

    // Uploading scripts
    Observable.from(scripts)
      .flatMap(file => DeviceModelScriptsService.uploadsDeviceModelScript(file))
      .reduce((scripts, script) => ({ ...scripts, [script.name.replace(/^.*[\\/]/, '')]: script }), {})
      .map(scripts => {
        const {
          CloudToDeviceMethods = {},
          Simulation: { Scripts }
        } = deviceModel;

        // Mapping methods with storage id
        const methods = Object.keys(CloudToDeviceMethods)
          .map(key => {
            const fileName = CloudToDeviceMethods[key].Path;
            const script = scripts[fileName];
            return {
              [key]: {
                Id: script.id,
                Path: 'Storage',
                Type: 'javascript'
              }
            };
          })
          .reduce((methods, method) => ({ ...methods, ...method }), {});

        // Mapping behavior scripts with storage id
        const simulationScripts = Scripts.map(({ Path }) => ({
          Id: scripts[Path].id,
          Path: 'Storage',
          Type: 'javascript'
        }));

        // Update the device model with uploaded scripts
        const model = {
          ...deviceModel,
          Simulation: {
            ...deviceModel.Simulation,
            Scripts: simulationScripts
          },
          CloudToDeviceMethods: methods
        };

        // Create the device model in storage
        return this.props.uploadDeviceModel(model);
      })
      .subscribe(response => {
        // TODO: Decide to show success message or not
      });
  };

  uploadSingleFile = e => {
    const uploadedFile = e.target.files[0];
    const addMissingScriptIndex = this.state.missingScripts.findIndex(
      script => (script.fileName === e.target.id));
    const replaceIncorrectScriptIndex = this.state.scripts.findIndex(
      script => (script.name === e.target.id));

    // TODO: Construct just the new state without copying old state
    let scripts = [...this.state.scripts];
    let missingScripts = [...this.state.missingScripts];
    let validationResults = { ...this.state.validationResults };

    if (uploadedFile && e.target.id === uploadedFile.name) {
      addMissingScriptIndex !== -1
        ? missingScripts.splice(addMissingScriptIndex, 1)
        : scripts.splice(replaceIncorrectScriptIndex, 1);

      scripts.push(uploadedFile);

      validationResults[e.target.id] = undefined;

    } else if (uploadedFile && e.target.id !== uploadedFile.name) {
        validationResults[e.target.id] = {
          isValid: false,
          messages: [`Expected file is ${e.target.id}`]
        };
    }

    this.setState({
      scripts,
      missingScripts,
      validationResults
    }, () => this.validateScripts())
  };

  clearAll = () => {
    const formVersion = this.state.formVersion + 1;
    const validationResults = {}

    this.setState({ ...initialFormState, formVersion, validationResults });
    this.props.clearUploadDeviceModelError();
  };

  fileUploadRef = () => {
    this.fileInputRef.current.click();
  }

  onClickSingleFileInputRef = () => {
    this.singleFileInputRef.current.click();
  }

  render() {
    const { t, uploadDeviceModelsError } = this.props;
    const { deviceModel, scripts, jsonFile, changesApplied, formVersion, error, missingScripts, validationResults } = this.state;
    return (
      <form key={`device-model-form-${formVersion}`} onSubmit={this.apply} className="device-model-form-container">
        <FormSection>
          <FormLabel>{t('deviceModels.flyouts.upload.deviceModelInfoText')}</FormLabel>
          <div className="device-model-info-text">
            <FormLabel>{t('deviceModels.flyouts.upload.deviceModelFilesInfoText')}</FormLabel>
            <Link
              className="learn-more"
              target="_blank"
              to='//github.com/Azure/device-simulation-dotnet/wiki/Device-Models'>
              {t('deviceModels.flyouts.upload.learnMore')}
            </Link>
          </div>
        </FormSection>
        <FormSection>
          <FormLabel>{t('deviceModels.flyouts.upload.files')}</FormLabel>
          <div className="file-uploader-container">
            <input
              className="file-uploader"
              type="file"
              id="uploader"
              name="uploader"
              accept=".json, .js"
              multiple
              ref={this.fileInputRef}
              onChange={this.uploadFiles}
            />
            <Btn className="browse-button" htmlFor="fileUpload" onClick={this.fileUploadRef}>{t('deviceModels.flyouts.upload.browse')}</Btn>
          </div>
        </FormSection>
        <FormSection>
        {
          this.state.deviceModel && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.new.name')}</FormLabel>
              <div>{deviceModel.Name}</div>
            </FormGroup>
          )
        }
        {
          missingScripts && missingScripts.length > 0 && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.upload.missingFiles')}</FormLabel>
              {
                missingScripts
                  .sort((a, b) => a.fileName.localeCompare(b.fileName))
                  .map(({ fileName, validationResult = {} }, idx) => (
                    <div key={fileName} className="upload-results-container">
                      <div className="file-name">
                        {fileName}
                        <div className="validation-message">
                        {
                          ((validationResults[fileName] || {}).messages || []).map((error, idx) => (
                              <ErrorMsg key={idx}>{error}</ErrorMsg>
                              )
                            )
                        }
                        </div>
                      </div>
                      <div className="validation-message">
                        <FileUpload id={fileName} value={t('deviceModels.flyouts.upload.browse')} onChange={this.uploadSingleFile} />
                      </div>
                    </div>
                  ))
                }
            </FormGroup>
          )
        }
        {
          scripts.length > 0 && jsonFile && (
            <FormGroup>
              <FormLabel>{t('deviceModels.flyouts.upload.uploadedFiles')}</FormLabel>
              <div className="upload-results-container">
                <div className="file-name">{jsonFile.name}</div>
                <Svg path={svgs.success} className="success-result" />
              </div>
              {this.state.scripts
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(({ name }, idx) => (
                  <div key={idx} className="upload-results-container">
                    <div className="file-name">
                      {name}
                      <div className="validation-message">
                        {
                          ((validationResults[name] || {}).messages || []).map((error, idx) => (
                              <ErrorMsg key={idx}>{error}</ErrorMsg>
                            )
                          )
                        }
                      </div>
                    </div>
                    <div
                      className={`${(validationResults[name] && validationResults[name].isValid) ? 'success-result' : 'failed-result'}`}>
                      {validationResults[name] && validationResults[name].isValid === true ? (
                        <Svg path={svgs.success} className="success-result" />
                      ) : validationResults[name] && validationResults[name].isValid === false ? (
                        <Svg path={svgs.failure} className="failed-result" />
                      ) : (
                        <Indicator size="mini" />
                      )}
                    </div>
                    <div>
                      {
                        validationResults[name] && (validationResults[name].messages || []).map((error, idx) => (
                          <FileUpload id={name} onChange={this.uploadSingleFile} value={t('deviceModels.flyouts.upload.browse')} />
                        ))
                      }
                    </div>
                  </div>
                ))}
            </FormGroup>
          )
        }
        </FormSection>
        { error && <ErrorMsg>{ error }</ErrorMsg> }
        { uploadDeviceModelsError &&
          <ErrorMsg>{ (uploadDeviceModelsError || {}).errorMessage }</ErrorMsg>
        }
        <FormActions>
          <BtnToolbar>
            <Btn disabled={!this.formIsValid() || changesApplied} type="submit">
              {t('deviceModels.flyouts.save')}
            </Btn>
            <Btn svg={svgs.cancelX} onClick={this.clearAll}>
              {t('deviceModels.flyouts.clearAll')}
            </Btn>
          </BtnToolbar>
        </FormActions>
      </form>
    );
  }
}

export default DeviceModelUploadForm;
