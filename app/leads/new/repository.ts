// Интерфейс для лида (типизация)
export interface Lead {
  id: string
  name: string
  email: string
  company: string
  source: string
  budget: number | null
  comment: string
  isUrgent: boolean
  createdAt: Date
}

// Mock-база данных (в реальности здесь был бы Prisma/Mongoose)
const leadsDB: Lead[] = []

export const leadRepository = {
  /**
   * Сохраняет лида в БД
   */
  save: async (data: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
    // Имитация асинхронной операции (задержка 500ms)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      createdAt: new Date()
    }
    
    // Сохраняем в массив
    leadsDB.push(newLead)
    
    console.log('💾 Сохранено в БД:', newLead)
    console.log('📊 Всего лидов в БД:', leadsDB.length)
    
    return newLead
  },
  
  /**
   * Получает все лиды (для проверки)
   */
  findAll: (): Lead[] => {
    return leadsDB
  },
  
  /**
   * Находит лида по ID
   */
  findById: (id: string): Lead | undefined => {
    return leadsDB.find(lead => lead.id === id)
  }
}