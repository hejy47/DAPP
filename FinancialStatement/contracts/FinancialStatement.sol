pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;

/// @title 财务报表
contract FinancialStatement {
    // 确认者
    struct Confirmor {
        bool confirmed;  // 若为真，代表该人已确认
        uint choose;   // 选择同意还是拒绝
    }

    // 财务信息的结构
    struct Statement {
        string type_;
        string name;   // 简称
        string detail;
        uint confirmCount; // 同意个数
        uint allCount;  //参加确认的总人数
        string status;  //财务信息的确认状态
        uint subtime;
    }

    //提出者
    address public presenter;
    
    //确认者的地址
    address[] private confirmors_;

    // 这声明了一个状态变量，为每个可能的地址存储一个 `Comfirmor`。
    mapping(address => Confirmor) private confirmors;

    // 财务信息
    Statement private statement;

    // 对该财务信息的意见
    string[] private opinions;

    uint private opinions_num;
    
    // 确认时间
    uint public statement_end;
    
    modifier onlyBefore() { require(now < statement_end,"You've exceeded the deadline.");_; }
    modifier onlyAfter() { require(now > statement_end,"You can't do this ahead of time.");_; }

    // 构建新的财务信息和确认时间
    constructor(string type_, string statementNames, string statementDetail, uint dur_time, address presenter_) public {
        presenter = presenter_;
        //对于提供的每个提案名称，
        //创建一个新的 Proposal 对象并把它添加到数组的末尾。
        statement = Statement({type_:type_, name:statementNames,detail:statementDetail,confirmCount:0,allCount:0,status:"waiting",subtime:now});
        statement_end = now + dur_time * 1 days;
        opinions_num = 0;
    }
    
    //判断是否在确认者信息中
    function in_confirmors(address confirmor) private view returns (bool) {
        for (uint i=0;i<confirmors_.length;i++) {
            if(confirmor == confirmors_[i])
                return true;
        }
        return false;
    }

    // 请求确认
    function request_to_confirm(address confirmor) public onlyBefore {
        require(
            msg.sender == presenter,
            "Only presenter can request to confirm this statement."
        );
        require(
            in_confirmors(confirmor) == false,
            "You've already asked the user."
        );
        require(
            !confirmors[confirmor].confirmed,
            "The confirmor already confirmed."
        );
        confirmors_.push(confirmor);
        statement.allCount += 1;
    }
    
    event Opinion(string opinion_);

    // 确认财务信息
    function confirm(uint choose, string opinion) public onlyBefore {
        Confirmor storage sender = confirmors[msg.sender];
        require(in_confirmors(msg.sender), "You're not authorized.");
        require(!sender.confirmed, "Already confirmed.");
        sender.confirmed = true;

        // 如果 `proposal` 超过了数组的范围，则会自动抛出异常，并恢复所有的改动
        if (choose == 0)
        {
            statement.confirmCount += 1;
        }
        else
        {
            opinions.push(opinion);
            opinions_num += 1;
            emit Opinion(opinion);
        }
    }
    
    function getopinions_num() public view returns (uint) {
        return opinions_num;
    }
    
    //获取意见
    function getopinions(uint i) public view returns (string){
        require(
            msg.sender == presenter,
            "Only presenter can get the opinions."
        );
        return opinions[i];
    }

    // 统计获得确认结果
    function statement_result() public payable onlyAfter
            returns (string result_)
    {
        require(
            msg.sender == presenter,
            "Only presenter can get the opinions."
        );
        if(statement.confirmCount >= statement.allCount * 2 / 3 && (statement.allCount * 2 / 3 != 0))
        {
            result_ = "Succeed";
            statement.status = "success";
        }
        else
        {
            result_ = "Failed";
            statement.status = "false";
            // selfdestruct(presenter);
        }
    }
    
    //获得财务信息
    function getstatement() public view returns (string, string, string ,uint, uint, string, uint){
        return (statement.type_, statement.name, statement.detail, statement.confirmCount, statement.allCount, statement.status, statement.subtime);
    }
    
    //销毁该财务信息
    function kill() public onlyBefore {
        require(
            msg.sender == presenter,
            "Only the presenter can kill the statement."
        );
        selfdestruct(presenter);
    }
}