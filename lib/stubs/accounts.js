function unsupported() {
  throw new Error('Tempo wallet is not enabled in Private Poker Faucet.');
}

export const Provider = {
  create: unsupported,
};

export const dialog = unsupported;
export const webAuthn = unsupported;
export const dangerous_secp256k1 = unsupported;
