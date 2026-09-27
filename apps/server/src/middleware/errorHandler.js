export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number(err.status) || 500
      : 500;
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(status).json({ success: false, message });
}
