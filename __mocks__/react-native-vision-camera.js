module.exports = {
  Camera: function MockCamera() { return null; },
  useCameraDevices: () => ({ back: null, front: null }),
  useFrameProcessor: () => {},
};