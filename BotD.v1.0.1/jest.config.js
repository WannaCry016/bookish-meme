module.exports = {
    testEnvironment: 'jsdom', // Use jsdom for testing in a browser-like environment
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  };
  