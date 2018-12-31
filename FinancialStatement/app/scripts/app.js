App = {
    web3Provider: null,
    contracts: {},
    address: window.location.search.substr(1).match(new RegExp("(^|&)address=([^&]*)(&|$)")),
    account: null,

    init: async function() {
        return await App.initWeb3();
    },


    initWeb3: async function() {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: async function() {
        // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
        await $.getJSON('StatementTable.json', function(data) {
            // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
            var StatementTableArtifact = data;
            App.contracts.StatementTable = TruffleContract(StatementTableArtifact);
            // Set the provider for our contract
            App.contracts.StatementTable.setProvider(App.web3Provider);
            // Use our contract to retrieve and mark the adopted pets

        });

        await $.getJSON('FinancialStatement.json', function(data) {
            // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
            var FinancialStatementArtifact = data;
            App.contracts.FinancialStatement = TruffleContract(FinancialStatementArtifact);
            // Set the provider for our contract
            App.contracts.FinancialStatement.setProvider(App.web3Provider);
            // Use our contract to retrieve and mark the adopted pets
        });
        if (App.address == null) {
            App.load1();
        } else {
            App.address = App.address[2];
            App.load2();
            App.watch();
        }


        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '#submit', App.subFin);
        $(document).on('click', '#agree', App.confirm_agree);
        $(document).on('click', '#confirm', App.confirm_oppose);
        $(document).on('click', '#confirm-request', App.request);
        $(document).on('click', '#getopinions', App.getopinions);
        $(document).on('click', '#result', App.result);
    },

    load1: async function() {
        var table;
        var statement_num;

        await App.contracts.StatementTable.deployed().then(function(instance) {
            table = instance;
            return table.getstatementnum.call();
        }).then(function(value) {
            statement_num = value.c[0];
            console.log(value.c[0]);
        }).catch(function(err) {
            console.log(err.message);
        });

        for (var i = 0; i < statement_num; i++) {
            (function(arg) {
                App.contracts.StatementTable.deployed().then(function(instance) {
                    table = instance;
                    return table.getallstatement.call(arg);
                }).then(function(value) {
                    console.log(value);
                    var obj = {
                        _type: "",
                        _title: "",
                        _address: "",
                        _create_time: ""
                    };
                    obj._type = value[0];
                    obj._title = value[1];
                    obj._create_time = formatDate(value[2]);
                    obj._address = value[3];

                    if (out_of_date(value[4])) {
                        if (obj._type == '支') {
                            $('#todo-list').append(
                                '<li>' +
                                '<span class="icon" id="red">' + obj._type + '</span>' +
                                '<span class="breif">' + obj._title + '</span>' +
                                '<p class="address">' + obj._address + '</p>' +
                                '<span class="create_time">' + obj._create_time + '</span>' +
                                '</li>');
                        } else {
                            $('#todo-list').append(
                                '<li>' +
                                '<span class="icon" id="green">' + obj._type + '</span>' +
                                '<span class="breif">' + obj._title + '</span>' +
                                '<p class="address">' + obj._address + '</p>' +
                                '<span class="create_time">' + obj._create_time + '</span>' +
                                '</li>');
                        }
                    } else {
                        if (obj._type == '支') {
                            $('#done-list').append(
                                '<li>' +
                                '<span class="icon" id="red">' + obj._type + '</span>' +
                                '<span class="breif">' + obj._title + '</span>' +
                                '<p class="address">' + obj._address + '</p>' +
                                '<span class="create_time">' + obj._create_time + '</span>' +
                                '</li>');
                        } else {
                            $('#done-list').append(
                                '<li>' +
                                '<span class="icon" id="green">' + obj._type + '</span>' +
                                '<span class="breif">' + obj._title + '</span>' +
                                '<p class="address">' + obj._address + '</p>' +
                                '<span class="create_time">' + obj._create_time + '</span>' +
                                '</li>');
                        }
                    }
                }).catch(function(err) {
                    console.log(err.message);
                });
            })(i);
        }
    },

    subFin: async function() {
        var table;
        var type = $('#type').val();
        var time = $('#time').val();
        var name = $('#fin').val();
        var detail = $('#fin_det').val();

        web3.eth.getAccounts(async function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            await App.contracts.StatementTable.deployed().then(function(instance) {
                table = instance;
                return table.createstatement(type, name, detail, time, { from: account });
            }).then(function(value) {
                var event = table.cre_statement();
                event.watch(function(error, result) {
                    if (!error) {
                        var obj = {
                            _type: "",
                            _title: "",
                            _address: "",
                            _create_time: ""
                        };
                        obj._type = result.args.type_;
                        obj._title = result.args.name;
                        obj._address = result.args.trans;
                        obj._create_time = formatDate(result.args.subtime);
                        $('#todo-list').append('<li>' +
                            '<span class="icon" id="red">' + obj._type + '</span>' +
                            '<span class="breif">' + obj._title + '</span>' +
                            '<p class="address">' + obj._address + '</p>' +
                            '<span class="create_time">' + obj._create_time + '</span>' +
                            '</li>');
                    } else {
                        console.log(error);
                    }
                });
            }).catch(function(err) {
                console.log(err.message);
            });

            $('#sub_fin').fadeOut();
        });

    },

    load2: async function() {
        var i = 1;
        while (localStorage.getItem(i) !== null) {
            var info = localStorage.getItem(i);
            var arr = info.split(',');

            $('#useraddress-box').append('<div class="accounts"><input id="checkbox' + i + '" type="checkbox" name=' + arr[0] + ' value=' + arr[1] + '><label for="checkbox' + i + '">' + arr[0] + '</label></div>');
            i++;
        };

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.account = accounts[0];
        });

        var fin;
        console.log(App.address);
        App.contracts.FinancialStatement.at(App.address).then(function(instance) {
            fin = instance;
            return fin.getstatement.call();
        }).then(function(value) {
            $('#type').html(value[0]);
            console.log(value[1]);
            $('#title').html(value[1]);
            $('#detail').html(value[2]);
            $('#count').html('' + value[3] + '/' + value[4]);
            $('#status').html(value[5]);
            if (value[5] == 'success') {
                $('#status').css('background-color', 'rgb(39,180,76)');
            } else if (value[5] == 'false') {
                $('#status').css('background-color', 'red');
            }
            $('#subtime').html('' + formatDate(value[6]));
        }).catch(function(err) {
            console.log(err.message);
        });

        var table;
        App.contracts.StatementTable.deployed().then(function(instance) {
            table = instance;
            return table.getallstatement.call();
        }).then(function(value) {
            for (var i = 0; i < value[0].length; i++) {
                var address = 'detail.html?address=' + value[3][i];
                $('#list').append('<li><a href=' + address + '><span class="label">' + value[1][i] + '</span></a></li>');
            }
        }).catch(function(err) {
            console.log(err.message);
        });

        await App.contracts.StatementTable.deployed().then(function(instance) {
            table = instance;
            return table.getstatementnum.call();
        }).then(function(value) {
            statement_num = value.c[0];
            console.log(value.c[0]);
        }).catch(function(err) {
            console.log(err.message);
        });

        for (var i = 0; i < statement_num; i++) {
            (function(arg) {
                App.contracts.StatementTable.deployed().then(function(instance) {
                    table = instance;
                    return table.getallstatement.call(arg);
                }).then(function(value) {
                    var address = 'detail.html?address=' + value[3];
                    $('#list').append('<li><a href=' + address + '><span class="label">' + value[1] + '</span></a></li>');
                }).catch(function(err) {
                    console.log(err.message);
                });
            })(i);
        }
    },

    request: async function() {
        const self = this;
        var statement;
        var useraccounts = $(':checkbox:checked');
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.account = accounts[0];
        });
        if (useraccounts !== null) {
            for (var i = useraccounts.length - 1; i >= 0; i--) {
                address = useraccounts[i].value;
                console.log(address);
                (function(arg) {
                    App.contracts.FinancialStatement.at(App.address).then(function(instance) {
                        statement = instance;
                        return statement.request_to_confirm(arg, { from: App.account });
                    }).then(function() {
                        console.log('Success!');
                        $('#slide1').html('Success!');
                        $('#slide1').toggle('slide', { direction: "right" }, 500);
                        setTimeout("$('#slide1').fadeOut('slow')", 800);
                    }).catch(function(err) {
                        console.log(err.message);
                    });
                })(address);
            }
        }
        $('#box').fadeOut();
        $('#useraddress-box').fadeOut();

    },

    confirm_agree: function() {
        var fin;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.account = accounts[0];

            App.contracts.FinancialStatement.at(App.address).then(function(instance) {
                fin = instance;
                return fin.confirm(0, '', { from: App.account });
            }).then(function() {
                console.log('Success');
                $('#slide1').html('Success!');
                $('#slide1').toggle('slide', { direction: "right" }, 500);
                setTimeout("$('#slide1').fadeOut('slow')", 800);
            }).catch(function(err) {
                console.log(err.message);
                alert('Error!');
            });
            $('#box').fadeOut();
            $('#oppose-box').fadeOut();
        });
    },

    confirm_oppose: function() {
        var opinion = $('#opinion').val();
        var fin;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.account = accounts[0];

            App.contracts.FinancialStatement.at(App.address).then(function(instance) {
                fin = instance;
                return fin.confirm(1, opinion, { from: App.account });
            }).then(function() {
                console.log('Success');
                $('#slide1').html('Success!');
                $('#slide1').toggle('slide', { direction: "right" }, 500);
                setTimeout("$('#slide1').fadeOut('slow')", 800);
                $('#opinion').val('');
            }).catch(function(err) {
                console.log(err.message);
                alert('Error!');
            });
            $('#box').fadeOut();
            $('#oppose-box').fadeOut();
        });
    },

    getopinions: async function() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.account = accounts[0];
        });
        var opinions_num = 0;

        await App.contracts.FinancialStatement.at(App.address).then(function(instance) {
            fin = instance;
            return fin.getopinions_num.call({ from: App.account });
        }).then(function(value) {
            opinions_num = value.c[0];
            console.log(opinions_num);
        }).catch(function(err) {
            console.log(err.message);
        });

        if (opinions_num == 0) {
            $('#opinions').html('<button id="IK">I know</button>');
            $('#opinions').append('<li>No opinions</li>');
        }

        for (var i = 0; i < opinions_num; i++) {
            (function(arg) {
                App.contracts.FinancialStatement.at(App.address).then(function(instance) {
                    fin = instance;
                    return fin.getopinions.call(arg, { from: App.account });
                }).then(function(value) {
                    $('#opinions').append('<li>' + value + '</li>');
                }).catch(function(err) {
                    console.log(err.message);
                });
            })(i);
        }



        $('#alert').fadeIn();
        $('#opinions').fadeIn();
    },

    result: function() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.account = accounts[0];

            App.contracts.FinancialStatement.at(App.address).then(function(instance) {
                fin = instance;
                return fin.statement_result({ from: App.account });
            }).then(function(value) {
                console.log(value);
                $('#slide1').html(value);
                $('#slide1').toggle('slide', { direction: "right" }, 500);
                setTimeout("$('#slide1').fadeOut('slow')", 800);
                if (value == 'Succeed') {
                    $('#status').html('success');
                    $('#status').css('background-color', 'rgb(39,180,76)');
                } else {
                    $('#status').html('false');
                    $('#status').css('background-color', 'red');
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    watch: function() {
        var fin;

        web3.eth.getAccounts(async function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            await App.contracts.FinancialStatement.at(App.address).then(function(instance) {
                fin = instance;
            });

            var event = fin.Opinion();
            event.watch(function(error, result) {
                if (!error) {
                    $('#slide2').html(result.args.opinion_);
                    $('#slide2').toggle('bounce', { direction: "right" }, 500);
                    setTimeout("$('#slide2').fadeOut('slow')", 1200);
                } else {
                    console.log(error);
                }
            });
        });
    }
}