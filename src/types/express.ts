import { Request, Response } from "express";
import { Result } from "express-validator";

// Extended Request interface with validated data
export interface TypedRequest<TBody = any, TQuery = any, TParams = any>
  extends Request<TParams, any, TBody, TQuery> {
  validationResult?: Result;
}

// Extended Response interface for type safety
export interface TypedResponse<TData = any> extends Response<TData> {}

// Route handler type with proper typing
export type RouteHandler<
  TReqBody = any,
  TResBody = any,
  TQuery = any,
  TParams = any
> = (
  req: TypedRequest<TReqBody, TQuery, TParams>,
  res: TypedResponse<TResBody>
) => void | Promise<void>;

// Middleware type
export type MiddlewareFunction<TReqBody = any, TQuery = any, TParams = any> = (
  req: TypedRequest<TReqBody, TQuery, TParams>,
  res: TypedResponse,
  next: () => void
) => void | Promise<void>;

// Error handler type
export type ErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: () => void
) => void;
