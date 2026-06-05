import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('P2P File Transfer End-to-End', async ({ context }) => {
  // We need two distinct browser pages to act as Sender and Receiver
  const pageA = await context.newPage(); // Sender
  const pageB = await context.newPage(); // Receiver

  // 1. Open Page A
  await pageA.goto('/');
  
  // Wait for PeerJS to initialize and render the Connection ID
  await pageA.waitForSelector('text="Your Connection ID"', { timeout: 10000 });
  const idLocator = pageA.locator('span.font-mono.text-5xl');
  const peerIdA = await idLocator.innerText();
  expect(peerIdA).toHaveLength(6);
  console.log(`Page A Peer ID: ${peerIdA}`);

  // 2. Open Page B
  await pageB.goto('/');
  await pageB.waitForSelector('text="Your Connection ID"', { timeout: 10000 });

  // 3. Connect B to A
  await pageB.locator('input[placeholder="Enter 6-character ID"]').fill(peerIdA);
  await pageB.locator('button:has-text("Connect")').click();

  // 4. Verify successful connection on both pages
  await expect(pageB.locator(`text=Connected to ${peerIdA}`)).toBeVisible({ timeout: 15000 });
  
  // Page A should show connected to B's ID. Let's just wait for the Connected text.
  await expect(pageA.locator('text=/Connected to/')).toBeVisible({ timeout: 15000 });
  console.log('Successfully connected!');

  // 5. Create a dummy file to upload
  const testFilePath = path.join(process.cwd(), 'tests', 'test-upload.txt');
  fs.writeFileSync(testFilePath, 'Hello, WebRTC! This is a test file chunking transfer.');

  // 6. Upload file from Page A
  await pageA.locator('input[type="file"]').setInputFiles(testFilePath);

  // 7. Verify progress and completion on both ends
  await expect(pageA.locator('text=Transfer Complete!')).toBeVisible({ timeout: 15000 });
  await expect(pageB.locator('text=Transfer Complete!')).toBeVisible({ timeout: 15000 });

  // 8. Verify the download button on the receiver side (Page B) appears
  const downloadLink = pageB.locator('a:has-text("Download File")');
  await expect(downloadLink).toBeVisible();
  
  const href = await downloadLink.getAttribute('href');
  expect(href).toContain('blob:');

  console.log('File successfully transferred and received as blob!');
  
  // Clean up
  fs.unlinkSync(testFilePath);
});
