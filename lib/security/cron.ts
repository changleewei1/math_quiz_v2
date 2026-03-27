export function verifyCronSecret(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get('x-cron-secret');
  return Boolean(secret && header && header === secret);
}


