const fs = require('fs');
const { readDb } = require('../src/services/fileManager');
const { DB_PATH } = require('../src/config/config');

jest.mock('fs'); // Prevents tests from actually writing files

describe('File Manager', () => {
  it('should read and parse the DB', () => {
    const mockDb = { category: { fix: { code: 'console.log(1)' } } };
    fs.readFileSync.mockReturnValue(JSON.stringify(mockDb));
    const data = readDb();
    expect(fs.readFileSync).toHaveBeenCalledWith(DB_PATH, 'utf-8');
    expect(data).toEqual(mockDb);
  });
});