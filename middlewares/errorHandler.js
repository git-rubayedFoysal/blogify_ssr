/**
 * Final error handler - must be registered after all routes.
 * Sends a plain 500 response unless headers were already sent.
 * @param {Error} err - The error thrown by a route or middleware.
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res
    .status(500)
    .send(err.message || "There was a server side error occurred.");
};

/**
 * 404 fallback for unmatched URLs.
 */
export const notFoundErrorHandler = (req, res) => {
  res.status(404).send("Requested URL was not found.");
};
