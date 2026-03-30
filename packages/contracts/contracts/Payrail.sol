// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {FHE, InEuint64, euint64, euint128} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IPayrailToken} from "./PayrailToken.sol";

/// @title Payrail
/// @notice Confidential payroll core backed by CoFHE encrypted integers.
contract Payrail is AccessControl, ReentrancyGuard {
    bytes32 public constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");
    uint256 public constant MAX_BATCH_SIZE = 200;

    error NotEmployee();
    error SalaryNotSet();
    error PayrollNotOperator();
    error InvalidAddress();
    error UnauthorizedSelfView();
    error InvalidRunId();
    error EmployeeAlreadyActive();
    error BatchTooLarge(uint256 provided, uint256 maxAllowed);
    error AlreadyPaidForRun(address employee, bytes32 runId);
    error CompanyDeactivated();

    bool public deactivated;

    IPayrailToken public immutable token;
    address public immutable employer;
    bytes32 public immutable companyRef;

    mapping(address => bool) private _isEmployee;
    mapping(address => euint64) private _salary;
    mapping(address => bool) private _hasSalary;
    mapping(address => euint64) private _lastPayment;
    mapping(address => bytes32) private _lastRunId;
    mapping(address => mapping(bytes32 => bool)) private _paidInRun;

    event PayrollRunExecuted(bytes32 indexed runId, uint256 employeeCount);
    event PayrollDeactivated();

    constructor(IPayrailToken token_, address employer_, bytes32 companyRef_) {
        if (address(token_) == address(0) || employer_ == address(0)) revert InvalidAddress();

        token = token_;
        employer = employer_;
        companyRef = companyRef_;

        _grantRole(DEFAULT_ADMIN_ROLE, employer_);
        _grantRole(EMPLOYER_ROLE, employer_);
    }

    function deactivate() external onlyRole(EMPLOYER_ROLE) {
        if (deactivated) revert CompanyDeactivated();
        deactivated = true;
        emit PayrollDeactivated();
    }

    modifier notDeactivated() {
        if (deactivated) revert CompanyDeactivated();
        _;
    }

    function payrollToken() external view returns (address) {
        return address(token);
    }

    function payrollHasOperatorApproval() external view returns (bool) {
        return token.isOperator(employer, address(this));
    }

    function addEmployee(address employee_) external onlyRole(EMPLOYER_ROLE) notDeactivated nonReentrant {
        if (employee_ == address(0)) revert InvalidAddress();
        if (_isEmployee[employee_]) revert EmployeeAlreadyActive();

        _isEmployee[employee_] = true;
    }

    function removeEmployee(address employee_) external onlyRole(EMPLOYER_ROLE) notDeactivated nonReentrant {
        if (!_isEmployee[employee_]) revert NotEmployee();

        _isEmployee[employee_] = false;

        euint64 zeroSalary = FHE.asEuint64(0);
        zeroSalary.allowThis();
        _salary[employee_] = zeroSalary;

        euint64 zeroLastPayment = FHE.asEuint64(0);
        zeroLastPayment.allowThis();
        _lastPayment[employee_] = zeroLastPayment;

        _hasSalary[employee_] = false;
        _lastRunId[employee_] = bytes32(0);
    }

    function isEmployee(address employee_) external view onlyRole(EMPLOYER_ROLE) returns (bool) {
        return _isEmployee[employee_];
    }

    function myEmploymentActive() external view returns (bool) {
        if (!_isEmployee[msg.sender]) revert UnauthorizedSelfView();
        return true;
    }

    function setSalary(address employee_, InEuint64 calldata encryptedSalary)
        external
        onlyRole(EMPLOYER_ROLE)
        notDeactivated
    {
        if (!_isEmployee[employee_]) revert NotEmployee();

        euint64 salaryValue = FHE.asEuint64(encryptedSalary);
        salaryValue.allowThis();
        salaryValue.allow(employee_);
        salaryValue.allow(msg.sender);

        _salary[employee_] = salaryValue;
        _hasSalary[employee_] = true;
    }

    function salaryOfEmployee(address employee_, bytes32) external view onlyRole(EMPLOYER_ROLE) returns (bytes32) {
        return euint64.unwrap(_salary[employee_]);
    }

    function mySalary(bytes32) external view returns (bytes32) {
        if (!_isEmployee[msg.sender]) revert UnauthorizedSelfView();
        return euint64.unwrap(_salary[msg.sender]);
    }

    function lastPaymentOfEmployee(address employee_, bytes32) external view onlyRole(EMPLOYER_ROLE) returns (bytes32) {
        return euint64.unwrap(_lastPayment[employee_]);
    }

    function myLastPayment(bytes32) external view returns (bytes32) {
        if (!_isEmployee[msg.sender]) revert UnauthorizedSelfView();
        return euint64.unwrap(_lastPayment[msg.sender]);
    }

    function paidInRun(address employee_, bytes32 runId) external view onlyRole(EMPLOYER_ROLE) returns (bool) {
        return _paidInRun[employee_][runId];
    }

    function lastRunIdOfEmployee(address employee_) external view onlyRole(EMPLOYER_ROLE) returns (bytes32) {
        return _lastRunId[employee_];
    }

    function myLastRunId() external view returns (bytes32) {
        if (!_isEmployee[msg.sender]) revert UnauthorizedSelfView();
        return _lastRunId[msg.sender];
    }

    function runPayrollForRun(address employee_, bytes32 runId)
        external
        onlyRole(EMPLOYER_ROLE)
        notDeactivated
        nonReentrant
        returns (euint64 transferred)
    {
        transferred = _runPayrollForRun(employee_, runId);
        emit PayrollRunExecuted(runId, 1);
    }

    function runPayrollBatchForRun(address[] calldata employees_, bytes32 runId)
        external
        onlyRole(EMPLOYER_ROLE)
        notDeactivated
        nonReentrant
    {
        uint256 length = employees_.length;
        if (length > MAX_BATCH_SIZE) revert BatchTooLarge(length, MAX_BATCH_SIZE);
        if (runId == bytes32(0)) revert InvalidRunId();

        for (uint256 i = 0; i < length; i++) {
            _runPayrollForRun(employees_[i], runId);
        }

        emit PayrollRunExecuted(runId, length);
    }

    function _runPayrollForRun(address employee_, bytes32 runId) internal returns (euint64 transferred) {
        if (runId == bytes32(0)) revert InvalidRunId();
        if (_paidInRun[employee_][runId]) revert AlreadyPaidForRun(employee_, runId);

        transferred = _runPayrollTransfer(employee_);
        _paidInRun[employee_][runId] = true;
        _lastRunId[employee_] = runId;
    }

    function _runPayrollTransfer(address employee_) internal returns (euint64 transferred) {
        if (!_isEmployee[employee_]) revert NotEmployee();
        if (!_hasSalary[employee_]) revert SalaryNotSet();

        euint64 salaryValue = _salary[employee_];
        if (!salaryValue.isInitialized()) revert SalaryNotSet();
        if (!token.isOperator(employer, address(this))) revert PayrollNotOperator();

        euint128 spent = token.operatorTransferEncrypted(employer, employee_, FHE.asEuint128(salaryValue));
        transferred = FHE.asEuint64(spent);
        transferred.allowThis();
        transferred.allow(employee_);
        transferred.allow(employer);
        _lastPayment[employee_] = transferred;
    }
}
