'use client'

import { useState, useEffect } from 'react'
import { leadSchema } from '@/lib/schemas'
import { validateWithZod } from '@/lib/validation-utils'
import { createLeadAction, getLeadsStatsAction } from './actions'

export default function NewLeadPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    source: 'сайт',
    budget: '',
    comment: '',
    isUrgent: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverResponse, setServerResponse] = useState<{
    success?: boolean
    message?: string
  }>({})
  const [stats, setStats] = useState<{ total: number; urgent: number } | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const result = await getLeadsStatsAction()
      if (result.success) {
        setStats(result.data)
      }
    }
    loadStats()
  }, [])

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        source: formData.source,
        budget: formData.budget ? Number(formData.budget) : null,
        comment: formData.comment,
        isUrgent: formData.isUrgent
      }
      
      const result = validateWithZod(leadSchema, dataToValidate)
      
      if (!result.success) {
        setErrors(result.errors)
        return false
      }
      
      setErrors({})
      return true
      
    } catch (error) {
      console.error('Ошибка валидации:', error)
      setErrors({ _form: 'Произошла ошибка при проверке формы' })
      return false
    }
  }

  // 4️⃣ Валидация конкретного поля (ИСПРАВЛЕННАЯ ВЕРСИЯ)
  const validateField = (fieldName: string, value: any) => {
    try {
      const fieldSchema = leadSchema.pick({ [fieldName]: true as any })
      const result = fieldSchema.safeParse({ [fieldName]: value })
      
      if (!result.success) {
        const errorMessages: Record<string, string> = {}
        
        // Проверяем, что error и error.errors существуют
        if (result.error && result.error.errors && result.error.errors.length > 0) {
          result.error.errors.forEach((err) => {
            const path = err.path.join('.')
            errorMessages[path] = err.message
          })
        }
        
        // Если есть ошибка для этого поля - показываем её
        if (errorMessages[fieldName]) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: errorMessages[fieldName]
          }))
        } else if (Object.keys(errorMessages).length > 0) {
          // Если ошибка для другого поля (маловероятно, но на всякий случай)
          setErrors(prev => ({
            ...prev,
            ...errorMessages
          }))
        }
        return
      }
      
      // Если ошибок нет - удаляем ошибку для этого поля
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
      
    } catch (error) {
      // Просто логируем, не показываем пользователю
      console.error('Ошибка валидации поля:', error)
    }
  }

  // 5️⃣ Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField && firstErrorField !== '_form') {
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(element as HTMLElement).focus()
        }
      }
      return
    }
    
    setIsSubmitting(true)
    setServerResponse({})
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('company', formData.company)
      formDataToSend.append('source', formData.source)
      formDataToSend.append('budget', formData.budget)
      formDataToSend.append('comment', formData.comment)
      formDataToSend.append('isUrgent', formData.isUrgent ? 'on' : '')
      
      const result = await createLeadAction(formDataToSend)
      
      console.log('📬 Ответ от сервера:', result)
      
      if (result.success) {
        setServerResponse({
          success: true,
          message: `✅ Лид "${result.data.name}" успешно создан! ID: ${result.data.id}`
        })
        
        setFormData({
          name: '',
          email: '',
          company: '',
          source: 'сайт',
          budget: '',
          comment: '',
          isUrgent: false
        })
        setErrors({})
        
        const newStats = await getLeadsStatsAction()
        if (newStats.success) {
          setStats(newStats.data)
        }
        
        setTimeout(() => {
          setServerResponse({})
        }, 5000)
        
      } else {
        if (result.errors) {
          setErrors(result.errors)
          const firstErrorField = Object.keys(result.errors)[0]
          if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              ;(element as HTMLElement).focus()
            }
          }
        } else {
          setServerResponse({
            success: false,
            message: result.error || '❌ Ошибка при создании лида'
          })
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error)
      setServerResponse({
        success: false,
        message: '❌ Произошла ошибка при отправке'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 6️⃣ Рендеринг
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Новый лид</h1>
        {stats && (
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
            <span>Всего: {stats.total} </span>
            <span className="text-red-600 font-medium">| Срочных: {stats.urgent}</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverResponse.message && (
          <div className={`p-3 rounded border ${
            serverResponse.success 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {serverResponse.message}
          </div>
        )}
        
        {/* 👤 Имя */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Имя клиента <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={(e) => validateField('name', e.target.value)}
            placeholder="Введите имя"
            className={`w-full border p-2 rounded transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:border-blue-500`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* 📧 Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onBlur={(e) => validateField('email', e.target.value)}
            placeholder="client@example.com"
            className={`w-full border p-2 rounded transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:border-blue-500`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* 🏢 Компания */}
        <div>
          <label className="block text-sm font-medium mb-1">Компания</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="ООО Ромашка"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 📊 Источник */}
        <div>
          <label className="block text-sm font-medium mb-1">Источник лида</label>
          <select
            name="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="сайт">Сайт</option>
            <option value="реклама">Реклама</option>
            <option value="социальные сети">Социальные сети</option>
            <option value="рекомендация">Рекомендация</option>
            <option value="другое">Другое</option>
          </select>
        </div>

        {/* 💰 Бюджет */}
        <div>
          <label className="block text-sm font-medium mb-1">Предполагаемый бюджет</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₽</span>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              onBlur={(e) => validateField('budget', e.target.value ? Number(e.target.value) : null)}
              placeholder="100000"
              className="w-full border border-gray-300 p-2 pl-8 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 📝 Комментарий */}
        <div>
          <label className="block text-sm font-medium mb-1">Комментарий</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Дополнительная информация..."
            rows={4}
            className="w-full border border-gray-300 p-2 rounded resize-y focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 🚨 Срочный лид */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isUrgent"
              checked={formData.isUrgent}
              onChange={(e) => {
                setFormData({ ...formData, isUrgent: e.target.checked })
                validateField('isUrgent', e.target.checked)
              }}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm font-medium">
              Срочный лид <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.isUrgent && <p className="text-red-500 text-sm mt-1">{errors.isUrgent}</p>}
        </div>

        {/* 🚀 Кнопка */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Отправка' : 'Создать лида'}
        </button>
      </form>
    </div>
  )
}