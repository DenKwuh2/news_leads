import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов')
    .trim(),
  
  email: z.string()
    .email('Введите корректный email')
    .min(1, 'Email обязателен')
    .toLowerCase()
    .trim(),
  
  company: z.string()
    .max(255, 'Название компании слишком длинное')
    .optional()
    .default('Не указано')
    .transform(val => val?.trim() || 'Не указано'),
  
  source: z.enum(['сайт', 'реклама', 'социальные сети', 'рекомендация', 'другое'])
    .default('не указан')
    .optional(),
  
  budget: z.number()
    .positive('Бюджет должен быть больше 0')
    .optional()
    .nullable()
    .transform(val => val && val > 0 ? val : null),
  
  comment: z.string()
    .max(1000, 'Комментарий не должен превышать 1000 символов')
    .optional()
    .default('Без комментария')
    .transform(val => val?.trim() || 'Без комментария'),
  
  isUrgent: z.literal(true, {
    errorMap: () => ({ message: 'Подтвердите, что лид срочный' })
  })
})

export type LeadFormData = z.infer<typeof leadSchema>