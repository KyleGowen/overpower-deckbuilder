# Middleware

## Trust Proxy Requirement

Several middleware and application code use `req.ip` to identify the client (e.g. rate limiters, logging). **When the app runs behind a reverse proxy** (nginx, load balancer, etc.), you must configure Express to trust the proxy so `req.ip` reflects the real client IP.

### Configuration

Add early in your app setup (before any middleware that uses `req.ip`):

```javascript
app.set('trust proxy', 1);
```

### How It Works

- **Without trust proxy**: `req.ip` returns the direct connection IP (e.g. `127.0.0.1` when nginx connects to Node).
- **With trust proxy**: Express reads the `X-Forwarded-For` header. The value `1` means "trust the first proxy" — it uses the leftmost (client) IP in the chain.
- **Production**: Behind nginx or similar, the typical header is `X-Forwarded-For: <client-ip>` or `X-Forwarded-For: <client-ip>, <proxy-ip>`. Trusting 1 proxy uses the client IP.

### Affected Modules

- `newAccountRateLimiter.ts` — uses `req.ip` for per-IP rate limiting on new Google account creation.
- General rate limiting in `index.ts` — uses `req.ip` for deck/card operation limits.

### References

- [Express: Behind Proxies](https://expressjs.com/en/guide/behind-proxies.html)
- [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)
