import { Logger } from '@nestjs/common';

/**
 * Safe wrapper for Swagger decorators that prevents documentation errors from affecting the main application
 * If any documentation decorator fails, it will log the error and continue without the decorator
 */
export function SafeSwaggerDecorator(decoratorFactory: () => any) {
  const logger = new Logger('SafeSwagger');
  
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    try {
      const decorator = decoratorFactory();
      if (decorator && typeof decorator === 'function') {
        return decorator(target, propertyKey, descriptor);
      }
    } catch (error) {
      logger.warn(`Documentation decorator failed for ${target.constructor?.name || 'unknown'}.${propertyKey || 'class'}: ${error.message}`);
      logger.warn('Application will continue without this documentation decorator');
    }
    
    // Return the original descriptor/target unchanged if decorator fails
    return descriptor || target;
  };
}

/**
 * Safe wrapper for class-level Swagger decorators (like @ApiTags)
 */
export function SafeSwaggerClassDecorator(decoratorFactory: () => any) {
  const logger = new Logger('SafeSwagger');
  
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    try {
      const decorator = decoratorFactory();
      if (decorator && typeof decorator === 'function') {
        return decorator(constructor) || constructor;
      }
    } catch (error) {
      logger.warn(`Documentation class decorator failed for ${constructor.name}: ${error.message}`);
      logger.warn('Application will continue without this documentation decorator');
    }
    
    return constructor;
  };
}