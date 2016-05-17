# Slack-Eject

## 依存関係
* node: v6.1.0

## インストール方法
```
$ git clone https://github.com/Na0ki/slack-eject.git
$ cd slack-eject
$ npm install
```

## 使い方
### サーバ
* `config.js` を編集し, `YOUR_BOT_TOKEN` をSlackで取得したbotのトークンに置き換える.

* 実行
```
$ node app.js
```

### クライアント(Slack)
自分で作ったbotに対し, 以下のコマンドが有効です.
* devices  
CD-ROMドライブのデバイスを検索するコマンド.  
`ls -l /dev/ | grep cdrom` を内部で実行している.

* eject DEVICE_NAME  
ejectコマンドを実行する. `DEVICE_NAME` は任意のデバイス名.  
なお, 開発者はうっかりCD-ROMドライブ以外を意図せずejectしてしまう場合があることから, app.js側で名前にcdromが含まれている場合のみ実行するようにしてある.


## License
[LICENSE](/LICENSE)