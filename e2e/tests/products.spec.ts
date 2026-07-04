import { test, expect } from '@playwright/test';

test.describe('Produtos (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/produtos');
  });

  test('exibe página de produtos com título correto', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /produtos/i })).toBeVisible();
  });

  test('exibe campo de busca', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });

  test('botão Novo Produto está visível para admin', async ({ page }) => {
    await expect(page.getByRole('button', { name: /novo produto/i })).toBeVisible();
  });

  test('abre modal ao clicar em Novo Produto', async ({ page }) => {
    await page.getByRole('button', { name: /novo produto/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /novo produto/i })).toBeVisible();
  });

  test('fecha modal ao clicar em Cancelar', async ({ page }) => {
    await page.getByRole('button', { name: /novo produto/i }).click();
    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
