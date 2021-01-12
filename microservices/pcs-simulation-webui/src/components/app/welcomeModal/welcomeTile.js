// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Link } from 'react-router-dom';

import './welcomeTile.scss';

export const WelcomeTile = ({ onClick, imgPath, title, description, btnName, link }) => (
  <div className="welcome-tile-container">
    <div className="welcome-tile-img-container"><img alt={`${btnName}`} src={imgPath}/></div>
    <div className="welcome-tile-title">{title}</div>
    <div className="welcome-tile-description">{description}</div>
    <div className="btn-link-container">
      <Link
        className="btn-link"
        onClick={onClick}
        to={{
        pathname: link.pathname,
        state: link.state
      }}>
        {btnName}
      </Link>
    </div>
  </div>
);
