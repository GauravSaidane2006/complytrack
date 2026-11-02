let io = null;

const setSocketIO = (socketIO) => { io = socketIO; };

const emitToOrg = (organizationId, event, data) => {
  if (io) io.to(`org:${organizationId}`).emit(event, data);
};

module.exports = { setSocketIO, emitToOrg };
