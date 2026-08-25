'use server'

import { z } from 'zod'
import { leadSchema } from '@/lib/schemas'
import { validateWithZod } from '@/lib/validation-utils'
import { leadService } from './service'

export async function createLeadAction(formData: FormData) {
  console.log('🎯 Controller: Получены данные из формы')
  
  const rawData = {
    name: formData.get('name') as string || '',
    email: formData.get('email') as string || '',
    company: formData.get('company') as string || '',
    source: formData.get('source') as string || '',
    budget: formData.get('budget') ? Number(formData.get('budget')) : null,
    comment: formData.get('comment') as string || '',
    isUrgent: formData.get('isUrgent') === 'on'
  }
  
  console.log('📥 Controller: Сырые данные:', rawData)
  
  const validation = validateWithZod(leadSchema, rawData)
  
  if (!validation.success) {
    console.log('Controller: Ошибки валидации:', validation.errors)
    return {
      success: false,
      errors: validation.errors
    }
  }
  
  const validatedData = validation.data
  console.log('✅ Controller: Данные прошли валидацию:', validatedData)
  

  try {
    console.log('🚀 Controller: Вызов Service...')
    
    const savedLead = await leadService.createLead({
      name: validatedData.name,
      email: validatedData.email,
      company: validatedData.company,
      source: validatedData.source || 'не указан',
      budget: validatedData.budget,
      comment: validatedData.comment,
      isUrgent: validatedData.isUrgent
    })
    
    console.log('✅ Controller: Лид успешно создан!', savedLead)
    
    return {
      success: true,
      data: savedLead
    }
    
  } catch (error) {
    console.error('❌ Controller: Ошибка создания лида:', error)
    

    if (error instanceof Error) {
      if (error.message === 'Лид с таким email уже существует') {
        return {
          success: false,
          errors: {
            email: 'Лид с таким email уже существует'
          }
        }
      }
      
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: 'Произошла ошибка при создании лида'
    }
  }
}

export async function getLeadsStatsAction() {
  'use server'
  
  try {
    const stats = leadService.getStats()
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error)
    return {
      success: false,
      error: 'Ошибка получения статистики'
    }
  }
}

export async function checkEmailExistsAction(email: string) {
  'use server'
  
  try {
    const exists = leadService.existsByEmail(email)
    return {
      success: true,
      data: { exists }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Ошибка проверки email'
    }
  }
}