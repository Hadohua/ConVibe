// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MusicConsensusSBT V2 - 动态共识版本
 * @notice 音乐品味共识灵魂绑定代币 (SBT) - 支持分层徽章和动态生命周期
 * @dev 基于 ERC-1155 的不可转让代币，实现"品味即资产，行为即共识"
 * 
 * 核心升级：
 * 1. Tiered Badges (分层徽章) - 根据 popularity 分为入门/资深/OG 三级
 * 2. Decay Mechanism (衰减机制) - 90天未验证的徽章变为 inactive
 * 3. Proof of Action (行为证明) - 预留属性存储支持 POAP 类功能
 * 
 * Token ID 编码：genreId (1-10)
 * 等级存储在 BadgeInfo 结构中
 * 
 * Genre ID 映射：
 * - 1: Pop          6: Jazz
 * - 2: Rock         7: Classical
 * - 3: Hip-Hop      8: Country
 * - 4: R&B          9: Indie
 * - 5: Electronic  10: Metal
 */
contract MusicConsensusSBT is ERC1155, ERC1155Supply, Ownable {
    
    // ============================================
    // 常量
    // ============================================
    
    /// @notice 验证有效期 (90天 = 90 * 24 * 60 * 60 秒)
    uint64 public constant VERIFICATION_VALIDITY = 90 days;
    
    /// @notice 最大 Genre ID
    uint256 public constant MAX_GENRE_ID = 10;
    
    /// @notice Tier 常量
    uint8 public constant TIER_ENTRY = 1;    // 入门
    uint8 public constant TIER_VETERAN = 2;  // 资深
    uint8 public constant TIER_OG = 3;       // OG
    
    /// @notice 状态常量
    uint8 public constant STATUS_INACTIVE = 0;
    uint8 public constant STATUS_ACTIVE = 1;
    
    // ============================================
    // 数据结构
    // ============================================
    
    /// @notice 徽章详细信息
    struct BadgeInfo {
        uint8 tier;            // 1=入门, 2=资深, 3=OG
        uint64 lastVerified;   // 最后验证时间戳
        uint8 status;          // 0=inactive, 1=active
    }
    
    /// @notice 行为证明属性 (POAP 类扩展)
    struct ActionProof {
        string actionType;     // 如 "concert", "festival", "meetup"
        string eventName;      // 事件名称
        uint64 timestamp;      // 发生时间
        string location;       // 位置 (可选)
    }
    
    // ============================================
    // 状态变量
    // ============================================
    
    /// @notice 合约名称
    string public name;
    
    /// @notice 合约符号
    string public symbol;
    
    /// @notice 流派名称映射
    mapping(uint256 => string) public genreNames;
    
    /// @notice 用户徽章详细信息 (user => genreId => BadgeInfo)
    mapping(address => mapping(uint256 => BadgeInfo)) public badgeInfo;
    
    /// @notice 用户行为证明 (user => genreId => ActionProof[])
    mapping(address => mapping(uint256 => ActionProof[])) public actionProofs;
    
    // ============================================
    // 事件
    // ============================================
    
    /// @notice 徽章铸造事件 (含等级)
    event BadgeMinted(
        address indexed user, 
        uint256 indexed genreId, 
        string genreName,
        uint8 tier
    );
    
    /// @notice 徽章刷新事件
    event BadgeRefreshed(
        address indexed user, 
        uint256 indexed genreId,
        uint8 oldTier,
        uint8 newTier
    );
    
    /// @notice 徽章衰减事件
    event BadgeDecayed(address indexed user, uint256 indexed genreId);
    
    /// @notice 徽章销毁事件
    event BadgeBurned(address indexed user, uint256 indexed genreId);
    
    /// @notice 行为证明添加事件
    event ActionProofAdded(
        address indexed user,
        uint256 indexed genreId,
        string actionType,
        string eventName
    );
    
    // ============================================
    // 构造函数
    // ============================================
    
    /**
     * @notice 初始化合约
     * @param initialOwner 合约所有者地址
     * @param baseUri 元数据基础 URI (IPFS 链接)
     */
    constructor(
        address initialOwner,
        string memory baseUri
    ) ERC1155(baseUri) Ownable(initialOwner) {
        name = "Music Consensus SBT V2";
        symbol = "MCSBT2";
        
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
    // 灵魂绑定机制 (核心)
    // ============================================
    
    /**
     * @notice 重写 _update 钩子实现灵魂绑定
     * @dev 只允许铸造 (from == 0) 和销毁 (to == 0)，禁止转账
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        // 灵魂绑定检查：禁止用户间转账
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Token is non-transferable");
        }
        
        super._update(from, to, ids, values);
    }
    
    // ============================================
    // 分层铸造函数
    // ============================================
    
    /**
     * @notice 铸造分层徽章 (V2 核心函数)
     * @param user 接收者地址
     * @param genreId 流派 ID (1-10)
     * @param tier 等级 (1=入门, 2=资深, 3=OG)
     * @param data 附加数据
     */
    function mintTieredBadge(
        address user,
        uint256 genreId,
        uint8 tier,
        bytes memory data
    ) external {
        require(genreId >= 1 && genreId <= MAX_GENRE_ID, "Invalid genre ID");
        require(tier >= TIER_ENTRY && tier <= TIER_OG, "Invalid tier");
        require(badgeInfo[user][genreId].lastVerified == 0, "Badge already exists");
        
        // 设置徽章信息
        badgeInfo[user][genreId] = BadgeInfo({
            tier: tier,
            lastVerified: uint64(block.timestamp),
            status: STATUS_ACTIVE
        });
        
        // 铸造 SBT
        _mint(user, genreId, 1, data);
        
        emit BadgeMinted(user, genreId, genreNames[genreId], tier);
    }
    
    /**
     * @notice 批量铸造分层徽章
     * @param user 接收者地址
     * @param genreIds 流派 ID 数组
     * @param tiers 对应等级数组
     * @param data 附加数据
     */
    function mintBatchTieredBadges(
        address user,
        uint256[] memory genreIds,
        uint8[] memory tiers,
        bytes memory data
    ) external {
        require(genreIds.length == tiers.length, "Arrays length mismatch");
        
        uint256[] memory amounts = new uint256[](genreIds.length);
        
        for (uint256 i = 0; i < genreIds.length; i++) {
            require(genreIds[i] >= 1 && genreIds[i] <= MAX_GENRE_ID, "Invalid genre ID");
            require(tiers[i] >= TIER_ENTRY && tiers[i] <= TIER_OG, "Invalid tier");
            require(badgeInfo[user][genreIds[i]].lastVerified == 0, "Badge already exists");
            
            badgeInfo[user][genreIds[i]] = BadgeInfo({
                tier: tiers[i],
                lastVerified: uint64(block.timestamp),
                status: STATUS_ACTIVE
            });
            
            amounts[i] = 1;
            
            emit BadgeMinted(user, genreIds[i], genreNames[genreIds[i]], tiers[i]);
        }
        
        _mintBatch(user, genreIds, amounts, data);
    }
    
    // ============================================
    // 旧版兼容函数 (向后兼容)
    // ============================================
    
    /**
     * @notice 兼容旧版铸造 (默认 tier = 1)
     * @dev 保持向后兼容性
     */
    function mintBadge(
        address user,
        uint256 genreId,
        bytes memory data
    ) external {
        require(genreId >= 1 && genreId <= MAX_GENRE_ID, "Invalid genre ID");
        require(badgeInfo[user][genreId].lastVerified == 0, "Badge already exists");
        
        badgeInfo[user][genreId] = BadgeInfo({
            tier: TIER_ENTRY,
            lastVerified: uint64(block.timestamp),
            status: STATUS_ACTIVE
        });
        
        _mint(user, genreId, 1, data);
        
        emit BadgeMinted(user, genreId, genreNames[genreId], TIER_ENTRY);
    }
    
    /**
     * @notice 兼容旧版批量铸造 (默认 tier = 1)
     */
    function mintBatchBadges(
        address user,
        uint256[] memory genreIds,
        bytes memory data
    ) external {
        uint256[] memory amounts = new uint256[](genreIds.length);
        
        for (uint256 i = 0; i < genreIds.length; i++) {
            require(genreIds[i] >= 1 && genreIds[i] <= MAX_GENRE_ID, "Invalid genre ID");
            require(badgeInfo[user][genreIds[i]].lastVerified == 0, "Badge already exists");
            
            badgeInfo[user][genreIds[i]] = BadgeInfo({
                tier: TIER_ENTRY,
                lastVerified: uint64(block.timestamp),
                status: STATUS_ACTIVE
            });
            
            amounts[i] = 1;
            
            emit BadgeMinted(user, genreIds[i], genreNames[genreIds[i]], TIER_ENTRY);
        }
        
        _mintBatch(user, genreIds, amounts, data);
    }
    
    // ============================================
    // 刷新 & 衰减机制
    // ============================================
    
    /**
     * @notice 刷新徽章验证 (更新时间戳，可能更新等级)
     * @param genreId 流派 ID
     * @param newTier 新等级 (如品味变化)
     */
    function refreshBadge(uint256 genreId, uint8 newTier) external {
        require(badgeInfo[msg.sender][genreId].lastVerified > 0, "Badge not owned");
        require(newTier >= TIER_ENTRY && newTier <= TIER_OG, "Invalid tier");
        
        BadgeInfo storage info = badgeInfo[msg.sender][genreId];
        uint8 oldTier = info.tier;
        
        // 更新验证信息
        info.lastVerified = uint64(block.timestamp);
        info.status = STATUS_ACTIVE;
        info.tier = newTier;
        
        emit BadgeRefreshed(msg.sender, genreId, oldTier, newTier);
    }
    
    /**
     * @notice 检查并标记过期徽章 (任何人可调用)
     * @param user 用户地址
     * @param genreId 流派 ID
     */
    function checkAndDecayBadge(address user, uint256 genreId) external {
        BadgeInfo storage info = badgeInfo[user][genreId];
        
        if (info.lastVerified > 0 && info.status == STATUS_ACTIVE) {
            if (block.timestamp > info.lastVerified + VERIFICATION_VALIDITY) {
                info.status = STATUS_INACTIVE;
                emit BadgeDecayed(user, genreId);
            }
        }
    }
    
    /**
     * @notice 批量检查衰减
     * @param user 用户地址
     */
    function checkAllBadgesDecay(address user) external {
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            BadgeInfo storage info = badgeInfo[user][i];
            
            if (info.lastVerified > 0 && info.status == STATUS_ACTIVE) {
                if (block.timestamp > info.lastVerified + VERIFICATION_VALIDITY) {
                    info.status = STATUS_INACTIVE;
                    emit BadgeDecayed(user, i);
                }
            }
        }
    }
    
    // ============================================
    // 行为证明 (POAP 扩展)
    // ============================================
    
    /**
     * @notice 为徽章添加行为证明
     * @param user 用户地址
     * @param genreId 流派 ID
     * @param actionType 行为类型 (concert/festival/meetup)
     * @param eventName 事件名称
     * @param location 位置 (可选)
     */
    function addActionProof(
        address user,
        uint256 genreId,
        string memory actionType,
        string memory eventName,
        string memory location
    ) external onlyOwner {
        require(badgeInfo[user][genreId].lastVerified > 0, "Badge not owned");
        
        actionProofs[user][genreId].push(ActionProof({
            actionType: actionType,
            eventName: eventName,
            timestamp: uint64(block.timestamp),
            location: location
        }));
        
        emit ActionProofAdded(user, genreId, actionType, eventName);
    }
    
    /**
     * @notice 获取用户某徽章的行为证明数量
     */
    function getActionProofCount(address user, uint256 genreId) external view returns (uint256) {
        return actionProofs[user][genreId].length;
    }
    
    /**
     * @notice 获取特定行为证明
     */
    function getActionProof(
        address user, 
        uint256 genreId, 
        uint256 index
    ) external view returns (ActionProof memory) {
        require(index < actionProofs[user][genreId].length, "Index out of bounds");
        return actionProofs[user][genreId][index];
    }
    
    // ============================================
    // 销毁函数
    // ============================================
    
    /**
     * @notice 销毁徽章 (用户自主选择)
     * @param genreId 流派 ID
     */
    function burnBadge(uint256 genreId) external {
        require(badgeInfo[msg.sender][genreId].lastVerified > 0, "Badge not owned");
        
        // 清除徽章信息
        delete badgeInfo[msg.sender][genreId];
        delete actionProofs[msg.sender][genreId];
        
        _burn(msg.sender, genreId, 1);
        
        emit BadgeBurned(msg.sender, genreId);
    }
    
    // ============================================
    // 元数据管理
    // ============================================
    
    /**
     * @notice 更新元数据 URI
     * @param newUri 新的 IPFS 链接
     */
    function setURI(string memory newUri) external onlyOwner {
        _setURI(newUri);
    }
    
    /**
     * @notice 添加或更新流派名称
     * @param genreId 流派 ID
     * @param genreName 流派名称
     */
    function setGenreName(uint256 genreId, string memory genreName) external onlyOwner {
        genreNames[genreId] = genreName;
    }
    
    // ============================================
    // 查询函数
    // ============================================
    
    /**
     * @notice 获取用户拥有的所有徽章 ID
     * @param user 用户地址
     * @return badges 拥有的流派 ID 数组
     */
    function getUserBadges(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // 第一次遍历：计算数量
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            if (badgeInfo[user][i].lastVerified > 0) {
                count++;
            }
        }
        
        // 创建结果数组
        uint256[] memory badges = new uint256[](count);
        uint256 index = 0;
        
        // 第二次遍历：填充数组
        for (uint256 i = 1; i <= MAX_GENRE_ID; i++) {
            if (badgeInfo[user][i].lastVerified > 0) {
                badges[index] = i;
                index++;
            }
        }
        
        return badges;
    }
    
    /**
     * @notice 获取徽章状态是否活跃 (未过期)
     * @param user 用户地址
     * @param genreId 流派 ID
     * @return isActive 是否活跃
     */
    function getBadgeStatus(address user, uint256 genreId) external view returns (bool isActive) {
        BadgeInfo memory info = badgeInfo[user][genreId];
        
        if (info.lastVerified == 0) {
            return false;
        }
        
        // 检查是否在有效期内
        if (block.timestamp <= info.lastVerified + VERIFICATION_VALIDITY) {
            return info.status == STATUS_ACTIVE;
        }
        
        return false;
    }
    
    /**
     * @notice 获取徽章详细信息
     * @param user 用户地址
     * @param genreId 流派 ID
     */
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
    
    /**
     * @notice 检查用户是否拥有特定徽章 (向后兼容)
     * @param user 用户地址
     * @param genreId 流派 ID
     * @return 是否拥有
     */
    function checkBadge(address user, uint256 genreId) external view returns (bool) {
        return badgeInfo[user][genreId].lastVerified > 0;
    }
    
    /**
     * @notice 向后兼容的 hasBadge 查询
     */
    function hasBadge(address user, uint256 genreId) external view returns (bool) {
        return badgeInfo[user][genreId].lastVerified > 0;
    }
    
    /**
     * @notice 获取用户所有活跃徽章的详细信息
     * @param user 用户地址
     * @return genreIds 流派 ID 数组
     * @return tiers 等级数组
     * @return isActives 活跃状态数组
     */
    function getActiveBadgesWithInfo(address user) external view returns (
        uint256[] memory genreIds,
        uint8[] memory tiers,
        bool[] memory isActives
    ) {
        uint256 count = 0;
        
        // 计算数量
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
