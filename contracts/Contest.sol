// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

contract Contest{
	
	struct Contestant{
		uint id;
		string name;
		uint voteCount;
		string branch; 
		string year;
		string section; 
		string rollno;
	}

	struct Voter{
		bool hasVoted;
		uint vote;
		bool isRegistered;
	}

	address admin;
	mapping(uint => Contestant) public contestants; 
   // mapping(address => bool) public voters;
    mapping(address => Voter) public voters;
	uint public contestantsCount;
	// uint public counter;
	enum PHASE{reg, voting , done}
	PHASE public state;

	modifier onlyAdmin(){
		require(msg.sender==admin);
		_;
	}
	
	modifier validState(PHASE x){
	    require(state==x);
	    _;
	}

	constructor() public{
		admin=msg.sender;
        state=PHASE.reg;
		// counter = 0;

	}

    function changeState(PHASE x) onlyAdmin public{
		require(x > state);
        state = x;
    }

	function addContestant(string memory _name, string memory _branch, string memory _year, string memory _section, string memory _rollno) public onlyAdmin validState(PHASE.reg){
		contestantsCount++;
		contestants[contestantsCount]= Contestant(contestantsCount,_name,0,_branch,_year,_section,_rollno);
	}

	function voterRegisteration(address user) public onlyAdmin validState(PHASE.reg){
		voters[user].isRegistered=true;
	}

	function vote(uint _contestantId) public validState(PHASE.voting){
        
		require(voters[msg.sender].isRegistered);
		require(!voters[msg.sender].hasVoted);
        require(_contestantId > 0 && _contestantId<=contestantsCount);
		contestants[_contestantId].voteCount++;
		voters[msg.sender].hasVoted=true;
		voters[msg.sender].vote=_contestantId;
	}
}