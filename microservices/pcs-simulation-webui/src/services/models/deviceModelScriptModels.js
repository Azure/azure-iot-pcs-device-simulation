// Copyright (c) Microsoft. All rights reserved.

// Map to simulation scripts
export const toDeviceModelScripts = ({ Items = [] }) => Items.map(toDeviceModelScript);

// Map to simulation script in device model
export const toDeviceModelScript = (response = {}) => ({
  id: response.Id,
  name: response.Name,
  eTag: response.ETag,
  type: response.Type,
  path: response.Path,
  content: response.Content,
});

//  Map to simulation script request model
export const toDeviceModelScriptRequestModel = (file) => {
  const data = new FormData();
  data.append('file', file);
  
  return data;
}

// Map to validation models
export const toValidationModel = (response = {}) => ({
  isValid: response.IsValid,
  messages: response.Messages
})
