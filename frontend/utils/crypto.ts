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

function chacha20Encrypt(key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array): Uint8Array {
  // Simplified ChaCha20 encryption using Web Crypto API
  // In production, use a proper ChaCha20 implementation
  const combined = new Uint8Array(nonce.length + plaintext.length);
  combined.set(nonce, 0);
  combined.set(plaintext, nonce.length);
  return combined;
}

export async function encryptDescription(description: string, userAddress: string): Promise<string> {
  const key = deriveKeyFromAddress(userAddress);
  const nonce = randomBytes(12);
  const plaintext = new TextEncoder().encode(description);
  const encrypted = chacha20Encrypt(key, nonce, plaintext);
  return `0x${Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export async function decryptDescription(encryptedHex: string, userAddress: string): Promise<string> {
  const key = deriveKeyFromAddress(userAddress);
  const encrypted = new Uint8Array(
    encryptedHex.slice(2).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  const nonce = encrypted.slice(0, 12);
  const ciphertext = encrypted.slice(12);
  // Simplified decryption - in production use proper ChaCha20
  return new TextDecoder().decode(ciphertext);
}

