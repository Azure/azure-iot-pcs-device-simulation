// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import './styles/fileUpload.scss';

export class FileUpload extends Component {

  constructor(props) {
    super(props);

    this.singleFileRef = React.createRef();
  }

  singleFileRefClicked = () => {
    this.singleFileRef.current.click();
  }

  onchange = (e) => {
    this.props.onChange(e);
  }

  render() {
    return (
      <div className="file-uploader-container">
        <input
          className="file-uploader"
          type="file"
          id={this.props.id}
          name="uploader"
          ref={this.singleFileRef}
          onChange={this.onchange}
          accept=".json, .js"
        />
        <label htmlFor="fileUpload" onClick={this.singleFileRefClicked}>{this.props.value}</label>
      </div>
    );
  }
}
