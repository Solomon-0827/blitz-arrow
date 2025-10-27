# Use the official lightweight Bun image
FROM oven/bun:latest AS base

# Set working directory
WORKDIR /app

# Create non-root user and set permissions
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy build output and static files
COPY ./apps/user/.next/standalone ./
COPY ./apps/user/.next/static ./apps/user/.next/static
COPY ./apps/user/public ./apps/user/public

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Default command to start the server
CMD ["bun", "apps/user/server.js"]
