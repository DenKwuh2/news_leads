import { leadRepository, type Lead } from './repository'

export const leadService = {
  /**
   * Создает нового лида с бизнес-логикой
   */
  createLead: async (data: {
    name: string
    email: string
    company?: string
    source?: string
    budget?: number | null
    comment?: string
    isUrgent: boolean
  }): Promise<Lead> => {
    
    console.log('🔧 Service: Начало обработки...')
    
    // Проверка на дубликат email
    if (leadRepository.existsByEmail(data.email)) {
      throw new Error('Лид с таким email уже существует')
    }
    
    // Бизнес-правила
    const company = data.company?.trim() || 'Не указано'
    const source = data.source || 'не указан'
    const budget = data.budget && data.budget > 0 ? data.budget : null
    const comment = data.comment?.trim() || 'Без комментария'
    
    // Логика для срочных лидов
    if (data.isUrgent) {
      console.log('🚨 Service: СРОЧНЫЙ ЛИД! Отправка уведомлений...')
    }
    
    // Форматирование данных
    const leadData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      company,
      source,
      budget,
      comment,
      isUrgent: data.isUrgent
    }
    
    console.log('📦 Service: Подготовленные данные:', leadData)
    
    // Сохраняем через репозиторий
    const savedLead = await leadRepository.save(leadData)
    
    console.log('✅ Service: Лид успешно создан!', savedLead)
    
    return savedLead
  },
  
  /**
   * ✅ ДОБАВЛЯЕМ: Получает статистику по лидам
   */
  getStats: () => {
    const allLeads = leadRepository.findAll()
    const urgentCount = allLeads.filter(l => l.isUrgent).length
    
    return {
      total: allLeads.length,
      urgent: urgentCount,
      regular: allLeads.length - urgentCount
    }
  },
  
  /**
   * ✅ ДОБАВЛЯЕМ: Проверяет, существует ли email
   */
  existsByEmail: (email: string): boolean => {
    return leadRepository.existsByEmail(email)
  },
  
  /**
   * ✅ ДОБАВЛЯЕМ: Получает все лиды
   */
  getAllLeads: () => {
    return leadRepository.findAll()
  },
  
 
  getLeadById: (id: string) => {
    return leadRepository.findById(id)
  }
}