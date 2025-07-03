// services/aiService.js
import { API_ENDPOINTS } from './constants';

class AIService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.conversationHistory = [];
  }

  async sendMessage(message, context = {}) {
    try {
      const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.AI_CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          message,
          context,
          history: this.conversationHistory.slice(-10) // Последние 10 сообщений
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Добавляем в историю
      this.conversationHistory.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }
      );

      return {
        success: true,
        response: data.response,
        suggestions: data.suggestions || [],
        actions: data.actions || []
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message || 'Не удалось получить ответ от ИИ помощника'
      };
    }
  }

  async generateTaskSuggestions(taskData) {
    try {
      const context = {
        type: 'task_suggestions',
        task: taskData,
        current_tasks: await this.getCurrentTasks()
      };

      const message = `Предложи улучшения для задачи: "${taskData.title}"`;
      return await this.sendMessage(message, context);
    } catch (error) {
      console.error('Generate Task Suggestions Error:', error);
      return {
        success: false,
        error: 'Не удалось получить предложения для задачи'
      };
    }
  }

  async generateTaskTitle(description) {
    try {
      const context = {
        type: 'generate_title',
        description
      };

      const message = `Создай краткое название для задачи на основе описания: "${description}"`;
      const result = await this.sendMessage(message, context);

      if (result.success) {
        return {
          success: true,
          title: result.response
        };
      }

      return result;
    } catch (error) {
      console.error('Generate Task Title Error:', error);
      return {
        success: false,
        error: 'Не удалось сгенерировать название задачи'
      };
    }
  }

  async estimateTaskComplexity(taskData) {
    try {
      const context = {
        type: 'estimate_complexity',
        task: taskData
      };

      const message = `Оцени сложность и время выполнения задачи: "${taskData.title}"`;
      const result = await this.sendMessage(message, context);

      if (result.success && result.actions) {
        const complexityAction = result.actions.find(action => action.type === 'set_complexity');
        const timeAction = result.actions.find(action => action.type === 'set_estimate');

        return {
          success: true,
          complexity: complexityAction?.value || 'medium',
          estimatedTime: timeAction?.value || 60,
          explanation: result.response
        };
      }

      return result;
    } catch (error) {
      console.error('Estimate Task Complexity Error:', error);
      return {
        success: false,
        error: 'Не удалось оценить сложность задачи'
      };
    }
  }

  async generateSubtasks(taskData) {
    try {
      const context = {
        type: 'generate_subtasks',
        task: taskData
      };

      const message = `Разбей задачу "${taskData.title}" на подзадачи`;
      const result = await this.sendMessage(message, context);

      if (result.success && result.actions) {
        const subtasksAction = result.actions.find(action => action.type === 'create_subtasks');

        return {
          success: true,
          subtasks: subtasksAction?.subtasks || [],
          explanation: result.response
        };
      }

      return result;
    } catch (error) {
      console.error('Generate Subtasks Error:', error);
      return {
        success: false,
        error: 'Не удалось создать подзадачи'
      };
    }
  }

  async analyzeWorkload() {
    try {
      const tasks = await this.getCurrentTasks();
      const context = {
        type: 'analyze_workload',
        tasks,
        user_id: this.getCurrentUserId()
      };

      const message = 'Проанализируй мою текущую рабочую нагрузку и дай рекомендации';
      return await this.sendMessage(message, context);
    } catch (error) {
      console.error('Analyze Workload Error:', error);
      return {
        success: false,
        error: 'Не удалось проанализировать рабочую нагрузку'
      };
    }
  }

  async suggestPriorities() {
    try {
      const tasks = await this.getCurrentTasks();
      const context = {
        type: 'suggest_priorities',
        tasks: tasks.filter(task => task.status !== 'done')
      };

      const message = 'Предложи приоритеты для моих текущих задач';
      const result = await this.sendMessage(message, context);

      if (result.success && result.actions) {
        const priorityActions = result.actions.filter(action => action.type === 'update_priority');

        return {
          success: true,
          prioritySuggestions: priorityActions,
          explanation: result.response
        };
      }

      return result;
    } catch (error) {
      console.error('Suggest Priorities Error:', error);
      return {
        success: false,
        error: 'Не удалось предложить приоритеты'
      };
    }
  }

  async generateReport(period = 'week') {
    try {
      const tasks = await this.getTasksForPeriod(period);
      const context = {
        type: 'generate_report',
        tasks,
        period
      };

      const message = `Создай отчет о продуктивности за ${period === 'week' ? 'неделю' : 'месяц'}`;
      return await this.sendMessage(message, context);
    } catch (error) {
      console.error('Generate Report Error:', error);
      return {
        success: false,
        error: 'Не удалось создать отчет'
      };
    }
  }

  async helpWithTask(taskId, question) {
    try {
      const task = await this.getTaskById(taskId);
      const context = {
        type: 'task_help',
        task,
        question
      };

      return await this.sendMessage(question, context);
    } catch (error) {
      console.error('Help With Task Error:', error);
      return {
        success: false,
        error: 'Не удалось получить помощь по задаче'
      };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  // Вспомогательные методы
  async getCurrentTasks() {
    try {
      const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.TASKS}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        return await response.json();
      }

      return [];
    } catch (error) {
      console.error('Get Current Tasks Error:', error);
      return [];
    }
  }

  async getTaskById(taskId) {
    try {
      const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.TASK(taskId)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('Get Task By Id Error:', error);
      return null;
    }
  }

  async getTasksForPeriod(period) {
    try {
      const endDate = new Date();
      const startDate = new Date();

      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      }

      const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.TASKS}?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        return await response.json();
      }

      return [];
    } catch (error) {
      console.error('Get Tasks For Period Error:', error);
      return [];
    }
  }

  getCurrentUserId() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id || payload.sub;
      }
      return null;
    } catch (error) {
      console.error('Get Current User Id Error:', error);
      return null;
    }
  }

  // Предустановленные команды
  getQuickCommands() {
    return [
      {
        title: 'Анализ нагрузки',
        command: 'Проанализируй мою текущую рабочую нагрузку',
        icon: '📊'
      },
      {
        title: 'Предложить приоритеты',
        command: 'Предложи приоритеты для моих задач',
        icon: '🎯'
      },
      {
        title: 'Создать отчет',
        command: 'Создай отчет о продуктивности за неделю',
        icon: '📈'
      },
      {
        title: 'Планирование дня',
        command: 'Помоги спланировать рабочий день',
        icon: '📅'
      },
      {
        title: 'Мотивация',
        command: 'Дай мотивирующий совет для работы',
        icon: '💪'
      }
    ];
  }
}

export default new AIService();
