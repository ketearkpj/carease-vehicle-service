// ===== src/utils/responseHelper.js =====
/**
 * Standardized API response helper
 * Ensures consistent response format across all endpoints
 */
class ResponseHelper {
  /**
   * Success response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      status: 'success',
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    // Add pagination metadata if available
    if (data && data.pagination) {
      response.pagination = data.pagination;
      delete data.pagination;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   */
  static error(res, message = 'Error', statusCode = 500, errors = null) {
    const response = {
      status: 'error',
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201)
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Bad request response (400)
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Not found response (404)
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Conflict response (409)
   */
  static conflict(res, message = 'Conflict', errors = null) {
    return this.error(res, message, 409, errors);
  }

  /**
   * Validation error response (422)
   */
  static validationError(res, errors = null) {
    return this.error(res, 'Validation failed', 422, errors);
  }

  /**
   * Too many requests response (429)
   */
  static tooManyRequests(res, message = 'Too many requests') {
    return this.error(res, message, 429);
  }

  /**
   * Server error response (500)
   */
  static serverError(res, error = null) {
    const message = process.env.NODE_ENV === 'development' && error
      ? error.message
      : 'Internal server error';

    return this.error(res, message, 500);
  }

  /**
   * Service unavailable response (503)
   */
  static serviceUnavailable(res, message = 'Service temporarily unavailable') {
    return this.error(res, message, 503);
  }

  /**
   * Paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return this.success(res, {
      items: data,
      pagination
    }, message);
  }

  /**
   * Download file response
   */
  static download(res, buffer, filename, contentType) {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  /**
   * Stream response
   */
  static stream(res, stream, contentType) {
    res.setHeader('Content-Type', contentType);
    return stream.pipe(res);
  }

  /**
   * Event stream (SSE) response
   */
  static eventStream(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    return res;
  }

  /**
   * Send SSE event
   */
  static sendEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * HTML response
   */
  static html(res, html, statusCode = 200) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(statusCode).send(html);
  }

  /**
   * Redirect response
   */
  static redirect(res, url, statusCode = 302) {
    return res.redirect(statusCode, url);
  }

  /**
   * Build success response object (for internal use)
   */
  static buildSuccess(data = null, message = 'Success') {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Build error response object (for internal use)
   */
  static buildError(message = 'Error', statusCode = 500, errors = null) {
    return {
      status: 'error',
      message,
      statusCode,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format validation errors
   */
  static formatValidationErrors(error) {
    if (!error.details) return null;

    return error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }

  /**
   * Handle async route with try-catch
   */
  static async handleAsync(handler, req, res) {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('Async route error:', error);
      return this.serverError(res, error);
    }
  }
}

module.exports = ResponseHelper;