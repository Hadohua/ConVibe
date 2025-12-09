// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IReclaimVerifier.sol";

/**
 * @title MusicConsensusSBT V4 - $CVIB 集成版本
 * @notice 音乐品味共识灵魂绑定代币 (SBT) - 需要销毁 $CVIB 铸造
 * @dev 铸造徽章前必须销毁相应数量的 $CVIB 代币
 * 
 * V4 升级：
 * - mintWithCVIB: 销毁 $CVIB 铸造徽章
 * - 可配置的 Tier 成本
 * - 保留 Reclaim Proof 作为备选验证
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
contract MusicConsensusSBTV4 is ERC1155, ERC1155Supply, Ownable {
    
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
    
    /// @notice $CVIB Token 地址
    address public vibeTokenAddress;
    
    /// @notice 流派名称映射
    mapping(uint256 => string) public genreNames;
    
    /// @notice 用户徽章详细信息
    mapping(address => mapping(uint256 => BadgeInfo)) public badgeInfo;
    
    /// @notice 已使用的 proof 哈希 (防止重放)
    mapping(bytes32 => bool) public usedProofs;
    
    /// @notice 各 Tier 所需 $CVIB 数量 (18 decimals)
    mapping(uint8 => uint256) public tierCost;
    
    // ============================================
    // 事件
    // ============================================
    
    event BadgeMinted(
        address indexed user, 
        uint256 indexed genreId, 
        string genreName,
        uint8 tier
    );
    
    event BadgeMintedWithCVIB(
        address indexed user,
        uint256 indexed genreId,
        string genreName,
        uint8 tier,
        uint256 cvibBurned
    );
    
    event BadgeRefreshed(
        address indexed user, 
        uint256 indexed genreId,
        uint8 oldTier,
        uint8 newTier
    );
    
    event BadgeDecayed(address indexed user, uint256 indexed genreId);
    event BadgeBurned(address indexed user, uint256 indexed genreId);
    event TierCostUpdated(uint8 indexed tier, uint256 oldCost, uint256 newCost);
    
    // ============================================
    // 构造函数
    // ============================================
    
    /**
     * @param initialOwner 合约所有者
     * @param baseUri 元数据 URI
     * @param _reclaimAddress Reclaim 合约地址 (Base Sepolia: 0xF90085f5Fd1a3bEb8678623409b3811eCeC5f6A5)
     * @param _vibeTokenAddress $CVIB 代币合约地址
     */
    constructor(
        address initialOwner,
        string memory baseUri,
        address _reclaimAddress,
        address _vibeTokenAddress
    ) ERC1155(baseUri) Ownable(initialOwner) {
        name = "Music Consensus SBT V4";
        symbol = "MCSBT4";
        
        reclaimAddress = _reclaimAddress;
        vibeTokenAddress = _vibeTokenAddress;
        
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
        
        // 设置默认 Tier 成本 (18 decimals)
        tierCost[TIER_ENTRY] = 100 * 1e18;    // 100 CVIB
        tierCost[TIER_VETERAN] = 500 * 1e18;  // 500 CVIB
        tierCost[TIER_OG] = 1000 * 1e18;      // 1000 CVIB
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
    // $CVIB 铸造函数 (V4 核心)
    // ============================================
    
    /**
     * @notice 通过销毁 $CVIB 铸造徽章
     * @dev 用户需要先 approve 足够的 $CVIB 给本合约
     * @param genreId 流派 ID (1-10)
     * @param tier 等级 (1-3)
     */
    function mintWithCVIB(
        uint256 genreId,
        uint8 tier
    ) external {
        require(genreId >= 1 && genreId <= MAX_GENRE_ID, "Invalid genre ID");
        require(tier >= TIER_ENTRY && tier <= TIER_OG, "Invalid tier");
        require(badgeInfo[msg.sender][genreId].lastVerified == 0, "Badge already exists");
        
        uint256 cost = tierCost[tier];
        require(cost > 0, "Invalid tier cost");
        
        // 检查用户 $CVIB 余额
        require(
            IERC20(vibeTokenAddress).balanceOf(msg.sender) >= cost,
            "Insufficient CVIB balance"
        );
        
        // 销毁用户的 $CVIB (需要用户先 approve)
        ERC20Burnable(vibeTokenAddress).burnFrom(msg.sender, cost);
        
        // 铸造徽章
        badgeInfo[msg.sender][genreId] = BadgeInfo({
            tier: tier,
            lastVerified: uint64(block.timestamp),
            status: STATUS_ACTIVE
        });
        
        _mint(msg.sender, genreId, 1, "");
        
        emit BadgeMintedWithCVIB(msg.sender, genreId, genreNames[genreId], tier, cost);
    }
    
    /**
     * @notice 批量通过 $CVIB 铸造徽章
     * @param genreIds 流派 ID 数组
     * @param tiers 等级数组
     */
    function mintBatchWithCVIB(
        uint256[] calldata genreIds,
        uint8[] calldata tiers
    ) external {
        require(genreIds.length == tiers.length, "Arrays mismatch");
        require(genreIds.length > 0, "Empty arrays");
        
        // 计算总成本
        uint256 totalCost = 0;
        for (uint256 i = 0; i < tiers.length; i++) {
            require(tiers[i] >= TIER_ENTRY && tiers[i] <= TIER_OG, "Invalid tier");
            totalCost += tierCost[tiers[i]];
        }
        
        // 检查余额
        require(
            IERC20(vibeTokenAddress).balanceOf(msg.sender) >= totalCost,
            "Insufficient CVIB balance"
        );
        
        // 销毁 $CVIB
        ERC20Burnable(vibeTokenAddress).burnFrom(msg.sender, totalCost);
        
        // 批量铸造
        uint256[] memory amounts = new uint256[](genreIds.length);
        
        for (uint256 i = 0; i < genreIds.length; i++) {
            require(genreIds[i] >= 1 && genreIds[i] <= MAX_GENRE_ID, "Invalid genre ID");
            require(badgeInfo[msg.sender][genreIds[i]].lastVerified == 0, "Badge exists");
            
            badgeInfo[msg.sender][genreIds[i]] = BadgeInfo({
                tier: tiers[i],
                lastVerified: uint64(block.timestamp),
                status: STATUS_ACTIVE
            });
            
            amounts[i] = 1;
            emit BadgeMintedWithCVIB(
                msg.sender, 
                genreIds[i], 
                genreNames[genreIds[i]], 
                tiers[i],
                tierCost[tiers[i]]
            );
        }
        
        _mintBatch(msg.sender, genreIds, amounts, "");
    }
    
    /**
     * @notice 升级徽章等级 (需要补差价)
     * @param genreId 流派 ID
     * @param newTier 新等级 (必须高于当前等级)
     */
    function upgradeBadgeWithCVIB(
        uint256 genreId,
        uint8 newTier
    ) external {
        BadgeInfo storage info = badgeInfo[msg.sender][genreId];
        require(info.lastVerified > 0, "Badge not owned");
        require(newTier > info.tier, "New tier must be higher");
        require(newTier <= TIER_OG, "Invalid tier");
        
        // 计算差价
        uint256 currentCost = tierCost[info.tier];
        uint256 newCost = tierCost[newTier];
        uint256 upgradeCost = newCost - currentCost;
        
        // 销毁差价
        ERC20Burnable(vibeTokenAddress).burnFrom(msg.sender, upgradeCost);
        
        uint8 oldTier = info.tier;
        info.tier = newTier;
        info.lastVerified = uint64(block.timestamp);
        info.status = STATUS_ACTIVE;
        
        emit BadgeRefreshed(msg.sender, genreId, oldTier, newTier);
    }
    
    // ============================================
    // 链上验证铸造 (保留 Reclaim 作为备选)
    // ============================================
    
    /**
     * @notice 通过 Reclaim Proof 铸造徽章 (备选路径)
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
    
    function setVibeTokenAddress(address _vibeTokenAddress) external onlyOwner {
        vibeTokenAddress = _vibeTokenAddress;
    }
    
    function setGenreName(uint256 genreId, string memory genreName) external onlyOwner {
        genreNames[genreId] = genreName;
    }
    
    function setTierCost(uint8 tier, uint256 cost) external onlyOwner {
        require(tier >= TIER_ENTRY && tier <= TIER_OG, "Invalid tier");
        uint256 oldCost = tierCost[tier];
        tierCost[tier] = cost;
        emit TierCostUpdated(tier, oldCost, cost);
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
    
    /**
     * @notice 获取铸造所需的 $CVIB 成本
     */
    function getMintCost(uint8 tier) external view returns (uint256) {
        return tierCost[tier];
    }
    
    /**
     * @notice 获取升级所需的 $CVIB 成本
     */
    function getUpgradeCost(address user, uint256 genreId, uint8 newTier) external view returns (uint256) {
        BadgeInfo memory info = badgeInfo[user][genreId];
        if (info.lastVerified == 0 || newTier <= info.tier) {
            return 0;
        }
        return tierCost[newTier] - tierCost[info.tier];
    }
}
