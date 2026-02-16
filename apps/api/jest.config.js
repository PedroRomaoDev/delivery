export default {
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'node'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    collectCoverageFrom: ['src/**/*.js'],

    // 🧩 Adicione isso:
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[tj]s?(x)',
    ],

    // Mapear workspace aliases para Jest
    moduleNameMapper: {
        '^@delivery/shared/(.*)$': '<rootDir>/../../packages/shared/$1',
        '^@delivery/helpers/(.*)$': '<rootDir>/../../packages/helpers/$1',
    },
};
