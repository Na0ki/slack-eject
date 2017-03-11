'use strict';

var Botkit = require('botkit');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var Promise = require('bluebird');


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

const controller = Botkit.slackbot({
    debug: true
});


// 接続
controller.spawn({
    token: process.env.token
}).startRTM(function (err, bot, payload) {
    console.log("bot" + bot);
    console.log("payload" + payload);

    // 初期処理
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});


/**
 * Eject実行
 */
controller.hears(['(ういーん|ウイーン|(☝ ՞ਊ ՞)☝)'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // var deviceType = message.text.match[1];
    // console.log("deviceType: ", deviceType);
    //
    // if (deviceType != null && !deviceType.match(/\/dev\//)) {
    //     bot.reply(message, "Usage: eject /dev/foo");
    //     return;
    // }

    // ejectコマンド実行
    exec('eject -T /dev/cdrom', function (err, stdout) {
        if (err) {
            console.error(err);
            bot.reply(message, "失敗…");
        } else {
            console.log(stdout);
            bot.reply(message, "成功！");
        }
        // var cmd = 'traystatus ' + deviceType + ' && echo 1';
        //
        // execCmd(cmd)
        //     .then(function (res, err) {
        //         var replyMsg = res.match(/1/) ? "開いてる" : "閉まってる";
        //         bot.reply(message, genMsg(err, replyMsg));
        //     })
        //     .catch(function (err) {
        //         console.error(err);
        //         var replyMsg = "[Error] " + err;
        //         bot.reply(message, replyMsg);
        //     });
    });
});


/**
 * CD-ROMドライブの検索
 */
controller.hears(['^devices (.*)$'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var grepWord = message.match[1];
    var cmd = "ls -l /dev/ | grep " + grepWord;

    execCmd(cmd).then(function (res, err) {
        if (err) {
            console.error(err);
            bot.reply(message, "Error Occurred on Eject");
            return;
        }

        var replyMsg = genMsg(undefined, res);
        if (res.length == 0) {
            replyMsg = "( ՞ةڼ◔)oO( CD-ROMドライブが見つからないぽよ )";
        }

        bot.reply(message, replyMsg);
    });
});


/**
 * CD-ROMドライブのトレイの開閉状態を確認
 */
// controller.hears(['status (.*)', 'Status (.*)'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
//
//     var deviceType = message.match[1]; // (.*) を取得
//     if (!deviceType.match(/\/dev\//)) {
//         bot.reply(message, "Usage: status /dev/hoge");
//         return;
//     }
//
//     /**
//      * https://www.linuxquestions.org/questions/slackware-14/detect-cd-tray-status-4175450610/
//      * を参考にしてrpi内で作成したtraystatusコマンドを実行する
//      */
//     var cmd = 'traystatus ' + deviceType + ' && echo 1';
//
//     execCmd(cmd)
//         .then(function (res, err) {
//             var replyMsg = "";
//             if (err) {
//                 replyMsg = "[Error] " + err;
//                 console.log(replyMsg);
//                 bot.reply(message, replyMsg);
//                 return;
//             }
//             console.log("buffer: " + res);
//             if (res.match(/1/)) {
//                 replyMsg = "開いてる";
//             } else {
//                 replyMsg = "閉まってる";
//             }
//             bot.reply(message, replyMsg);
//         })
//         .catch(function (err) {
//             console.log(err);
//             var replyMsg = "[Error] " + err;
//             bot.reply(message, replyMsg);
//         });
// });


/**
 * コマンドを実行する
 * @param cmd 実行コマンド
 * @returns {Promise}
 */
function execCmd(cmd) {
    return new Promise(function (resolve, reject) {
        var child = shSpawn(cmd);
        var buf = ""; // 実行結果を格納するバッファ

        child.stdout.on('data', function (data) {
            buf = buf + data;
        });

        child.stderr.on('data', function (data) {
            console.log('exec error: ' + data);
            reject(data);
        });

        child.on('close', function (code) {
            console.info(code);
            resolve(buf);
        });
    });
}

/**
 * コマンドを実行する
 * @param command
 */
function shSpawn(command) {
    return spawn('sh', ['-c', command]);
}


/**
 * リプライメッセージ生成
 * @param err
 * @param msg
 * @returns {string} メッセージ
 */
function genMsg(err, msg) {
    var replyMsg = "";
    if (err) {
        replyMsg = '[Error]\n( ՞ةڼ◔)oO(\n' + err + '\n)';
    } else {
        var message = (msg.length == 0) ? "" : msg;
        replyMsg = '[Success]\n( ՞ਊ ՞)oO( ' + message + ' )';
    }
    return replyMsg;
}
