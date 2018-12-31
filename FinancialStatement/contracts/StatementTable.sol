pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;

import "./FinancialStatement.sol";

contract StatementTable {
    mapping(uint256 => FinancialStatement) deployedStatements;
    uint256 Statement_num;
    constructor() public {
        Statement_num = 0;
    }
    
    string[] statement_type;
    string[] statement_name;
    uint[] statement_subtime;
    address[] statement_add;
    uint[] statement_endtime;
    
    event cre_statement(string type_, string name, address trans, uint subtime);

    function createstatement (string type_, string name,string detail, uint32 time) public{
        deployedStatements[Statement_num] = new FinancialStatement(type_, name, detail, time, msg.sender);
        uint subtime = now;
        statement_type.push(type_);
        statement_name.push(name);
        statement_subtime.push(subtime);
        statement_add.push(address(deployedStatements[Statement_num]));
        statement_endtime.push(subtime + time * 1 days);
        Statement_num++;
        emit cre_statement(type_, name, address(deployedStatements[Statement_num-1]), subtime);
    }

    function getstatementnum() public view returns (uint256) {
        return Statement_num;
    }
    
    function getallstatement(uint i) public view returns (string, string, uint, address, uint) {
        return (statement_type[i],statement_name[i],statement_subtime[i],statement_add[i], statement_endtime[i]);
    }
    
}