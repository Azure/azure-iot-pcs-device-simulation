// Copyright (c) Microsoft. All rights reserved.
import moment from 'moment';

/** Tests if a value is a function */
export const isFunc = value => typeof value === 'function';

/** Tests if a value is an object */
export const isObject = value => typeof value === 'object';

/** Converts a value to an integer */
export const int = (num) => parseInt(num, 10);

/** Merges css classnames into a single string */
export const joinClasses = (...classNames) => classNames.filter(name => !!name).join(' ').trim();

/** Convert a string of type 'true' or 'false' to its boolean equivalent */
export const stringToBoolean = value => {
  if (typeof value !== 'string') return value;
  const str = value.toLowerCase();
  if (str === "true") return true;
  else if (str === "false") return false;
};

/** A helper method for translating headerNames of columnDefs */
export const translateColumnDefs = (t, columnDefs) => {
  return columnDefs.map(columnDef =>
    columnDef.headerName
      ? { ...columnDef, headerName: t(columnDef.headerName) }
      : columnDef
  );
}

// TODO - Update this to add translations
/*
* Return human readable time format.
* Examples:
* 1 day and 30 seconds
* 2 days and 2 hours
* 1 day, 2 hours, 10 minutes and 50 seconds
* @param {number} - time in milliseconds
*/
export const humanizeDuration = (time) => {
  const duration = moment.duration(time);

  return [
      [duration.days(), 'day', 'days'],
      [duration.hours(), 'hour', 'hours'],
      [duration.minutes(), 'minute', 'minutes'],
      [duration.seconds(), 'second', 'seconds']
    ]
    .filter(([value]) => value)
    .map(([value, singular, plurals]) => `${value} ${value === 1 ? singular : plurals}`)
    .join(', ')
    .replace(/,(?=[^,]*$)/, ' and')
    .trim();
}

/** Returns true if the value is defined */
export const isDef = (val) => typeof val !== 'undefined';
