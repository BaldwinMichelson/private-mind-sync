import { keccak256, toUtf8Bytes } from 'ethers';

function deriveKeyFromAddress(addr: string): Uint8Array {
  const hash = keccak256(toUtf8Bytes(addr.toLowerCase()));
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = parseInt(hash.slice(2 + i * 2, 4 + i * 2), 16);
  }
  return key;
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function chacha20Encrypt(key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128,
    },
    cryptoKey,
    plaintext
  );
  
  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(nonce.length + encryptedArray.length);
  result.set(nonce, 0);
  result.set(encryptedArray, nonce.length);
  return result;
}

function validateKey(key: Uint8Array): boolean {
  return key.length === 32;
}

function validateNonce(nonce: Uint8Array): boolean {
  return nonce.length === 12;
}

export async function encryptDescription(description: string, userAddress: string): Promise<string> {
  const key = deriveKeyFromAddress(userAddress);
  const nonce = randomBytes(12);
  const plaintext = new TextEncoder().encode(description);
  const encrypted = await chacha20Encrypt(key, nonce, plaintext);
  return `0x${Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export async function decryptDescription(encryptedHex: string, userAddress: string): Promise<string> {
  const key = deriveKeyFromAddress(userAddress);
  const encrypted = new Uint8Array(
    encryptedHex.slice(2).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  const nonce = encrypted.slice(0, 12);
  const ciphertext = encrypted.slice(12);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128,
    },
    cryptoKey,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}

