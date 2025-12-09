// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReclaimVerifier - Reclaim Protocol 验证接口
 * @notice 用于调用已部署的 Reclaim 合约验证 proof
 * @dev Base Sepolia 地址: 0xF90085f5Fd1a3bEb8678623409b3811eCeC5f6A5
 */

/// @notice Claim 信息结构
struct ClaimInfo {
    string provider;
    string parameters;
    string context;
}

/// @notice 完整的 Claim 数据
struct CompleteClaimData {
    bytes32 identifier;
    address owner;
    uint32 timestampS;
    uint32 epoch;
}

/// @notice 签名的 Claim
struct SignedClaim {
    CompleteClaimData claim;
    bytes[] signatures;
}

/// @notice Reclaim Proof 结构
struct Proof {
    ClaimInfo claimInfo;
    SignedClaim signedClaim;
}

/// @notice Reclaim 合约接口
interface IReclaimVerifier {
    function verifyProof(Proof calldata proof) external view;
}
