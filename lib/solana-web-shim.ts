/**
 * Solana Web Shim - stub for @solana-program/system
 * 
 * Privy SDK has optional Solana dependencies which we don't need.
 * This shim provides empty exports to satisfy the import.
 */

export const getTransferSolInstruction = () => {
    throw new Error("Solana is not supported in this web build");
};

export const parseTransferSolInstruction = () => {
    throw new Error("Solana is not supported in this web build");
};

export const SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111";

export default {
    getTransferSolInstruction,
    parseTransferSolInstruction,
    SYSTEM_PROGRAM_ADDRESS,
};
