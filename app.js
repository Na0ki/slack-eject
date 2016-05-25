var Botkit = require('botkit');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var config = require('./config');

var controller = Botkit.slackbot({
    debug: false
});


// 接続
controller.spawn({
    token: config.token
}).startRTM();


// eject実行
controller.hears(['eject (.*)'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var deviceType = message.match[1]; // (.*) を取得

    // CD-ROMドライブ以外をejectできないようにする
    if (!deviceType.match(/cdrom/)) {
        return bot.reply(message, '[Error] ( ՞ةڼ◔)oO( デバイスタイプが不正でし )');
    }

    // ejectコマンド実行
    exec('eject -T ' + deviceType, function (err, stdout) {

        var cmd = 'traystatus ' + deviceType + ' && echo 1';

        function shSpawn(command) {
            return spawn('sh', ['-c', command]);
        }

        var child = shSpawn(cmd);
        var buf = "";

        child.stdout.on('data', function (data) {
            buf = buf + data;
        });

        child.stderr.on('data', function (data) {
            console.log('exec error: ' + data);
        });

        child.on('close', function (code) {
            var replyMsg = "";
            console.log("buffer: " + buf);
            if (buf.match(/1/)) {
                replyMsg = "開いてる";
            } else {
                replyMsg = "閉まってる";
            }
            bot.reply(message, genMsg(err, replyMsg));
        });
    });
});


// cdromデバイス検索
controller.hears(['devices'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var cmd = "ls -l /dev/ | grep cdrom";

    function shSpawn(command) {
        return spawn('sh', ['-c', command]);
    }

    var child = shSpawn(cmd);
    var buf = "";

    child.stdout.on('data', function (data) {
        buf = buf + data;
    });

    child.stderr.on('data', function (data) {
        console.log('exec error: ' + data);
    });

    child.on('close', function (code) {
        var replyMsg = genMsg(undefined, buf);
        if (buf.length == 0) {
            replyMsg = "( ՞ةڼ◔)oO( CD-ROMドライブが見つからないぽよ )";
        }
        bot.reply(message, replyMsg);
    });
});


// cdromの開閉状態を確認
controller.hears(['status (.*)'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {

    var deviceType = message.match[1]; // (.*) を取得
    
    /**
     * https://www.linuxquestions.org/questions/slackware-14/detect-cd-tray-status-4175450610/
     * を参考にしてrpi内で作成したtraystatusコマンドを実行する
     */
    var cmd = 'traystatus ' + deviceType + ' && echo 1';

    function shSpawn(command) {
        return spawn('sh', ['-c', command]);
    }

    var child = shSpawn(cmd);
    var buf = "";

    child.stdout.on('data', function (data) {
        buf = buf + data;
    });

    child.stderr.on('data', function (data) {
        console.log('exec error: ' + data);
    });

    child.on('close', function (code) {
        var replyMsg = "";
        console.log("buffer: " + buf);
        if (buf.match(/1/)) {
            replyMsg = "開いてる";
        } else {
            replyMsg = "閉まってる";
        }
        bot.reply(message, replyMsg);
    });
});


// リプライメッセージ生成
function genMsg(err, stdout) {
    var replyMsg = "";
    if (err) {
        replyMsg = '[Error]\n( ՞ةڼ◔)oO(\n' + err + '\n)';
    } else {
	var message = (stdout.length == 0) ? "uiiin" : stdout;
        replyMsg = '[Success]\n( ՞ਊ ՞)oO( ' + message + ' )';
    }
    return replyMsg;
}
