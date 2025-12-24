module.exports = {
  launchCamera: jest.fn(async () => ({ assets: [], didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ assets: [], didCancel: true })),
};