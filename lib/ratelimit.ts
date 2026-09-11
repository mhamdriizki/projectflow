import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    })
  : null;

export async function checkRateLimit(
  identifier: string,
): Promise<{ limited: boolean }> {
  if (!ratelimit) return { limited: false };
  const { success } = await ratelimit.limit(identifier);
  return { limited: !success };
}
