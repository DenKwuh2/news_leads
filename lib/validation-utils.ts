import { z } from 'zod'
import { leadSchema } from './schemas'

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  
  // ✅ Добавляем проверку на существование error и error.errors
  if (!error || !error.errors) {
    return errors
  }
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })
  
  return errors
}

export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return { success: true, data: result.data }
    }
    
    // ✅ result.error точно существует при result.success === false
    return { 
      success: false, 
      errors: formatZodErrors(result.error) 
    }
    
  } catch (error) {
    // ✅ Обработка неожиданных ошибок
    console.error('Ошибка валидации:', error)
    return {
      success: false,
      errors: { _form: 'Произошла ошибка при валидации' }
    }
  }
}

export function validateLead(data: unknown) {
  return validateWithZod(leadSchema, data)
}