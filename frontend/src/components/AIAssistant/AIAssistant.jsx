import React, { useState, useRef, useEffect } from 'react';
import { LoadingDots } from '../common/LoadingSpinner/LoadingSpinner';
import './AIAssistant.css';

const AIAssistant = ({
  isOpen,
  onClose,
  onTaskCreate,
  currentTasks = [],
  user = null
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `Привет! Я ваш ИИ-помощник для управления задачами. Могу помочь с:

• Создать новые задачи
• Проанализировать текущую загрузку
• Дать рекомендации по приоритетам
• Предложить оптимизацию рабочего процесса

Что вас интересует?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Симуляция ответа ИИ
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await generateAIResponse(userMessage.content, currentTasks);

      setIsTyping(false);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Если ИИ предлагает создать задачу
      if (response.suggestedTask) {
        setTimeout(() => {
          const confirmCreate = window.confirm('Хотите создать эту задачу?');
          if (confirmCreate && onTaskCreate) {
            onTaskCreate(response.suggestedTask);
          }
        }, 1000);
      }

    } catch (error) {
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'Чат очищен. Чем могу помочь?',
        timestamp: new Date()
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant">
        <div className="ai-header">
          <div className="ai-header-info">
            <div className="ai-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <h3>AI Assistant</h3>
              <span className="ai-status">Онлайн</span>
            </div>
          </div>
          <div className="ai-header-actions">
            <button
              className="ai-action-btn"
              onClick={clearChat}
              title="Очистить чат"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </button>
            <button
              className="ai-close-btn"
              onClick={onClose}
              title="Закрыть"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="ai-quick-actions">
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('Создай задачу по улучшению производительности')}
          >
            ⚡ Создать задачу
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('Проанализируй мою текущую загрузку')}
          >
            📊 Анализ загрузки
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('Дай рекомендации по планированию')}
          >
            💡 Рекомендации
          </button>
        </div>

        <div className="ai-messages">
          {messages.map(message => (
            <div
              key={message.id}
              className={`ai-message ${message.type} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-avatar">
                {message.type === 'assistant' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <div className="user-avatar">
                    {user?.name?.charAt(0) || 'У'}
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {message.actions && (
                  <div className="message-actions">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        className="message-action-btn"
                        onClick={() => action.onClick()}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-message assistant typing">
              <div className="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="message-content">
                <LoadingDots size="small" text="Думаю..." />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-area">
          <div className="ai-input-container">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите ваш вопрос..."
              className="ai-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              className="ai-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <LoadingDots size="small" color="white" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Функция генерации ответов ИИ (симуляция)
const generateAIResponse = async (userInput, currentTasks) => {
  const input = userInput.toLowerCase();

  if (input.includes('создай') || input.includes('задач')) {
    return {
      content: `Конечно! Я создам задачу на основе вашего запроса.

📝 **Предлагаемая задача:**
- Название: "${userInput}"
- Приоритет: Средний
- Статус: К выполнению
- Срок: В течение недели

Хотите изменить какие-то параметры?`,
      suggestedTask: {
        title: userInput,
        description: `Задача создана ИИ помощником на основе запроса: "${userInput}"`,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  }

  if (input.includes('анализ') || input.includes('загрузк')) {
    const taskCount = currentTasks.length;
    const completedTasks = currentTasks.filter(t => t.status === 'done').length;
    const highPriorityTasks = currentTasks.filter(t => t.priority === 'high').length;

    return {
      content: `📊 **Анализ вашей текущей загрузки:**

📋 Всего задач: ${taskCount}
✅ Выполнено: ${completedTasks}
🔥 Высокий приоритет: ${highPriorityTasks}
📈 Прогресс: ${taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0}%

${taskCount > 10 ? '⚠️ У вас много задач. Рекомендую сосредоточиться на приоритетных.' : '✨ Загрузка оптимальная!'}

Нужна помощь с планированием?`
    };
  }

  if (input.includes('рекоменд') || input.includes('совет')) {
    return {
      content: `💡 **Рекомендации по эффективности:**

🎯 **Планирование:**
- Начинайте день с 3 самых важных задач
- Используйте технику Pomodoro (25 мин работы + 5 мин отдыха)
- Группируйте похожие задачи

⚡ **Приоритизация:**
- Матрица Эйзенхауэра: важное/срочное
- Правило 80/20: 20% задач дают 80% результата
- Делегируйте или исключайте неважные задачи

🔄 **Оптимизация:**
- Регулярно пересматривайте задачи
- Автоматизируйте повторяющиеся процессы
- Фиксируйте время на задачи

Хотите обсудить конкретную область?`
    };
  }

  // Общий ответ
  return {
    content: `Понял ваш запрос! Могу помочь с:

🔧 **Управление задачами:**
- Создание и редактирование
- Установка приоритетов
- Планирование сроков

📊 **Аналитика:**
- Анализ продуктивности
- Отчеты по проектам
- Статистика выполнения

💭 **Консультации:**
- Методы планирования
- Техники продуктивности
- Организация рабочего процесса

Что конкретно вас интересует?`
  };
};

export default AIAssistant;
