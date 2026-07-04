import { test, expect } from '@playwright/test';

// Estes testes rodam SEM estado de autenticação (não usam storageState)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticação', () => {
  test('redireciona para /admin/login quando não autenticado', async ({ page }) => {
    await page.goto('/admin/produtos');
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('exibe formulário de login', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('exibe erro para credenciais inválidas', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/e-mail/i).fill('invalido@test.com');
    await page.getByLabel(/senha/i).fill('SenhaErrada123');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(
      page.getByText(/e-mail ou senha inválidos/i),
    ).toBeVisible({ timeout: 5000 });
  });
});
