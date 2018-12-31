var FinancialStatement = artifacts.require("./FinancialStatement");
var StatementTable = artifacts.require("./StatementTable");

module.exports = function(deployer) {
    deployer.deploy(FinancialStatement, "", "", "", 1, "0x931DD18c13Fb832Fb3895AF3Ca6bB4E3A086bD60")
    deployer.link(FinancialStatement, StatementTable)
    deployer.deploy(StatementTable)
};
