module.exports = {
  DateTimePickerAndroid: {
    open: jest.fn(),
    dismiss: jest.fn(),
  },
  default: function MockDateTimePicker() { return null; }
};