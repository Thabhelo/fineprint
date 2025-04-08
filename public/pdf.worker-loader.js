// This file provides a simple loader for PDF.js worker
// It helps bypass CORS issues in development
self.pdfjsWorker = {
  WorkerMessageHandler: {
    setup(handler) {
      // Setup the worker message handler
      self.onmessage = (event) => {
        handler(event.data);
      };
    },
  },
};
