import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.addHook("onSend", async (_req, reply) => {
    reply.header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3001; frame-ancestors 'none';");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("X-XSS-Protection", "1; mode=block");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    reply.removeHeader("X-Powered-By");
    reply.removeHeader("Server");
  });
});
