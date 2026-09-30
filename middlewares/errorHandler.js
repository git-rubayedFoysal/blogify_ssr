export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res
    .status(500)
    .send(err.message || "There was a server side error occurred.");
};

export const notFoundErrorHandler = (req, res) => {
  res.status(404).send("Requested URL was not found.");
};
