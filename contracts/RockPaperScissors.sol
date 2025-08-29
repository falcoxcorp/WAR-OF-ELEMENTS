// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Rock Paper Scissors Arena - BSC Edition
 * @dev Migrated from CORE network to Binance Smart Chain
 * @author OMDB Arena Team
 * 
 * MIGRATION CHANGES:
 * - Updated for BSC network compatibility (Chain ID: 56 mainnet, 97 testnet)
 * - Optimized gas costs for BSC network characteristics
 * - Removed CORE-specific dependencies
 * - Updated to use BNB as native currency
 * - Enhanced for BSC ecosystem integration
 */

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RockPaperScissors is ReentrancyGuard, Ownable, Pausable {
    
    // ============ ENUMS ============
    
    enum Move { None, Rock, Paper, Scissors }
    enum GameStatus { Open, Completed, Expired, RevealPhase }
    
    // ============ STRUCTS ============
    
    struct Game {
        address creator;
        bytes32 creatorMoveHash;
        Move creatorMove;
        address opponent;
        Move opponentMove;
        uint256 betAmount;
        GameStatus status;
        address winner;
        uint256 createdAt;
        uint256 revealDeadline;
        address referrer;
    }
    
    struct PlayerStats {
        uint256 wins;
        uint256 losses;
        uint256 ties;
        uint256 gamesPlayed;
        uint256 totalWagered;
        uint256 totalWon;
        uint256 referralEarnings;
        uint256 lastPlayed;
        uint256 monthlyScore;
    }
    
    // ============ STATE VARIABLES ============
    
    // Game management
    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    
    // Player management
    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool) public isPlayer;
    address[] public players;
    
    // Financial management
    uint256 public rewardPool;
    uint256 public feePercentage = 15; // 15% total fee (10% platform + 5% reward pool)
    address public feeWallet;
    mapping(address => uint256) public referralEarnings;
    
    // BSC-specific configurations
    uint256 public constant REVEAL_TIMEOUT = 24 hours; // BSC block time optimized
    uint256 public constant MIN_BET = 0.001 ether; // 0.001 BNB minimum
    uint256 public constant MAX_BET = 1000 ether; // 1000 BNB maximum
    
    // Monthly leaderboard (optimized for BSC gas costs)
    mapping(address => uint256) public monthlyScores;
    address[] public topMonthlyPlayers;
    uint256 public lastRewardDistribution;
    
    // ============ EVENTS ============
    
    event GameCreated(
        uint256 indexed gameId, 
        address indexed creator, 
        uint256 betAmount, 
        bytes32 moveHash,
        address referrer
    );
    
    event GameJoined(
        uint256 indexed gameId, 
        address indexed opponent, 
        Move move
    );
    
    event MoveRevealed(
        uint256 indexed gameId, 
        address indexed creator, 
        Move move
    );
    
    event GameCompleted(
        uint256 indexed gameId, 
        address indexed winner
    );
    
    event GameCanceled(
        uint256 indexed gameId, 
        address indexed creator
    );
    
    event PlayerStatsUpdated(
        address indexed player, 
        uint256 wins, 
        uint256 losses, 
        uint256 ties
    );
    
    event ReferralEarned(
        address indexed referrer, 
        uint256 amount
    );
    
    event RewardPoolIncreased(uint256 amount);
    
    event RewardsDistributed(
        address[] winners, 
        uint256[] amounts
    );
    
    event FeeWalletUpdated(
        address indexed oldWallet, 
        address indexed newWallet
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    // ============ MODIFIERS ============
    
    modifier validGameId(uint256 _gameId) {
        require(_gameId > 0 && _gameId <= gameCounter, "Invalid game ID");
        _;
    }
    
    modifier gameExists(uint256 _gameId) {
        require(games[_gameId].creator != address(0), "Game does not exist");
        _;
    }
    
    modifier onlyGameCreator(uint256 _gameId) {
        require(games[_gameId].creator == msg.sender, "Only game creator can perform this action");
        _;
    }
    
    modifier onlyGameOpponent(uint256 _gameId) {
        require(games[_gameId].opponent == msg.sender, "Only game opponent can perform this action");
        _;
    }
    
    modifier validBetAmount() {
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Bet amount out of range");
        _;
    }
    
    modifier validMove(Move _move) {
        require(_move >= Move.Rock && _move <= Move.Scissors, "Invalid move");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize contract with fee wallet
     * @param _feeWallet Address to receive platform fees
     */
    constructor(address _feeWallet) {
        require(_feeWallet != address(0), "Fee wallet cannot be zero address");
        feeWallet = _feeWallet;
        lastRewardDistribution = block.timestamp;
        
        // Initialize contract on BSC
        emit FeeWalletUpdated(address(0), _feeWallet);
    }
    
    // ============ GAME FUNCTIONS ============
    
    /**
     * @dev Create a new game with encrypted move
     * @param _moveHash Keccak256 hash of (move + secret)
     * @param _referrer Optional referrer address for commission
     */
    function createGame(bytes32 _moveHash, address _referrer) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validBetAmount 
    {
        require(_moveHash != bytes32(0), "Move hash cannot be empty");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        games[gameId] = Game({
            creator: msg.sender,
            creatorMoveHash: _moveHash,
            creatorMove: Move.None,
            opponent: address(0),
            opponentMove: Move.None,
            betAmount: msg.value,
            status: GameStatus.Open,
            winner: address(0),
            createdAt: block.timestamp,
            revealDeadline: 0,
            referrer: _referrer
        });
        
        // Register player if new
        if (!isPlayer[msg.sender]) {
            isPlayer[msg.sender] = true;
            players.push(msg.sender);
        }
        
        emit GameCreated(gameId, msg.sender, msg.value, _moveHash, _referrer);
    }
    
    /**
     * @dev Join an existing open game
     * @param _gameId ID of the game to join
     * @param _move Player's move choice
     */
    function joinGame(uint256 _gameId, Move _move) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validGameId(_gameId) 
        gameExists(_gameId) 
        validMove(_move) 
    {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Open, "Game is not open");
        require(game.creator != msg.sender, "Cannot join your own game");
        require(game.opponent == address(0), "Game already has opponent");
        require(msg.value == game.betAmount, "Bet amount must match");
        
        game.opponent = msg.sender;
        game.opponentMove = _move;
        game.status = GameStatus.RevealPhase;
        game.revealDeadline = block.timestamp + REVEAL_TIMEOUT;
        
        // Register player if new
        if (!isPlayer[msg.sender]) {
            isPlayer[msg.sender] = true;
            players.push(msg.sender);
        }
        
        // Update player stats
        playerStats[msg.sender].gamesPlayed++;
        playerStats[msg.sender].totalWagered += msg.value;
        playerStats[msg.sender].lastPlayed = block.timestamp;
        playerStats[msg.sender].monthlyScore += 2; // Points for playing
        
        emit GameJoined(_gameId, msg.sender, _move);
    }
    
    /**
     * @dev Reveal the creator's move to complete the game
     * @param _gameId ID of the game
     * @param _move Original move choice
     * @param _secret Secret phrase used in hash
     */
    function revealMove(uint256 _gameId, Move _move, string memory _secret) 
        external 
        nonReentrant 
        whenNotPaused 
        validGameId(_gameId) 
        gameExists(_gameId) 
        onlyGameCreator(_gameId) 
        validMove(_move) 
    {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.RevealPhase, "Game not in reveal phase");
        require(block.timestamp <= game.revealDeadline, "Reveal deadline passed");
        
        // Verify the move hash
        bytes32 computedHash = keccak256(abi.encodePacked(uint8(_move), _secret));
        require(computedHash == game.creatorMoveHash, "Invalid move or secret");
        
        game.creatorMove = _move;
        game.status = GameStatus.Completed;
        
        // Determine winner and distribute rewards
        address winner = determineWinner(_move, game.opponentMove);
        game.winner = winner;
        
        _distributeGameRewards(_gameId, winner);
        _updatePlayerStats(_gameId, winner);
        
        emit MoveRevealed(_gameId, msg.sender, _move);
        emit GameCompleted(_gameId, winner);
    }
    
    /**
     * @dev Cancel an open game (only creator, only if no opponent)
     * @param _gameId ID of the game to cancel
     */
    function cancelGame(uint256 _gameId) 
        external 
        nonReentrant 
        validGameId(_gameId) 
        gameExists(_gameId) 
        onlyGameCreator(_gameId) 
    {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.Open, "Can only cancel open games");
        require(game.opponent == address(0), "Cannot cancel game with opponent");
        
        game.status = GameStatus.Expired;
        
        // Refund the creator
        (bool success, ) = payable(msg.sender).call{value: game.betAmount}("");
        require(success, "Refund failed");
        
        emit GameCanceled(_gameId, msg.sender);
    }
    
    /**
     * @dev Claim victory when opponent fails to reveal in time
     * @param _gameId ID of the game
     */
    function claimTimeout(uint256 _gameId) 
        external 
        nonReentrant 
        validGameId(_gameId) 
        gameExists(_gameId) 
        onlyGameOpponent(_gameId) 
    {
        Game storage game = games[_gameId];
        
        require(game.status == GameStatus.RevealPhase, "Game not in reveal phase");
        require(block.timestamp > game.revealDeadline, "Reveal deadline not passed");
        
        game.status = GameStatus.Completed;
        game.winner = msg.sender;
        
        _distributeGameRewards(_gameId, msg.sender);
        _updatePlayerStats(_gameId, msg.sender);
        
        emit GameCompleted(_gameId, msg.sender);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Determine the winner based on Rock Paper Scissors rules
     */
    function determineWinner(Move _creatorMove, Move _opponentMove) internal pure returns (address) {
        if (_creatorMove == _opponentMove) {
            return address(0); // Tie
        }
        
        bool creatorWins = (_creatorMove == Move.Rock && _opponentMove == Move.Scissors) ||
                          (_creatorMove == Move.Paper && _opponentMove == Move.Rock) ||
                          (_creatorMove == Move.Scissors && _opponentMove == Move.Paper);
        
        return creatorWins ? address(0x1) : address(0x2); // Placeholder addresses for logic
    }
    
    /**
     * @dev Distribute game rewards (optimized for BSC gas costs)
     */
    function _distributeGameRewards(uint256 _gameId, address _winner) internal {
        Game storage game = games[_gameId];
        uint256 totalPot = game.betAmount * 2;
        
        if (_winner == address(0)) {
            // Tie - refund both players
            (bool success1, ) = payable(game.creator).call{value: game.betAmount}("");
            (bool success2, ) = payable(game.opponent).call{value: game.betAmount}("");
            require(success1 && success2, "Refund failed");
            return;
        }
        
        // Calculate fees (optimized for BSC)
        uint256 platformFee = (totalPot * 10) / 100; // 10% platform fee
        uint256 rewardPoolFee = (totalPot * 5) / 100; // 5% to reward pool
        uint256 winnerAmount = totalPot - platformFee - rewardPoolFee;
        
        // Handle referral commission (2% of total pot if referrer exists)
        uint256 referralFee = 0;
        if (game.referrer != address(0) && game.referrer != game.creator) {
            referralFee = (totalPot * 2) / 100;
            winnerAmount -= referralFee;
            
            referralEarnings[game.referrer] += referralFee;
            (bool refSuccess, ) = payable(game.referrer).call{value: referralFee}("");
            require(refSuccess, "Referral payment failed");
            
            emit ReferralEarned(game.referrer, referralFee);
        }
        
        // Distribute rewards
        address actualWinner = _winner == address(0x1) ? game.creator : game.opponent;
        
        // Pay winner
        (bool winnerSuccess, ) = payable(actualWinner).call{value: winnerAmount}("");
        require(winnerSuccess, "Winner payment failed");
        
        // Pay platform fee
        (bool feeSuccess, ) = payable(feeWallet).call{value: platformFee}("");
        require(feeSuccess, "Fee payment failed");
        
        // Add to reward pool
        rewardPool += rewardPoolFee;
        emit RewardPoolIncreased(rewardPoolFee);
        
        // Update winner's total won
        playerStats[actualWinner].totalWon += winnerAmount;
    }
    
    /**
     * @dev Update player statistics after game completion
     */
    function _updatePlayerStats(uint256 _gameId, address _winner) internal {
        Game storage game = games[_gameId];
        
        // Update creator stats
        playerStats[game.creator].gamesPlayed++;
        playerStats[game.creator].totalWagered += game.betAmount;
        playerStats[game.creator].lastPlayed = block.timestamp;
        playerStats[game.creator].monthlyScore += 2; // Base points for playing
        
        if (_winner == address(0)) {
            // Tie
            playerStats[game.creator].ties++;
            playerStats[game.opponent].ties++;
            playerStats[game.creator].monthlyScore += 5; // Tie points
            playerStats[game.opponent].monthlyScore += 5;
        } else {
            address actualWinner = _winner == address(0x1) ? game.creator : game.opponent;
            address loser = actualWinner == game.creator ? game.opponent : game.creator;
            
            playerStats[actualWinner].wins++;
            playerStats[loser].losses++;
            playerStats[actualWinner].monthlyScore += 10; // Win points
        }
        
        emit PlayerStatsUpdated(
            game.creator, 
            playerStats[game.creator].wins, 
            playerStats[game.creator].losses, 
            playerStats[game.creator].ties
        );
        
        emit PlayerStatsUpdated(
            game.opponent, 
            playerStats[game.opponent].wins, 
            playerStats[game.opponent].losses, 
            playerStats[game.opponent].ties
        );
        
        _updateMonthlyLeaderboard(game.creator);
        _updateMonthlyLeaderboard(game.opponent);
    }
    
    /**
     * @dev Update monthly leaderboard (gas optimized for BSC)
     */
    function _updateMonthlyLeaderboard(address _player) internal {
        uint256 playerScore = playerStats[_player].monthlyScore;
        
        // Simple insertion sort for top players (gas efficient on BSC)
        bool playerInTop = false;
        for (uint256 i = 0; i < topMonthlyPlayers.length; i++) {
            if (topMonthlyPlayers[i] == _player) {
                playerInTop = true;
                break;
            }
        }
        
        if (!playerInTop && topMonthlyPlayers.length < 100) {
            topMonthlyPlayers.push(_player);
        }
        
        // Sort top players by score (bubble sort for small arrays, BSC optimized)
        for (uint256 i = 0; i < topMonthlyPlayers.length; i++) {
            for (uint256 j = i + 1; j < topMonthlyPlayers.length; j++) {
                if (playerStats[topMonthlyPlayers[i]].monthlyScore < playerStats[topMonthlyPlayers[j]].monthlyScore) {
                    address temp = topMonthlyPlayers[i];
                    topMonthlyPlayers[i] = topMonthlyPlayers[j];
                    topMonthlyPlayers[j] = temp;
                }
            }
        }
        
        // Keep only top 50 to save gas on BSC
        if (topMonthlyPlayers.length > 50) {
            topMonthlyPlayers.pop();
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Distribute monthly rewards to top players (BSC optimized)
     */
    function distributeRewards() external onlyOwner nonReentrant {
        require(rewardPool > 0, "No rewards to distribute");
        require(topMonthlyPlayers.length >= 5, "Need at least 5 players");
        require(
            block.timestamp >= lastRewardDistribution + 30 days, 
            "Too early for reward distribution"
        );
        
        uint256 totalRewards = rewardPool;
        uint256[] memory percentages = new uint256[](5);
        percentages[0] = 40; // 1st place: 40%
        percentages[1] = 30; // 2nd place: 30%
        percentages[2] = 15; // 3rd place: 15%
        percentages[3] = 10; // 4th place: 10%
        percentages[4] = 5;  // 5th place: 5%
        
        address[] memory winners = new address[](5);
        uint256[] memory amounts = new uint256[](5);
        
        // Distribute to top 5 players
        for (uint256 i = 0; i < 5 && i < topMonthlyPlayers.length; i++) {
            address winner = topMonthlyPlayers[i];
            uint256 rewardAmount = (totalRewards * percentages[i]) / 100;
            
            winners[i] = winner;
            amounts[i] = rewardAmount;
            
            (bool success, ) = payable(winner).call{value: rewardAmount}("");
            require(success, "Reward payment failed");
        }
        
        // Reset for next month
        rewardPool = 0;
        lastRewardDistribution = block.timestamp;
        
        // Reset monthly scores (gas optimized)
        for (uint256 i = 0; i < players.length; i++) {
            playerStats[players[i]].monthlyScore = 0;
        }
        
        // Clear leaderboard
        delete topMonthlyPlayers;
        
        emit RewardsDistributed(winners, amounts);
    }
    
    /**
     * @dev Update fee wallet address
     * @param newFeeWallet New fee wallet address
     */
    function setFeeWallet(address newFeeWallet) external onlyOwner {
        require(newFeeWallet != address(0), "Fee wallet cannot be zero address");
        address oldWallet = feeWallet;
        feeWallet = newFeeWallet;
        emit FeeWalletUpdated(oldWallet, newFeeWallet);
    }
    
    /**
     * @dev Update fee percentage (max 20% for BSC ecosystem)
     * @param newFee New fee percentage (0-20)
     */
    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= 20, "Fee cannot exceed 20%");
        uint256 oldFee = feePercentage;
        feePercentage = newFee;
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Pause contract in emergency (BSC compatible)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get game details
     * @param _gameId ID of the game
     * @return Game struct
     */
    function getGame(uint256 _gameId) 
        external 
        view 
        validGameId(_gameId) 
        gameExists(_gameId) 
        returns (Game memory) 
    {
        return games[_gameId];
    }
    
    /**
     * @dev Get player statistics
     * @param player Address of the player
     * @return PlayerStats struct
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    /**
     * @dev Get player win rate percentage
     * @param player Address of the player
     * @return Win rate as percentage (0-100)
     */
    function getPlayerWinRate(address player) external view returns (uint256) {
        uint256 totalGames = playerStats[player].gamesPlayed;
        if (totalGames == 0) return 0;
        return (playerStats[player].wins * 100) / totalGames;
    }
    
    /**
     * @dev Get player profit/loss
     * @param player Address of the player
     * @return Profit (positive) or loss (negative) in wei
     */
    function getPlayerProfit(address player) external view returns (int256) {
        return int256(playerStats[player].totalWon) - int256(playerStats[player].totalWagered);
    }
    
    /**
     * @dev Get top monthly players and their scores
     * @return Arrays of addresses and scores
     */
    function getTopMonthlyPlayers() external view returns (address[] memory, uint256[] memory) {
        uint256 length = topMonthlyPlayers.length;
        address[] memory addresses = new address[](length);
        uint256[] memory scores = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            addresses[i] = topMonthlyPlayers[i];
            scores[i] = playerStats[topMonthlyPlayers[i]].monthlyScore;
        }
        
        return (addresses, scores);
    }
    
    /**
     * @dev Get all registered players
     * @return Array of player addresses
     */
    function getPlayers() external view returns (address[] memory) {
        return players;
    }
    
    /**
     * @dev Get reward pool information
     * @return Current reward pool amount
     */
    function getRewardPoolInfo() external view returns (uint256) {
        return rewardPool;
    }
    
    /**
     * @dev Get total number of games
     * @return Total games created
     */
    function totalGames() external view returns (uint256) {
        return gameCounter;
    }
    
    /**
     * @dev Get total number of players
     * @return Total registered players
     */
    function totalPlayers() external view returns (uint256) {
        return players.length;
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @dev Emergency withdrawal (only owner, only when paused)
     * For BSC network emergency situations
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        require(address(this).balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    /**
     * @dev Recover stuck BEP-20 tokens (BSC specific)
     * @param tokenAddress Address of the BEP-20 token
     * @param amount Amount to recover
     */
    function recoverBEP20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        
        // Interface for BEP-20 token
        IBEP20 token = IBEP20(tokenAddress);
        require(token.transfer(owner(), amount), "Token recovery failed");
    }
    
    // ============ FALLBACK & RECEIVE ============
    
    /**
     * @dev Receive function to accept BNB deposits
     */
    receive() external payable {
        rewardPool += msg.value;
        emit RewardPoolIncreased(msg.value);
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }
}

/**
 * @dev BEP-20 token interface for BSC ecosystem
 */
interface IBEP20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}