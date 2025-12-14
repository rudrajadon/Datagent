import { verifyToken } from "@clerk/backend";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  file?: Express.Multer.File;
}

/**
 * Middleware to verify Clerk JWT tokens.
 * Extracts the token from the Authorization header and validates it.
 */
export async function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  try {
    const authHeader = authReq.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    // Verify the token using Clerk
    const decoded = await verifyToken(token, {
      secretKey: config.clerkSecretKey,
    });

    // Extract user information from the decoded token
    authReq.user = {
      userId: decoded.sub || "",
      email: (decoded as any).email || undefined,
      firstName: (decoded as any).first_name || undefined,
      lastName: (decoded as any).last_name || undefined,
    };

    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
}

/**
 * Optional auth middleware - doesn't fail if no token present
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const decoded = await verifyToken(token, {
        secretKey: config.clerkSecretKey,
      });

      req.user = {
        userId: decoded.sub || "",
        email: (decoded as any).email || undefined,
      };
    }

    next();
  } catch (error) {
    // Continue without auth for optional middleware
    next();
  }
}
