// Hardcoded sensors for stock models
// TODO: Delete this file when sensors avaliable from service

const stockModelSensors = {};

stockModelSensors['chiller-01'] = [
  {
      name: 'temperature',
      minValue: 25,
      maxValue: 100,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'humidity',
      minValue: 2,
      maxValue: 100,
      unit: '%',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'pressure',
      minValue: 50,
      maxValue: 300,
      unit: 'psig',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['chiller-02'] = [
  {
      name: 'temperature',
      minValue: 25,
      maxValue: 100,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'humidity',
      minValue: 2,
      maxValue: 99,
      unit: '%',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'pressure',
      minValue: 50,
      maxValue: 300,
      unit: 'psig',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['elevator-01'] = [
  {
      name: 'temperature',
      minValue: 25,
      maxValue: 100,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'vibration',
      minValue: 0,
      maxValue: 20,
      unit: 'mm',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'floor',
      minValue: 1,
      maxValue: 15,
      unit: '',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['elevator-02'] = [
  {
      name: 'temperature',
      minValue: 25,
      maxValue: 100,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'vibration',
      minValue: 0,
      maxValue: 20,
      unit: 'mm',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'floor',
      minValue: 1,
      maxValue: 15,
      unit: '',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['engine-01'] = [
  {
      name: 'fuellevel',
      minValue: 0,
      maxValue: 70,
      unit: 'Gal',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'vibration',
      minValue: 0,
      maxValue: 20,
      unit: 'mm',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'coolant',
      minValue: 200,
      maxValue: 10000,
      unit: 'ohm',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['engine-02'] = [
  {
      name: 'fuellevel',
      minValue: 0,
      maxValue: 70,
      unit: 'Gal',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'vibration',
      minValue: 0,
      maxValue: 20,
      unit: 'mm',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'coolant',
      minValue: 200,
      maxValue: 10000,
      unit: 'ohm',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['prototype-01'] = [
  {
      name: 'temperature',
      minValue: 25,
      maxValue: 100,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'pressure',
      minValue: 50,
      maxValue: 300,
      unit: 'psig',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['prototype-02'] = [
  {
      name: 'temperature',
      minValue: 25,
      maxValue: 100,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'pressure',
      minValue: 50,
      maxValue: 300,
      unit: 'psig',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['truck-01'] = [
  {
      name: 'temperature',
      minValue: 23,
      maxValue: 53,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'speed',
      minValue: 0,
      maxValue: 80,
      unit: 'mph',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

stockModelSensors['truck-02'] = [
  {
      name: 'temperature',
      minValue: 23,
      maxValue: 53,
      unit: 'F',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  },
  {
      name: 'speed',
      minValue: 0,
      maxValue: 80,
      unit: 'mph',
      behavior: { value: 'Math.Random.WithinRange', label: 'Random' }
  }
];

export default stockModelSensors;
