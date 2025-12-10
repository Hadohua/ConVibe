// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Convibe Token ($CVB)
 * @notice Convibe 共识积分代币，用于铸造 SBT 徽章
 * @dev ERC-20 可销毁代币，支持授权铸造者
 * 
 * 代币经济：
 * - 用户通过验证 Spotify 数据获得 $CVB
 * - 铸造 SBT 徽章需要销毁相应数量的 $CVB
 * - Entry Tier: 100 CVB
 * - Veteran Tier: 500 CVB  
 * - OG Tier: 1000 CVB
 */
contract ConvibeToken is ERC20, ERC20Burnable, Ownable {
    
    // ============================================
    // 状态变量
    // ============================================
    
    /// @notice 授权的铸造者地址映射
    mapping(address => bool) public authorizedMinters;
    
    /// @notice 每小时听歌奖励的代币数量 (18 decimals)
    uint256 public rewardPerHour = 10 * 1e18; // 10 CVB per hour
    
    // ============================================
    // 事件
    // ============================================
    
    event MinterAuthorized(address indexed minter, bool authorized);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event RewardPerHourUpdated(uint256 oldValue, uint256 newValue);
    
    // ============================================
    // 构造函数
    // ============================================
    
    /**
     * @param initialOwner 合约所有者地址
     */
    constructor(address initialOwner) 
        ERC20("Convibe", "CVB") 
        Ownable(initialOwner) 
    {}
    
    // ============================================
    // 铸造函数
    // ============================================
    
    /**
     * @notice 铸造代币 (仅授权地址或 Owner)
     * @param to 接收地址
     * @param amount 数量 (18 decimals)
     */
    function mint(address to, uint256 amount) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(), 
            "ConvibeToken: Not authorized to mint"
        );
        _mint(to, amount);
        emit TokensMinted(to, amount, "authorized_mint");
    }
    
    /**
     * @notice 根据听歌小时数铸造代币 (仅授权地址或 Owner)
     * @param to 接收地址
     * @param hoursListened 听歌小时数
     */
    function mintForListening(address to, uint256 hoursListened) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(), 
            "ConvibeToken: Not authorized to mint"
        );
        uint256 amount = hoursListened * rewardPerHour;
        _mint(to, amount);
        emit TokensMinted(to, amount, "listening_reward");
    }
    
    // ============================================
    // 管理函数
    // ============================================
    
    /**
     * @notice 设置授权铸造者
     * @param minter 铸造者地址
     * @param authorized 是否授权
     */
    function setMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }
    
    /**
     * @notice 设置每小时听歌奖励
     * @param newRewardPerHour 新的奖励数量 (18 decimals)
     */
    function setRewardPerHour(uint256 newRewardPerHour) external onlyOwner {
        uint256 oldValue = rewardPerHour;
        rewardPerHour = newRewardPerHour;
        emit RewardPerHourUpdated(oldValue, newRewardPerHour);
    }
    
    // ============================================
    // 查询函数
    // ============================================
    
    /**
     * @notice 计算听歌时长对应的代币数量
     * @param hoursListened 听歌小时数
     * @return 代币数量 (18 decimals)
     */
    function calculateReward(uint256 hoursListened) external view returns (uint256) {
        return hoursListened * rewardPerHour;
    }
    
    /**
     * @notice 检查地址是否是授权铸造者
     * @param minter 地址
     * @return 是否授权
     */
    function isMinter(address minter) external view returns (bool) {
        return authorizedMinters[minter] || minter == owner();
    }
}
