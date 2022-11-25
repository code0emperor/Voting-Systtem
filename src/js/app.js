var phaseEnum = 0; // for changing phases of voting
App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // if (window.ethereum) {
    //   App.web3Provider = window.ethereum;
    //   try {
    //     // const accounts = await window.ethereum.request({
    //     //   method: "eth_requestAccounts",
    //     // });
    //     const accounts = await window.ethereum.enable();
    //     console.log(accounts + " HELLO");
    //     setAccounts(accounts);
    //   } catch (error) {
    //     if (error.code === 4001) {
    //       // User rejected request
    //     }
    //   }
    // }

    App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");

    web3 = new Web3(App.web3Provider);

    // console.log(web3);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Contest.json", function (contest) {
      // console.log(contest);
      App.contracts.Contest = TruffleContract(contest);
      console.log(web3.currentProvider);
      App.contracts.Contest.setProvider(web3.currentProvider);

      return App.render();
    });
  },

  render: function () {
    var contestInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    $("#after").hide();

    // console.log(web3.eth);

    web3.eth.getCoinbase(function (err, account) {
      // console.log(err);
      if (err) {
        console.log(err);
      } else {
        console.log(account);
        web3.eth.defaultAccount = account;
        App.account = account;
        $("#accountAddress").html("Your account: " + account);
      }
    });

    // ------------- fetching candidates to front end from blockchain code-------------
    App.contracts.Contest.deployed()
      .then(function (instance) {
        contestInstance = instance;
        return contestInstance.contestantsCount();
      })
      .then(function (contestantsCount) {
        // var contestantsResults=$("#contestantsResults");
        // contestantsResults.empty();

        // var contestantSelect=$("#contestantSelect");
        // contestantSelect.empty();

        // for(var i=1; i<=contestantsCount; i++){
        //   contestInstance.contestants(i).then(function(contestant){
        //     var id=contestant[0];
        //     var name=contestant[1];
        //     var voteCount=contestant[2];
        //     var fetchedParty=contestant[3];
        //     var fetchedAge = contestant[4];
        //     var fetchedQualification = contestant[5]

        //     var contestantTemplate="<tr><th>"+id+"</th><td>"+name+"</td><td>"+fetchedAge+"</td><td>"+fetchedParty+"</td><td>"+fetchedQualification+"</td><td>"+voteCount+"</td></tr>";
        //     contestantsResults.append(contestantTemplate)  ;

        //     var contestantOption="<option value='"+id+"'>"+name+"</option>";
        //     contestantSelect.append(contestantOption);

        var contestantsResults = $("#test");
        contestantsResults.empty();
        var contestantsResultsAdmin = $("#contestantsResultsAdmin");
        contestantsResultsAdmin.empty();

        var contestantSelect = $("#contestantSelect");
        contestantSelect.empty();

        for (var i = 1; i <= contestantsCount; i++) {
          contestInstance.contestants(i).then(function (contestant) {
            var id = contestant[0];
            var name = contestant[1];
            var voteCount = contestant[2];
            var fetchedParty = contestant[3];
            var fetchedAge = contestant[4];
            var fetchedQualification = contestant[5];

            var contestantTemplate =
              "<div class='card' style='width: 15rem; margin: 1rem;'><img class='card-img-top'src='../img/Sample_User_Icon.png' alt=''><div class='card-body text-center'><h4 class='card-title'>" +
              name +
              "</h4>" +
              "<button type='button' class='btn btn-info' data-toggle='modal' data-target='#modal" +
              id +
              "'>Click Here to Vote</button>" +
              "<div class='modal fade' id='modal" +
              id +
              "' tabindex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>" +
              "<div class='modal-dialog modal-dialog-centered' role='document'>" +
              "<div class='modal-content'>" +
              "<div class='modal-header'>" +
              "<h5 class='modal-title' id='exampleModalLongTitle'> <b>" +
              name +
              "</b></h5>" +
              "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
              "</div>" +
              "<div class='modal-body'> <b> Party : " +
              fetchedParty +
              "<br>Age : " +
              fetchedAge +
              "<br>Qualification : " +
              fetchedQualification +
              "<br></b></div>" +
              "<div class='modal-footer'>" +
              "<button class='btn btn-info' onClick='App.castVote(" +
              id.toString() +
              ")'>VOTE</button>" +
              "<button type='button' class='btn btn-info' data-dismiss='modal'>Close</button></div>" +
              "</div></div></div>" +
              "</div></div>";
            contestantsResults.append(contestantTemplate);

            var contestantOption =
              "<option style='padding: auto;' value='" +
              id +
              "'>" +
              name +
              "</option>";
            contestantSelect.append(contestantOption);

            var contestantTemplateAdmin =
              "<tr><th>" +
              id +
              "</th><td>" +
              name +
              "</td><td>" +
              fetchedAge +
              "</td><td>" +
              fetchedParty +
              "</td><td>" +
              fetchedQualification +
              "</td><td>" +
              voteCount +
              "</td></tr>";
            contestantsResultsAdmin.append(contestantTemplateAdmin);
          });
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });

    // ------------- fetching current phase code -------------
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.state();
      })
      .then(function (state) {
        // console.log(state);
        var fetchedState;
        var fetchedStateAdmin;
        // phaseEnum = state.toString();
        // console.log(phaseEnum);
        phaseEnum = 0;
        if (phaseEnum == 0) {
          fetchedState =
            "Registration phase is on , go register yourself to vote !!";
          fetchedStateAdmin = "Registration";
        } else if (phaseEnum == 1) {
          fetchedState = "Voting is now live !!!";
          fetchedStateAdmin = "Voting";
        } else {
          fetchedState = "Voting is now over !!!";
          fetchedStateAdmin = "Election over";
        }

        var currentPhase = $("#currentPhase"); //for user
        currentPhase.empty();
        var currentPhaseAdmin = $("#currentPhaseAdmin"); //for admin
        currentPhaseAdmin.empty();
        var phaseTemplate = "<h1>" + fetchedState + "</h1>";
        var phaseTemplateAdmin =
          "<h3> Current Phase : " + fetchedStateAdmin + "</h3>";
        currentPhase.append(phaseTemplate);
        currentPhaseAdmin.append(phaseTemplateAdmin);
      })
      .catch(function (err) {
        console.error(err);
      });

    // ------------- showing result -------------
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.state();
      })
      .then(function (state) {
        var result = $("#Results");
        if (state == 2) {
          $("#not").hide();
          contestInstance.contestantsCount().then(function (contestantsCount) {
            for (var i = 1; i <= contestantsCount; i++) {
              contestInstance.contestants(i).then(function (contestant) {
                var id = contestant[0];
                var name = contestant[1];
                var voteCount = contestant[2];
                var fetchedYear = contestant[3];
                var fetchedBranch = contestant[4];
                var fetchedSection = contestant[5];
                var fetchedRollNo = contestant[6];

                var resultTemplate =
                  "<tr><th>" +
                  id +
                  "</th><td>" +
                  name +
                  "</td><td>" +
                  fetchedBranch +
                  "</td><td>" +
                  fetchedYear +
                  "</td><td>" +
                  fetchedSection +
                  "</td><td>" +
                  fetchedRollNo +
                  "</td></tr>";
                voteCount + "</td></tr>";
                result.append(resultTemplate);
              });
            }
          });
        } else {
          $("#renderTable").hide();
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  // ------------- voting code -------------
  castVote: function (id) {
    var contestantId = id;
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.vote(contestantId, { from: App.account });
      })
      .then(function (result) {
        // $("#test").hide();
        // $("#after").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  // ------------- adding candidate code -------------
  addCandidate: async function () {
    try {
      $("#loader").hide();
      var name = $("#name").val();
      var year = $("#year").val();
      var branch = $("#branch").val();
      var section = $("#section").val();
      var rollno = $("#rollno").val();
      // console.log(App.contracts.Contest);

      App.contracts.Contest.deployed()
        .then(async function (instance) {
          // console.log(instance);
          const contestants = await instance.addContestant(
            name,
            branch,
            year,
            section,
            rollno
          );
          console.log(contestants);
          // return contestants;
        })
        .then(function (result) {
          console.log(result);
          $("#loader").show();
          $("#name").val("");
          $("#year").val("");
          $("#branch").val("");
          $("#section").val("");
          $("#rollno").val("");
        })
        .catch(function (err) {
          console.error(err);
        });
    } catch (err) {
      console.error(err);
    }
  },

  // ------------- changing phase code -------------

  changeState: function () {
    phaseEnum++;
    // console.log(phaseEnum);
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.changeState(phaseEnum);
      })
      .then(function (result) {
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  // ------------- registering voter code -------------
  registerVoter: function () {
    var add = $("#accadd").val();
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.voterRegisteration(add);
      })
      .then(function (result) {
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
