// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MusicConsensusSBT
 * @notice 音乐品味共识灵魂绑定代币 (SBT)
 * @dev 基于 ERC-1155 的不可转让代币，用于颁发音乐流派勋章
 * 
 * Token ID 映射：
 * - 1: Pop
 * - 2: Rock
 * - 3: Hip-Hop
 * - 4: R&B
 * - 5: Electronic
 * - 6: Jazz
 * - 7: Classical
 * - 8: Country
 * - 9: Indie
 * - 10: Metal
 */
contract MusicConsensusSBT is ERC1155, ERC1155Supply, Ownable {
    
    // ============================================
    // 状态变量
    // ============================================
    
    /// @notice 合约名称
    string public name;
    
    /// @notice 合约符号
    string public symbol;
    
    /// @notice 流派名称映射
    mapping(uint256 => string) public genreNames;
    
    /// @notice 用户已铸造的流派记录 (防止重复铸造)
    mapping(address => mapping(uint256 => bool)) public hasBadge;
    
    // ============================================
    // 事件
    // ============================================
    
    /// @notice 徽章铸造事件
    event BadgeMinted(address indexed user, uint256 indexed genreId, string genreName);
    
    /// @notice 徽章销毁事件
    event BadgeBurned(address indexed user, uint256 indexed genreId);
    
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
        name = "Music Consensus SBT";
        symbol = "MCSBT";
        
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
    // 铸造函数
    // ============================================
    
    /**
     * @notice 为用户铸造流派徽章
     * @param user 接收者地址
     * @param genreId 流派 ID (1-10)
     * @param data 附加数据
     */
    /**
     * @dev MVP 版本：任何用户可以为自己铸造
     * @dev 生产环境应改回 onlyOwner，由后端服务器验证后铸造
     */
    function mintBadge(
        address user,
        uint256 genreId,
        bytes memory data
    ) external {
        require(genreId >= 1 && genreId <= 10, "Invalid genre ID");
        require(!hasBadge[user][genreId], "Badge already minted");
        
        hasBadge[user][genreId] = true;
        _mint(user, genreId, 1, data);
        
        emit BadgeMinted(user, genreId, genreNames[genreId]);
    }
    
    /**
     * @notice 批量铸造多个流派徽章
     * @param user 接收者地址
     * @param genreIds 流派 ID 数组
     * @param data 附加数据
     */
    /**
     * @dev MVP 版本：任何用户可以为自己铸造
     */
    function mintBatchBadges(
        address user,
        uint256[] memory genreIds,
        bytes memory data
    ) external {
        uint256[] memory amounts = new uint256[](genreIds.length);
        
        for (uint256 i = 0; i < genreIds.length; i++) {
            require(genreIds[i] >= 1 && genreIds[i] <= 10, "Invalid genre ID");
            require(!hasBadge[user][genreIds[i]], "Badge already minted");
            
            hasBadge[user][genreIds[i]] = true;
            amounts[i] = 1;
            
            emit BadgeMinted(user, genreIds[i], genreNames[genreIds[i]]);
        }
        
        _mintBatch(user, genreIds, amounts, data);
    }
    
    // ============================================
    // 销毁函数
    // ============================================
    
    /**
     * @notice 销毁徽章 (用户自主选择)
     * @param genreId 流派 ID
     */
    function burnBadge(uint256 genreId) external {
        require(hasBadge[msg.sender][genreId], "Badge not owned");
        
        hasBadge[msg.sender][genreId] = false;
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
     * @notice 获取用户拥有的所有徽章
     * @param user 用户地址
     * @return badges 拥有的流派 ID 数组
     */
    function getUserBadges(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // 第一次遍历：计算数量
        for (uint256 i = 1; i <= 10; i++) {
            if (hasBadge[user][i]) {
                count++;
            }
        }
        
        // 创建结果数组
        uint256[] memory badges = new uint256[](count);
        uint256 index = 0;
        
        // 第二次遍历：填充数组
        for (uint256 i = 1; i <= 10; i++) {
            if (hasBadge[user][i]) {
                badges[index] = i;
                index++;
            }
        }
        
        return badges;
    }
    
    /**
     * @notice 检查用户是否拥有特定徽章
     * @param user 用户地址
     * @param genreId 流派 ID
     * @return 是否拥有
     */
    function checkBadge(address user, uint256 genreId) external view returns (bool) {
        return hasBadge[user][genreId];
    }
}
