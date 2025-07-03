import { test, expect } from '@playwright/test';

test.describe('Task Tracker Frontend Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Check if we need to login
    const loginVisible = await page.locator('.login-container').isVisible().catch(() => false);
    if (loginVisible) {
      // Perform login
      await page.fill('input[type="email"]', 'demo@demo.com');
      await page.fill('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForSelector('.dashboard', { timeout: 5000 });
    }
  });

  test('should display dashboard with columns', async ({ page }) => {
    // Check if all columns are visible
    await expect(page.locator('.column').nth(0)).toBeVisible();
    await expect(page.locator('.column').nth(1)).toBeVisible();
    await expect(page.locator('.column').nth(2)).toBeVisible();
    await expect(page.locator('.column').nth(3)).toBeVisible();

    // Check column titles
    await expect(page.locator('.column-title').nth(0)).toContainText('To Do');
    await expect(page.locator('.column-title').nth(1)).toContainText('In Progress');
    await expect(page.locator('.column-title').nth(2)).toContainText('Review');
    await expect(page.locator('.column-title').nth(3)).toContainText('Done');
  });

  test('should create a new task', async ({ page }) => {
    // Click add task button in the first column
    await page.locator('.column').first().locator('.add-task-btn').click();

    // Fill in task form
    await page.fill('input[placeholder="Введите название задачи..."]', 'Test Task');
    await page.click('.quick-add-btn.save');

    // Verify task was created
    await expect(page.locator('.task-card').filter({ hasText: 'Test Task' })).toBeVisible();
  });

  test('should open and edit user profile', async ({ page }) => {
    // Click on user profile button
    await page.click('.user-button');

    // Wait for profile modal
    await expect(page.locator('.user-profile-container')).toBeVisible();

    // Click edit button
    await page.click('button:has-text("Редактировать")');

    // Edit name
    await page.fill('input[value="Demo User"]', 'Updated User');

    // Save changes
    await page.click('button:has-text("Сохранить изменения")');

    // Verify changes were saved
    await expect(page.locator('.user-button')).toContainText('Updated User');
  });

  test('should drag and drop task between columns', async ({ page }) => {
    // Create a task first
    await page.locator('.column').first().locator('.add-task-btn').click();
    await page.fill('input[placeholder="Введите название задачи..."]', 'Draggable Task');
    await page.click('.quick-add-btn.save');

    // Wait for task to appear
    const task = page.locator('.task-card').filter({ hasText: 'Draggable Task' });
    await expect(task).toBeVisible();

    // Drag task to second column
    const secondColumn = page.locator('.column').nth(1);
    await task.dragTo(secondColumn);

    // Verify task moved to second column
    await expect(secondColumn.locator('.task-card').filter({ hasText: 'Draggable Task' })).toBeVisible();
  });

  test('should edit existing task', async ({ page }) => {
    // Create a task first
    await page.locator('.column').first().locator('.add-task-btn').click();
    await page.fill('input[placeholder="Введите название задачи..."]', 'Task to Edit');
    await page.click('.quick-add-btn.save');

    // Click on the task to edit
    const task = page.locator('.task-card').filter({ hasText: 'Task to Edit' });
    await task.click();

    // Wait for task form modal
    await expect(page.locator('.modal-title').filter({ hasText: 'Edit Task' })).toBeVisible();

    // Edit task title
    await page.fill('input[name="title"]', 'Edited Task Title');

    // Save changes
    await page.click('button:has-text("Save")');

    // Verify task was updated
    await expect(page.locator('.task-card').filter({ hasText: 'Edited Task Title' })).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Create a task first
    await page.locator('.column').first().locator('.add-task-btn').click();
    await page.fill('input[placeholder="Введите название задачи..."]', 'Task to Delete');
    await page.click('.quick-add-btn.save');

    // Find the task
    const task = page.locator('.task-card').filter({ hasText: 'Task to Delete' });
    await expect(task).toBeVisible();

    // Click delete button
    await task.hover();
    await task.locator('.task-delete-btn').click();

    // Confirm deletion
    await page.click('button:has-text("Delete")');

    // Verify task was deleted
    await expect(task).not.toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    // Create tasks in different columns
    await page.locator('.column').nth(0).locator('.add-task-btn').click();
    await page.fill('input[placeholder="Введите название задачи..."]', 'Todo Task');
    await page.click('.quick-add-btn.save');

    await page.locator('.column').nth(1).locator('.add-task-btn').click();
    await page.fill('input[placeholder="Введите название задачи..."]', 'In Progress Task');
    await page.click('.quick-add-btn.save');

    // Apply filter
    await page.click('button:has-text("Filters")');
    await page.selectOption('select[name="status"]', 'todo');

    // Verify only todo tasks are visible
    await expect(page.locator('.task-card').filter({ hasText: 'Todo Task' })).toBeVisible();
    await expect(page.locator('.task-card').filter({ hasText: 'In Progress Task' })).not.toBeVisible();
  });

  test('should display task statistics', async ({ page }) => {
    // Check if statistics are displayed
    await expect(page.locator('.stat-card').nth(0)).toBeVisible();
    await expect(page.locator('.stat-card').nth(1)).toBeVisible();
    await expect(page.locator('.stat-card').nth(2)).toBeVisible();
    await expect(page.locator('.stat-card').nth(3)).toBeVisible();

    // Verify stat labels
    await expect(page.locator('.stat-label').nth(0)).toContainText('To Do');
    await expect(page.locator('.stat-label').nth(1)).toContainText('In Progress');
    await expect(page.locator('.stat-label').nth(2)).toContainText('Review');
    await expect(page.locator('.stat-label').nth(3)).toContainText('Done');
  });
});
