import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class MultipartJsonPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Only process the body payload
    if (metadata.type === 'body' && value && typeof value === 'object') {
      return this.parseObject(value);
    }
    return value;
  }

  private parseObject(obj: any): any {
    const parsed = { ...obj };
    for (const key in parsed) {
      if (typeof parsed[key] === 'string') {
        const trimmed = parsed[key].trim();
        // Check if the string looks like a JSON object or array
        if (
          (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
          try {
            parsed[key] = JSON.parse(trimmed);
          } catch (e) {
            // If JSON.parse fails, leave the value as a string and let class-validator handle it
          }
        }
      }
    }
    return parsed;
  }
}
