// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IReclaimVerifier.sol";

/**
 * @title MusicConsensusSBT V3 - 链上验证版本
 * @notice 音乐品味共识灵魂绑定代币 (SBT) - 带 Reclaim 链上验证
 * @dev 只有通过 Reclaim Proof 验证才能铸造徽章
 * 
 * 安全升级：
 * - mintWithProof: 需要 Reclaim Proof 才能铸造
 * - 防止绕过前端验证直接调用合约
 * - 防止 Proof 重放攻击
 * 
 * Token ID 编码：genreId (1-10)
 * 
 * Genre ID 映射：
 * - 1: Pop          6: Jazz
 * - 2: Rock         7: Classical
 * - 3: Hip-Hop      8: Country
 * - 4: R&B          9: Indie
 * - 5: Electronic  10: Metal
 */
contract MusicConsensusSBTV3 is ERC1155, ERC1155Supply, Ownable {
    
    // ============================================
    // 常量
    // ============================================
    
    /// @notice 验证有效期 (90天)
    uint64 public constant VERIFICATION_VALIDITY = 90 days;
    
    /// @notice 最大 Genre ID
    uint256 public constant MAX_GENRE_ID = 10;
    
    /// @notice Tier 常量
    uint8 public constant TIER_ENTRY = 1;
    uint8 public constant TIER_VETERAN = 2;
    uint8 public constant TIER_OG = 3;
    
    /// @notice 状态常量
    uint8 public constant STATUS_INACTIVE = 0;
    uint8 public constant STATUS_ACTIVE = 1;
    
    // ============================================
    // 数据结构
    // ============================================
    
    /// @notice 徽章详细信息
    struct BadgeInfo {
        uint8 tier;
        uint64 lastVerified;
        uint8 status;
    }
    
    // ============================================
    // 状态变量
    // ============================================
    
    string public name;
    string public symbol;
    
    /// @notice Reclaim 合约地址
    address public reclaimAddress;
    
    /// @notice 流派名称映射
    mapping(uint256 => string) public genreNames;
    
    /// @notice 用户徽章详细信息
    mapping(address => mapping(uint256 => BadgeInfo)) public badgeInfo;
    
    /// @notice 已使用的 proof 哈希 (防止重放)
    mapping(bytes32 => bool) public usedProofs;
    
    // ============================================
    // 事件
    // ============================================
    
    event BadgeMinted(
        address indexed user, 
        uint256 indexed genreId, 
        string genreName,
        uint8 tier
    );
    
    event BadgeRefreshed(
        address indexed user, 
        uint256 indexed genreId,
        uint8 oldTier,
        uint8 newTier
    );
    
    event BadgeDecayed(address indexed user, uint256 indexed genreId);
    event BadgeBurned(address indexed user, uint256 indexed genreId);
    
    // ============================================
    // 构造函数
    // ============================================
    
    /**
     * @param initialOwner 合约所有者
     * @param baseUri 元数据 URI
     * @param _reclaimAddress Reclaim 合约地址 (Base Sepolia: 0xF90085f5Fd1a3bEb8678623409b3811eCeC5f6A5)
     */
    constructor(
        address initialOwner,
        string memory baseUri,
        address _reclaimAddress
    ) ERC1155(baseUri) Ownable(initialOwner) {
        name = "Music Consensus SBT V3";
        symbol = "MCSBT3";
        
        reclaimAddress = _reclaimAddress;
        
        // 初始化流派名称
        genreNames[1] = "Pop";
        genreNames[2] = "Rock";
        genreNames[3] = "Hip-Hop";
        genreNames[4] = "R&B";
        genreNames[5] = "Electronic";
        genreNames[6] = "Jazz";
        genreNames[7] = "Classical";
        genreNames[8] = "Country";
        genreNames[9] = "Indie";
        genreNames[10] = "Metal";
    }
    
    // ============================================
    // 灵魂绑定机制
    // ============================================
    
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Token is non-transferable");
        }
        super._update(from, to, ids, values);
    }
    
    // ============================================
    // 链上验证铸造 (核心安全函数)
    // ============================================
    
    /**
     * @notice 通过 Reclaim Proof 铸造徽章
     * @param proof Reclaim 验证证明
     * @param genreId 流派 ID (1-10)
     * @param tier 等级 (1-3)
     */
    function mintWithProof(
        Proof calldata proof,
        uint256 genreId,
        uint8 tier
    ) external {
        require(genreId >= 1 && genreId <= MAX_GENRE_ID, "Invalid genre ID");
        require(tier >= TIER_ENTRY && tier <= TIER_OG, "Invalid tier");
        require(badgeInfo[msg.sender][genreId].lastVerified == 0, "Badge already exists");
        
        // 计算 proof 哈希防止重放
        bytes32 proofHash = keccak256(abi.encode(
            proof.claimInfo.provider,
            proof.claimInfo.parameters,
            proof.signedClaim.claim.identifier
        ));
        require(!usedProofs[proofHash], "Proof already used");
        
        // 调用 Reclaim 合约验证 proof
        IReclaimVerifier(reclaimAddress).verifyProof(proof);
        
        // 标记 proof 已使用
        usedProofs[proofHash] = true;
        
        // 铸造徽章
        badgeInfo[msg.sender][genreId] = BadgeInfo({
            tier: tier,
            lastVerified: uint64(block.timestamp),
            status: STATUS_ACTIVE
        });
        
        _mint(msg.sender, genreId, 1, "");
        
        emit BadgeMinted(msg.sender, genreId, genreNames[genreId], tier);
    }
    
    /**
     * @notice 批量铸造 (需要 proof)
     */
    function mintBatchWithProof(
        Proof calldata proof,
        uint256[] calldata genreIds,
        uint8[] calldata tiers
    ) external {
        require(genreIds.length == tiers.length, "Arrays mismatch");
        require(genreIds.length > 0, "Empty arrays");
        
        // 验证 proof
        bytes32 proofHash = keccak256(abi.encode(
            proof.claimInfo.provider,
            proof.claimInfo.parameters,
            proof.signedClaim.claim.identifier
        ));
        require(!usedProofs[proofHash], "Proof already used");
        
        IReclaimVerifier(reclaimAddress).verifyProof(proof);
        usedProofs[proofHash] = true;
        
        // 批量铸造
        uint256[] memory amounts = new uint256[](genreIds.length);
        
        for (uint256 i = 0; i < genreIds.length; i++) {
            require(genreIds[i] >= 1 && genreIds[i] <= MAX_GENRE_ID, "Invalid genre ID");
            require(tiers[i] >= TIER_ENTRY && tiers[i] <= TIER_OG, "Invalid tier");
            require(badgeInfo[msg.sender][genreIds[i]].lastVerified == 0, "Badge exists");
            
            badgeInfo[msg.sender][genreIds[i]] = BadgeInfo({
                tier: tiers[i],
                lastVerified: uint64(block.timestamp),
                status: STATUS_ACTIVE
            });
            
            amounts[i] = 1;
            emit BadgeMinted(msg.sender, genreIds[i], genreNames[genreIds[i]], tiers[i]);
        }
        
        _mintBatch(msg.sender, genreIds, amounts, "");
    }
    
    // ============================================
    // 刷新徽章 (需要新的 proof)
    // ============================================
    
    function refreshBadgeWithProof(
        Proof calldata proof,
        uint256 genreId,
        uint8 newTier
    ) external {
        require(badgeInfo[msg.sender][genreId].lastVerified > 0, "Badge not owned");
        require(newTier >= TIER_ENTRY && newTier <= TIER_OG, "Invalid tier");
        
        // 验证 proof
        bytes32 proofHash = keccak256(abi.encode(
            proof.claimInfo.provider,
            proof.claimInfo.parameters,
            proof.signedClaim.claim.identifier
        ));
        require(!usedProofs[proofHash], "Proof already used");
        
        IReclaimVerifier(reclaimAddress).verifyProof(proof);
        usedProofs[proofHash] = true;
        
        BadgeInfo storage info = badgeInfo[msg.sender][genreId];
        uint8 oldTier = info.tier;
        
        info.lastVerified = uint64(block.timestamp);
        info.status = STATUS_ACTIVE;
        info.tier = newTier;
        
        emit BadgeRefreshed(msg.sender, genreId, oldTier, newTier);
    }
    
    // ============================================
    // 销毁徽章
    // ============================================
    
    function burnBadge(uint256 genreId) external {
        require(badgeInfo[msg.sender][genreId].lastVerified > 0, "Badge not owned");
        
        delete badgeInfo[msg.sender][genreId];
        _burn(msg.sender, genreId, 1);
        
        emit BadgeBurned(msg.sender, genreId);
    }
    
    // ============================================
    // 衰减机制
    // ============================================
    
    function checkAndDecayBadge(address user, uint256 genreId) external {
        BadgeInfo storage info = badgeInfo[user][genreId];
        
        if (info.lastVerified > 0 && info.status == STATUS_ACTIVE) {
            if (block.timestamp > info.lastVerified + VERIFICATION_VALIDITY) {
                info.status = STATUS_INACTIVE;
                emit BadgeDecayed(user, genreId);
            }
        }
    }
    
    // ============================================
    // 管理函数
    // ============================================
    
    function setURI(string memory newUri) external onlyOwner {
        _setURI(newUri);
    }
    
    function setReclaimAddress(address _reclaimAddress) external onlyOwner {
        reclaimAddress = _reclaimAddress;
    }
    
    function setGenreName(uint256 genreId, string memory genreName) external onlyOwner {
        genreNames[genreId] = genreName;
    }
    
    // ============================================
    // 查询函数
    // ============================================
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            if (badgeInfo[user][i].lastVerified > 0) {
                count++;
            }
        }
        
        uint256[] memory badges = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            if (badgeInfo[user][i].lastVerified > 0) {
                badges[index] = i;
                index++;
            }
        }
        
        return badges;
    }
    
    function getBadgeStatus(address user, uint256 genreId) external view returns (bool isActive) {
        BadgeInfo memory info = badgeInfo[user][genreId];
        
        if (info.lastVerified == 0) {
            return false;
        }
        
        if (block.timestamp <= info.lastVerified + VERIFICATION_VALIDITY) {
            return info.status == STATUS_ACTIVE;
        }
        
        return false;
    }
    
    function getBadgeInfo(address user, uint256 genreId) external view returns (
        uint8 tier,
        uint64 lastVerified,
        uint8 status,
        bool isExpired
    ) {
        BadgeInfo memory info = badgeInfo[user][genreId];
        
        bool expired = false;
        if (info.lastVerified > 0) {
            expired = block.timestamp > info.lastVerified + VERIFICATION_VALIDITY;
        }
        
        return (info.tier, info.lastVerified, info.status, expired);
    }
    
    function checkBadge(address user, uint256 genreId) external view returns (bool) {
        return badgeInfo[user][genreId].lastVerified > 0;
    }
    
    function hasBadge(address user, uint256 genreId) external view returns (bool) {
        return badgeInfo[user][genreId].lastVerified > 0;
    }
    
    function getActiveBadgesWithInfo(address user) external view returns (
        uint256[] memory genreIds,
        uint8[] memory tiers,
        bool[] memory isActives
    ) {
        uint256 count = 0;
        
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            if (badgeInfo[user][i].lastVerified > 0) {
                count++;
            }
        }
        
        genreIds = new uint256[](count);
        tiers = new uint8[](count);
        isActives = new bool[](count);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            BadgeInfo memory info = badgeInfo[user][i];
            if (info.lastVerified > 0) {
                genreIds[index] = i;
                tiers[index] = info.tier;
                isActives[index] = (info.status == STATUS_ACTIVE) && 
                    (block.timestamp <= info.lastVerified + VERIFICATION_VALIDITY);
                index++;
            }
        }
        
        return (genreIds, tiers, isActives);
    }
}
