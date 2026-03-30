// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {IPayrailToken} from "./PayrailToken.sol";
import {Payrail} from "./Payrail.sol";

/// @title PayrailFactoryRegistry
/// @notice Deploys one Payrail contract per employer wallet.
contract PayrailFactoryRegistry {
    error CompanyAlreadyRegistered();
    error InvalidToken();
    error NoCompanyRegistered();

    IPayrailToken public immutable token;

    mapping(address => address) private _companyOfEmployer;
    mapping(address => bool) public isRegisteredPayrail;
    mapping(address => bytes32) public companyRefOfPayrail;

    event PayrailDeployed(address indexed payrail, bytes32 indexed companyRef);
    event PayrailDeleted(address indexed payrail, bytes32 indexed companyRef);

    constructor(IPayrailToken token_) {
        if (address(token_) == address(0)) revert InvalidToken();
        token = token_;
    }

    function registerCompany(bytes32 companyRef) external returns (address payrail) {
        if (_companyOfEmployer[msg.sender] != address(0)) revert CompanyAlreadyRegistered();

        payrail = address(new Payrail(token, msg.sender, companyRef));

        _companyOfEmployer[msg.sender] = payrail;
        isRegisteredPayrail[payrail] = true;
        companyRefOfPayrail[payrail] = companyRef;

        emit PayrailDeployed(payrail, companyRef);
    }

    function deleteCompany() external {
        address payrail = _companyOfEmployer[msg.sender];
        if (payrail == address(0)) revert NoCompanyRegistered();

        bytes32 companyRef = companyRefOfPayrail[payrail];

        delete _companyOfEmployer[msg.sender];
        isRegisteredPayrail[payrail] = false;
        companyRefOfPayrail[payrail] = bytes32(0);

        emit PayrailDeleted(payrail, companyRef);
    }

    function companyOfEmployer(address employer_) external view returns (address) {
        return _companyOfEmployer[employer_];
    }

    function myCompany() external view returns (address) {
        return _companyOfEmployer[msg.sender];
    }
}
