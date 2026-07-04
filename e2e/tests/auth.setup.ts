import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

setup('autenticar como admin', async ({ page }) => {
  await page.goto('/admin/login');

  await page.getByLabel(/e-mail/i).fill('admin@admin.com');
  await page.getByLabel(/senha/i).fill('admin');
  await page.getByRole('button', { name: /entrar/i }).click();

  // Aguarda redirecionamento para o painel de produtos
  await expect(page).toHaveURL(/admin\/produtos/);

  // Salva o estado de autenticação (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
