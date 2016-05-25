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
        var status = getTrayStatus(deviceType);
        var replyMsg = genMsg(err, status);
        bot.reply(message, replyMsg);
    });
});


// CD-ROMドライブの検索
controller.hears(['devices'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var replyMsg = searchDevice();
    bot.reply(message, replyMsg);
});


// CD-ROMドライブのトレイの開閉状態を確認
controller.hears(['status (.*)'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var deviceType = message.match[1]; // (.*) を取得
    var result = getTrayStatus(deviceType);
    bot.reply(message, result);
});


/**
 *
 */
function searchDevice() {
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
        return replyMsg;
    });
}


/**
 *
 * @param deviceType
 */
function getTrayStatus(deviceType) {
    /**
     * https://www.linuxquestions.org/questions/slackware-14/detect-cd-tray-status-4175450610/
     * を参考にしてrpi内で作成したtraystatusコマンドを実行する
     */
    var cmd = 'traystatus ' + deviceType + ' && echo 1';
    var result;

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

        console.log("buffer: " + buf);
        if (buf.match(/1/)) {
            result = "開いてる";
        } else {
            result = "閉まってる";
        }
        return result;
    });
}


/**
 * リプライメッセージ生成
 * @param err
 * @param stdout
 * @returns {string}
 */
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
