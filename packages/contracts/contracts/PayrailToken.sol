// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, InEuint128, euint128} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IPayrailToken {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function isOperator(address owner, address operator) external view returns (bool);
    function operatorTransferEncrypted(address from, address to, euint128 amount) external returns (euint128);
}

/// @title PayrailToken
/// @notice Minimal CoFHE-native confidential balance ledger for payroll transfers.
contract PayrailToken is Ownable, IPayrailToken {
    string private _name;
    string private _symbol;
    uint8 private constant _DECIMALS = 6;

    mapping(address => euint128) private _encBalances;
    mapping(address => mapping(address => bool)) private _operators;

    event OperatorApprovalUpdated(address indexed owner, address indexed operator, bool approved);
    event ConfidentialMint(address indexed to);
    event ConfidentialDeposit(address indexed account);
    event ConfidentialTransfer(address indexed from, address indexed to);

    constructor(string memory name_, string memory symbol_) Ownable(msg.sender) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function decimals() external pure returns (uint8) {
        return _DECIMALS;
    }

    function setOperator(address operator, bool approved) external {
        _operators[msg.sender][operator] = approved;
        emit OperatorApprovalUpdated(msg.sender, operator, approved);
    }

    function isOperator(address owner, address operator) external view returns (bool) {
        return _operators[owner][operator];
    }

    function mintEncrypted(address to, uint128 amount) external onlyOwner {
        euint128 minted = FHE.asEuint128(uint256(amount));
        euint128 updated = _encBalances[to].add(minted);
        updated.allowThis();
        updated.allow(to);
        _encBalances[to] = updated;

        emit ConfidentialMint(to);
    }

    function depositEncrypted(InEuint128 calldata amount) external {
        euint128 deposited = FHE.asEuint128(amount);
        euint128 updated = _encBalances[msg.sender].add(deposited);
        updated.allowThis();
        updated.allow(msg.sender);
        _encBalances[msg.sender] = updated;

        emit ConfidentialDeposit(msg.sender);
    }

    function operatorTransferEncrypted(address from, address to, euint128 amount) external returns (euint128 transferred) {
        require(_operators[from][msg.sender], "PayrailToken: caller is not approved operator");

        transferred = FHE.select(amount.lte(_encBalances[from]), amount, FHE.asEuint128(0));

        euint128 fromBalance = _encBalances[from].sub(transferred);
        euint128 toBalance = _encBalances[to].add(transferred);

        fromBalance.allowThis();
        fromBalance.allow(from);
        toBalance.allowThis();
        toBalance.allow(to);
        transferred.allowThis();
        transferred.allow(from);
        transferred.allow(to);
        transferred.allow(msg.sender);

        _encBalances[from] = fromBalance;
        _encBalances[to] = toBalance;

        emit ConfidentialTransfer(from, to);
    }

    function balanceOfEncrypted(address account) external view returns (bytes32) {
        return euint128.unwrap(_encBalances[account]);
    }
}
